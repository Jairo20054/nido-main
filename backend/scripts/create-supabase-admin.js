const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { createClient } = require('@supabase/supabase-js');

const email = process.argv[2] || process.env.ADMIN_EMAIL;
const password = process.argv[3] || process.env.ADMIN_PASSWORD;
const firstName = process.argv[4] || 'Admin';
const lastName = process.argv[5] || 'QA';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
const supabaseServiceKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Faltan SUPABASE_URL o SUPABASE_SECRET_KEY/SUPABASE_SERVICE_ROLE_KEY en el entorno.');
  console.error('Configura estas variables en el archivo .env de la raiz del proyecto.');
  process.exit(1);
}

if (!email || !password) {
  console.error('Uso: node backend/scripts/create-supabase-admin.js <email> <password> [firstName] [lastName]');
  console.error('Tambien puedes definir ADMIN_EMAIL y ADMIN_PASSWORD en el entorno.');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

const supabasePublic = supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    })
  : null;

async function ensureAdminRole(userId, userEmail) {
  const profilePayload = {
    id: userId,
    email: userEmail,
    first_name: firstName,
    last_name: lastName,
    locale: 'es-CO',
    country_code: 'CO',
    timezone: 'America/Bogota',
    primary_role: 'admin',
    status: 'active',
  };

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert([profilePayload], { onConflict: 'id' });

  if (profileError) {
    throw new Error(`No se pudo asegurar el perfil admin: ${profileError.message}`);
  }

  const { data: existingRole, error: roleReadError } = await supabaseAdmin
    .from('roles')
    .select('id')
    .eq('profile_id', userId)
    .eq('role_key', 'admin')
    .eq('scope_type', 'global')
    .limit(1)
    .maybeSingle();

  if (roleReadError) {
    throw new Error(`No se pudo verificar el rol admin: ${roleReadError.message}`);
  }

  if (!existingRole) {
    const { error: roleInsertError } = await supabaseAdmin
      .from('roles')
      .insert([
        {
          profile_id: userId,
          role_key: 'admin',
          scope_type: 'global',
          scope_id: null,
          status: 'active',
          granted_by: null,
        },
      ]);

    if (roleInsertError) {
      throw new Error(`No se pudo asignar el rol admin: ${roleInsertError.message}`);
    }
  }
}

async function createUser() {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      firstName,
      lastName,
      role: 'admin',
      locale: 'es-CO',
      countryCode: 'CO',
      timezone: 'America/Bogota',
    },
  });

  if (error) {
    throw new Error(`No se pudo crear el usuario: ${error.message}`);
  }

  return data.user;
}

async function verifyPasswordLogin() {
  if (!supabasePublic) {
    return { skipped: true, reason: 'SUPABASE_ANON_KEY/SUPABASE_PUBLISHABLE_KEY no configurada' };
  }

  const { data, error } = await supabasePublic.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    throw new Error(`El usuario se creo, pero el login fallo: ${error?.message || 'sin sesion'}`);
  }

  const { data: profile, error: profileError } = await supabasePublic
    .from('profiles')
    .select('id,email,first_name,last_name,primary_role,status')
    .eq('id', data.user.id)
    .single();

  if (profileError) {
    throw new Error(`El login funciono, pero no se pudo leer el perfil: ${profileError.message}`);
  }

  return {
    skipped: false,
    userId: data.user.id,
    profile,
  };
}

async function main() {
  const user = await createUser();
  await ensureAdminRole(user.id, user.email);
  const verification = await verifyPasswordLogin();

  console.log('Usuario admin creado correctamente.');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`User ID: ${user.id}`);

  if (verification.skipped) {
    console.log(`Verificacion login: omitida (${verification.reason})`);
    return;
  }

  console.log('Verificacion login: OK');
  console.log(`Rol en profile: ${verification.profile.primary_role}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
