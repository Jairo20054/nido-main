const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env');
const exampleEnvPath = path.join(rootDir, '.env.example');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath, override: false });
} else {
  dotenv.config();
}

if (
  process.env.NODE_ENV !== 'production' &&
  !process.env.SUPABASE_URL &&
  !process.env.VITE_SUPABASE_URL &&
  fs.existsSync(exampleEnvPath)
) {
  dotenv.config({ path: exampleEnvPath, override: false });
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const serviceRoleKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  '';
const adminAlias = (
  process.env.SUPER_ADMIN_LOGIN_ALIAS ||
  process.env.ADMIN_LOGIN_ALIAS ||
  process.env.VITE_SUPER_ADMIN_LOGIN_ALIAS ||
  process.env.VITE_ADMIN_LOGIN_ALIAS ||
  'superadmin'
).trim().toLowerCase();
const adminEmail = (
  process.env.SUPER_ADMIN_LOGIN_EMAIL ||
  process.env.ADMIN_LOGIN_EMAIL ||
  process.env.VITE_SUPER_ADMIN_LOGIN_EMAIL ||
  process.env.VITE_ADMIN_LOGIN_EMAIL ||
  'admin@nido.local'
).trim().toLowerCase();
const adminPassword = process.env.SUPER_ADMIN_LOGIN_PASSWORD || process.env.ADMIN_LOGIN_PASSWORD || '';

const hasPlaceholderUrl = /your-project\.supabase\.co/i.test(supabaseUrl);
const hasPlaceholderKey = /^your-(anon|publishable|secret|service)/i.test(serviceRoleKey.trim());

if (!supabaseUrl || !serviceRoleKey || hasPlaceholderUrl || hasPlaceholderKey) {
  throw new Error(
    'Faltan credenciales reales de Supabase. Define SUPABASE_URL y SUPABASE_SECRET_KEY/SUPABASE_SERVICE_ROLE_KEY validos en .env antes de crear el admin.'
  );
}

if (adminPassword.length < 8) {
  throw new Error('Define SUPER_ADMIN_LOGIN_PASSWORD o ADMIN_LOGIN_PASSWORD con al menos 8 caracteres.');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
});

const buildMetadata = () => ({
  first_name: 'Admin',
  last_name: 'Nido',
  full_name: 'Admin Nido',
  phone: null,
  access_alias: adminAlias,
  country_code: null,
  locale: 'es',
  timezone: 'America/Bogota',
});

const getExistingProfile = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, auth_id, email')
    .eq('email', adminEmail)
    .maybeSingle();

  if (error) {
    throw new Error(`No fue posible consultar el perfil admin: ${error.message}`);
  }

  return data;
};

const findAuthUserByEmail = async () => {
  let page = 1;

  while (page <= 100) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });

    if (error) {
      throw new Error(`No fue posible consultar los usuarios de auth: ${error.message}`);
    }

    const match = data.users.find((user) => String(user.email || '').trim().toLowerCase() === adminEmail);

    if (match) {
      return match;
    }

    if (!data.nextPage || data.nextPage === page) {
      return null;
    }

    page = data.nextPage;
  }

  return null;
};

const getAuthUserById = async (userId) => {
  const { data, error } = await supabase.auth.admin.getUserById(userId);

  if (error) {
    return null;
  }

  return data.user || null;
};

const createOrUpdateAuthUser = async () => {
  const existingProfile = await getExistingProfile();
  const existingAuthUser = existingProfile?.auth_id
    ? await getAuthUserById(existingProfile.auth_id)
    : await findAuthUserByEmail();
  const metadata = buildMetadata();

  if (existingAuthUser?.id) {
    const userId = existingAuthUser.id;
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: metadata,
      app_metadata: {
        role: 'ADMIN',
        access_alias: adminAlias,
      },
    });

    if (error) {
      throw new Error(`No fue posible actualizar el usuario admin: ${error.message}`);
    }

    return data.user;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: metadata,
    app_metadata: {
      role: 'ADMIN',
      access_alias: adminAlias,
    },
  });

  if (error) {
    throw new Error(`No fue posible crear el usuario admin: ${error.message}`);
  }

  return data.user;
};

const upsertProfile = async (userId) => {
  const { error } = await supabase.from('profiles').upsert(
    {
      id: userId,
      auth_id: userId,
      email: adminEmail,
      full_name: 'Admin Nido',
      first_name: 'Admin',
      last_name: 'Nido',
      phone: null,
      role: 'admin',
      country_code: null,
      locale: 'es',
      timezone: 'America/Bogota',
    },
    {
      onConflict: 'auth_id',
    }
  );

  if (error) {
    throw new Error(`No fue posible sincronizar el perfil admin: ${error.message}`);
  }
};

const grantPlatformAdmin = async (userId) => {
  const { error } = await supabase.from('platform_admins').upsert(
    {
      auth_user_id: userId,
      profile_id: userId,
      note: `Bootstrap super admin alias=${adminAlias}`,
    },
    {
      onConflict: 'auth_user_id',
    }
  );

  if (error) {
    throw new Error(`No fue posible otorgar privilegios admin: ${error.message}`);
  }
};

const main = async () => {
  const user = await createOrUpdateAuthUser();

  if (!user?.id) {
    throw new Error('Supabase no devolvio el identificador del usuario admin.');
  }

  await upsertProfile(user.id);
  await grantPlatformAdmin(user.id);

  console.log(
    JSON.stringify(
      {
        ok: true,
        alias: adminAlias,
        email: adminEmail,
        userId: user.id,
        role: 'SUPER_ADMIN(platform-admin)',
        message: 'Usuario super admin listo para iniciar sesion.',
      },
      null,
      2
    )
  );
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
