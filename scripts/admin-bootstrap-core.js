const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

const rootDir = path.resolve(__dirname, '..');

const loadRootEnv = () => {
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
};

const clean = (value) => String(value || '').trim();
const cleanLower = (value) => clean(value).toLowerCase();

const uniq = (values) => [...new Set(values.map(cleanLower).filter(Boolean))];

const hasPlaceholder = (value) =>
  /your-project\.supabase\.co/i.test(String(value || '')) ||
  /^your-(anon|publishable|secret|service)/i.test(clean(value));

const createServerClient = (supabaseUrl, key) =>
  createClient(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

const resolveAdminConfig = (overrides = {}) => {
  loadRootEnv();

  const aliases = uniq([
    overrides.alias,
    process.env.ADMIN_LOGIN_ALIAS,
    process.env.VITE_ADMIN_LOGIN_ALIAS,
    process.env.SUPER_ADMIN_LOGIN_ALIAS,
    process.env.VITE_SUPER_ADMIN_LOGIN_ALIAS,
    'admin',
  ]);

  return {
    supabaseUrl: clean(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL),
    serviceRoleKey: clean(
      process.env.SUPABASE_SECRET_KEY ||
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_SERVICE_KEY
    ),
    anonKey: clean(
      process.env.SUPABASE_PUBLISHABLE_KEY ||
        process.env.SUPABASE_ANON_KEY ||
        process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
        process.env.VITE_SUPABASE_ANON_KEY
    ),
    aliases,
    primaryAlias: aliases[0] || 'admin',
    email: cleanLower(
      overrides.email ||
        process.env.ADMIN_LOGIN_EMAIL ||
        process.env.VITE_ADMIN_LOGIN_EMAIL ||
        process.env.SUPER_ADMIN_LOGIN_EMAIL ||
        process.env.VITE_SUPER_ADMIN_LOGIN_EMAIL ||
        'admin@nido.local'
    ),
    password: clean(
      overrides.password ||
        process.env.ADMIN_LOGIN_PASSWORD ||
        process.env.SUPER_ADMIN_LOGIN_PASSWORD ||
        process.env.ADMIN_PASSWORD
    ),
    firstName: clean(overrides.firstName || process.env.ADMIN_FIRST_NAME || 'Admin'),
    lastName: clean(overrides.lastName || process.env.ADMIN_LAST_NAME || 'Nido'),
  };
};

const assertConfig = (config) => {
  if (
    !config.supabaseUrl ||
    !config.serviceRoleKey ||
    hasPlaceholder(config.supabaseUrl) ||
    hasPlaceholder(config.serviceRoleKey)
  ) {
    throw new Error(
      'Faltan credenciales reales de Supabase. Define SUPABASE_URL y SUPABASE_SECRET_KEY/SUPABASE_SERVICE_ROLE_KEY validos en .env.'
    );
  }

  if (!config.email) {
    throw new Error('Define ADMIN_LOGIN_EMAIL con el correo real del administrador.');
  }

  if (config.password.length < 8) {
    throw new Error('Define ADMIN_LOGIN_PASSWORD con al menos 8 caracteres.');
  }
};

const canSelect = async (client, table, columns) => {
  const { error } = await client.from(table).select(columns).limit(1);
  return !error;
};

const detectSchema = async (client) => ({
  profileHasAuthId: await canSelect(client, 'profiles', 'auth_id'),
  profileHasFullName: await canSelect(client, 'profiles', 'full_name'),
  profileHasRole: await canSelect(client, 'profiles', 'role'),
  profileHasPrimaryRole: await canSelect(client, 'profiles', 'primary_role'),
  profileHasStatus: await canSelect(client, 'profiles', 'status'),
  hasPlatformAdmins: await canSelect(client, 'platform_admins', 'auth_user_id,profile_id,note'),
  hasRoles: await canSelect(client, 'roles', 'profile_id,role_key,scope_type,status'),
});

const getExistingProfile = async (client, schema, email) => {
  const columns = ['id', 'email'];

  if (schema.profileHasAuthId) {
    columns.push('auth_id');
  }

  const { data, error } = await client
    .from('profiles')
    .select(columns.join(','))
    .eq('email', email)
    .limit(1)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data || null;
};

const findAuthUserByEmail = async (client, email) => {
  let page = 1;
  const perPage = 1000;

  while (page <= 100) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage });

    if (error) {
      throw new Error(`No fue posible consultar los usuarios de Auth: ${error.message}`);
    }

    const users = data?.users || [];
    const match = users.find((user) => cleanLower(user.email) === email);

    if (match) {
      return match;
    }

    if (users.length < perPage) {
      return null;
    }

    page += 1;
  }

  return null;
};

const getAuthUserById = async (client, userId) => {
  if (!userId) {
    return null;
  }

  const { data, error } = await client.auth.admin.getUserById(userId);
  return error ? null : data?.user || null;
};

const buildUserMetadata = (config) => ({
  first_name: config.firstName,
  firstName: config.firstName,
  last_name: config.lastName,
  lastName: config.lastName,
  full_name: `${config.firstName} ${config.lastName}`.trim(),
  phone: null,
  access_alias: config.primaryAlias,
  access_aliases: config.aliases,
  country_code: 'CO',
  countryCode: 'CO',
  locale: 'es-CO',
  timezone: 'America/Bogota',
  role: 'admin',
});

const buildAppMetadata = (config) => ({
  role: 'ADMIN',
  access_alias: config.primaryAlias,
  access_aliases: config.aliases,
});

const createOrUpdateAuthUser = async (client, schema, config) => {
  const existingProfile = await getExistingProfile(client, schema, config.email);
  const profileAuthId = existingProfile?.auth_id || existingProfile?.id;
  const existingAuthUser =
    (await getAuthUserById(client, profileAuthId)) || (await findAuthUserByEmail(client, config.email));

  const payload = {
    email: config.email,
    password: config.password,
    email_confirm: true,
    user_metadata: buildUserMetadata(config),
    app_metadata: buildAppMetadata(config),
  };

  if (existingAuthUser?.id) {
    const { data, error } = await client.auth.admin.updateUserById(existingAuthUser.id, payload);

    if (error) {
      throw new Error(`No fue posible actualizar el usuario admin: ${error.message}`);
    }

    return data.user;
  }

  const { data, error } = await client.auth.admin.createUser(payload);

  if (error) {
    throw new Error(`No fue posible crear el usuario admin: ${error.message}`);
  }

  return data.user;
};

const upsertProfileWithRole = async (client, payload, options, roleColumn) => {
  const roleValue = payload[roleColumn];
  const attempts =
    roleColumn === 'role' && roleValue === 'admin'
      ? ['admin', 'ADMIN', 'tenant', 'TENANT']
      : roleValue === 'admin'
        ? ['admin', 'ADMIN']
        : [roleValue];
  let lastError = null;

  for (const value of attempts) {
    const { error } = await client.from('profiles').upsert(
      {
        ...payload,
        [roleColumn]: value,
      },
      options
    );

    if (!error) {
      return value;
    }

    lastError = error;
  }

  throw new Error(`No fue posible sincronizar el perfil admin: ${lastError?.message || 'error desconocido'}`);
};

const syncProfile = async (client, schema, config, userId) => {
  const basePayload = {
    id: userId,
    email: config.email,
    first_name: config.firstName,
    last_name: config.lastName,
    phone: null,
    bio: null,
    avatar_url: null,
    country_code: 'CO',
    locale: 'es-CO',
    timezone: 'America/Bogota',
  };

  if (schema.profileHasFullName) {
    basePayload.full_name = `${config.firstName} ${config.lastName}`.trim();
  }

  if (schema.profileHasAuthId) {
    basePayload.auth_id = userId;
  }

  if (schema.profileHasStatus) {
    basePayload.status = 'active';
  }

  if (schema.profileHasPrimaryRole) {
    return upsertProfileWithRole(
      client,
      { ...basePayload, primary_role: 'admin' },
      { onConflict: 'id' },
      'primary_role'
    );
  }

  if (schema.profileHasRole) {
    return upsertProfileWithRole(
      client,
      { ...basePayload, role: 'admin' },
      { onConflict: schema.profileHasAuthId ? 'auth_id' : 'id' },
      'role'
    );
  }

  throw new Error('La tabla profiles no tiene columna role ni primary_role.');
};

const grantPlatformAdmin = async (client, schema, config, userId) => {
  if (!schema.hasPlatformAdmins) {
    return { granted: false, error: null };
  }

  const { error } = await client.from('platform_admins').upsert(
    {
      auth_user_id: userId,
      profile_id: userId,
      note: `Bootstrap admin alias=${config.primaryAlias}`,
    },
    {
      onConflict: 'auth_user_id',
    }
  );

  if (error) {
    return { granted: false, error: error.message };
  }

  return { granted: true, error: null };
};

const grantRole = async (client, schema, userId) => {
  if (!schema.hasRoles) {
    return false;
  }

  const { data, error: readError } = await client
    .from('roles')
    .select('id')
    .eq('profile_id', userId)
    .eq('role_key', 'admin')
    .eq('scope_type', 'global')
    .eq('status', 'active')
    .limit(1)
    .maybeSingle();

  if (readError) {
    throw new Error(`No fue posible verificar roles admin: ${readError.message}`);
  }

  if (data?.id) {
    return true;
  }

  const { error } = await client.from('roles').insert({
    profile_id: userId,
    role_key: 'admin',
    scope_type: 'global',
    scope_id: null,
    status: 'active',
    granted_by: null,
  });

  if (error) {
    throw new Error(`No fue posible insertar el rol admin: ${error.message}`);
  }

  return true;
};

const verifyLogin = async (publicClient, schema, config) => {
  if (!publicClient) {
    return { skipped: true, reason: 'SUPABASE_ANON_KEY/SUPABASE_PUBLISHABLE_KEY no configurada' };
  }

  const { data, error } = await publicClient.auth.signInWithPassword({
    email: config.email,
    password: config.password,
  });

  if (error || !data?.session || !data?.user) {
    throw new Error(`El usuario existe, pero el login real en Supabase fallo: ${error?.message || 'sin sesion'}`);
  }

  const profileColumns = [
    'id',
    'email',
    'first_name',
    'last_name',
    schema.profileHasAuthId ? 'auth_id' : null,
    schema.profileHasRole ? 'role' : null,
    schema.profileHasPrimaryRole ? 'primary_role' : null,
    schema.profileHasStatus ? 'status' : null,
  ]
    .filter(Boolean)
    .join(',');

  const { data: profile, error: profileError } = await publicClient
    .from('profiles')
    .select(profileColumns)
    .eq('id', data.user.id)
    .limit(1)
    .maybeSingle();

  if (profileError || !profile) {
    throw new Error(`El login funciono, pero no se pudo leer el perfil admin: ${profileError?.message || 'sin perfil'}`);
  }

  let platformAdmin = null;

  if (schema.hasPlatformAdmins) {
    const { data: grant, error: grantError } = await publicClient
      .from('platform_admins')
      .select('auth_user_id,profile_id')
      .eq('auth_user_id', data.user.id)
      .limit(1)
      .maybeSingle();

    if (grantError) {
      throw new Error(`El login funciono, pero no se pudo verificar platform_admins: ${grantError.message}`);
    }

    platformAdmin = grant || null;
  }

  await publicClient.auth.signOut();

  return {
    skipped: false,
    userId: data.user.id,
    profile,
    platformAdmin,
  };
};

const bootstrapAdmin = async (overrides = {}) => {
  const config = resolveAdminConfig(overrides);
  assertConfig(config);

  const serviceClient = createServerClient(config.supabaseUrl, config.serviceRoleKey);
  const publicClient =
    config.anonKey && !hasPlaceholder(config.anonKey)
      ? createServerClient(config.supabaseUrl, config.anonKey)
      : null;

  const schema = await detectSchema(serviceClient);
  const user = await createOrUpdateAuthUser(serviceClient, schema, config);

  if (!user?.id) {
    throw new Error('Supabase no devolvio el identificador del usuario admin.');
  }

  const profileRole = await syncProfile(serviceClient, schema, config, user.id);
  const platformAdminGrant = await grantPlatformAdmin(serviceClient, schema, config, user.id);
  const roleGranted = await grantRole(serviceClient, schema, user.id);
  const verification = await verifyLogin(publicClient, schema, config);

  return {
    ok: true,
    alias: config.primaryAlias,
    aliases: config.aliases,
    email: config.email,
    userId: user.id,
    profileRole,
    platformAdminGranted: platformAdminGrant.granted,
    platformAdminError: platformAdminGrant.error,
    roleGranted,
    schema: {
      profileRoleColumn: schema.profileHasPrimaryRole ? 'primary_role' : 'role',
      hasPlatformAdmins: schema.hasPlatformAdmins,
      hasRoles: schema.hasRoles,
    },
    verification,
    message: 'Usuario admin listo para iniciar sesion con una sesion real de Supabase.',
  };
};

module.exports = {
  bootstrapAdmin,
  resolveAdminConfig,
};
