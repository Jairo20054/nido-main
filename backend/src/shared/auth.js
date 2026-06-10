const { badRequest, forbidden, serviceUnavailable, unauthorized } = require('./errors');
const { supabaseAnon } = require('./supabase');
const { supabaseAdmin } = require('./supabaseAdmin');

// Capa transversal de autenticacion/autorizacion. Supabase Auth valida la identidad
// y Supabase Postgres conserva el perfil operativo que usa el resto del dominio.
const ALLOWED_SELF_ASSIGNED_ROLES = ['TENANT', 'LANDLORD'];
const ADMIN_SELECT = ['auth_user_id', 'profile_id'].join(', ');
const PROFILE_TABLE = 'profiles';
const PROFILE_SELECT = [
  'id',
  'email',
  'first_name',
  'last_name',
  'phone',
  'bio',
  'avatar_url',
  'role',
  'country_code',
  'locale',
  'timezone',
  'created_at',
  'updated_at',
].join(', ');

// Extrae el bearer token desde el header Authorization si existe.
const extractToken = (req) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null;
  }

  return authorization.slice(7);
};

// Protege el dominio de roles contra valores arbitrarios provenientes de metadata externa.
const safeRole = (role, fallback = 'TENANT') => {
  if (typeof role !== 'string') {
    return fallback;
  }

  const normalized = role.toUpperCase();
  return ['ADMIN', 'LANDLORD', 'TENANT'].includes(normalized) ? normalized : fallback;
};

const roleToProfileDb = (role) => safeRole(role, 'TENANT').toLowerCase();

const getAppRole = (authUser, fallback = 'TENANT') =>
  safeRole(authUser?.app_metadata?.role, fallback);

// user_metadata es editable por el usuario: solo sirve para roles publicos de alta,
// nunca para conceder privilegios administrativos.
const getSelfAssignedRole = (authUser, fallback = 'TENANT') =>
  safeRole(authUser?.user_metadata?.role, fallback);

const isAuthAdmin = (authUser) => getAppRole(authUser, 'TENANT') === 'ADMIN';

// Deriva nombre y apellido cuando la metadata de autenticacion llega incompleta.
const deriveNameParts = (user) => {
  const metadata = user.user_metadata || {};
  const fullName = String(metadata.full_name || metadata.name || '').trim();
  const [firstFromFullName, ...rest] = fullName.split(/\s+/).filter(Boolean);
  const firstName = String(metadata.first_name || metadata.firstName || firstFromFullName || '').trim();
  const lastName = String(metadata.last_name || metadata.lastName || rest.join(' ') || '').trim();
  const emailLocalPart = String(user.email || '').split('@')[0] || 'user';

  return {
    firstName: firstName || emailLocalPart || 'Usuario',
    lastName: lastName || 'Nido',
  };
};

// Traduce el usuario autenticado al shape operativo esperado por la API.
const profilePayloadFromAuthUser = (authUser) => {
  const metadata = authUser.user_metadata || {};
  const { firstName, lastName } = deriveNameParts(authUser);
  const selfAssignedRole = getSelfAssignedRole(authUser, 'TENANT');

  return {
    firstName,
    lastName,
    phone: metadata.phone || null,
    bio: metadata.bio || null,
    avatarUrl: metadata.avatar_url || metadata.avatarUrl || null,
    role: ALLOWED_SELF_ASSIGNED_ROLES.includes(selfAssignedRole) ? selfAssignedRole : 'TENANT',
    email: authUser.email,
    countryCode: metadata.country_code || metadata.countryCode || null,
    locale: metadata.locale || null,
    timezone: metadata.timezone || null,
  };
};

const requireSupabaseAdmin = () => {
  if (!supabaseAdmin) {
    throw serviceUnavailable('Supabase de administración no está configurado en el servidor');
  }

  return supabaseAdmin;
};

const profileRowToUser = (profile) => {
  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    email: profile.email,
    firstName: profile.firstName ?? profile.first_name ?? '',
    lastName: profile.lastName ?? profile.last_name ?? '',
    phone: profile.phone ?? null,
    bio: profile.bio ?? null,
    avatarUrl: profile.avatarUrl ?? profile.avatar_url ?? null,
    role: safeRole(profile.role, 'TENANT'),
    countryCode: profile.countryCode ?? profile.country_code ?? null,
    locale: profile.locale ?? null,
    timezone: profile.timezone ?? null,
    createdAt: profile.createdAt ?? profile.created_at ?? null,
    updatedAt: profile.updatedAt ?? profile.updated_at ?? null,
  };
};

const profileInsertFromAuthUser = (authUser, authPayload) => ({
  id: authUser.id,
  auth_id: authUser.id,
  email: authUser.email || authPayload.email,
  full_name: `${authPayload.firstName || ''} ${authPayload.lastName || ''}`.trim(),
  first_name: authPayload.firstName,
  last_name: authPayload.lastName,
  phone: authPayload.phone,
  bio: authPayload.bio,
  avatar_url: authPayload.avatarUrl,
  role: roleToProfileDb(authPayload.role),
  country_code: authPayload.countryCode,
  locale: authPayload.locale,
  timezone: authPayload.timezone,
});

const profilePatchToRow = (patch) => {
  const row = {};

  if (patch.email !== undefined) row.email = patch.email;
  if (patch.firstName !== undefined) row.first_name = patch.firstName;
  if (patch.lastName !== undefined) row.last_name = patch.lastName;
  if (patch.phone !== undefined) row.phone = patch.phone;
  if (patch.bio !== undefined) row.bio = patch.bio;
  if (patch.avatarUrl !== undefined) row.avatar_url = patch.avatarUrl;

  return row;
};

const isMissingSupabaseRelation = (error) =>
  ['PGRST116', '42P01', '42703'].includes(error?.code) ||
  /relation .* does not exist|column .* does not exist/i.test(error?.message || '');

const safeSupabaseMutation = async (query, message) => {
  const { error } = await query;

  if (!error) {
    return;
  }

  if (isMissingSupabaseRelation(error)) {
    console.warn(`[Nido Auth] ${message}: esquema no disponible (${error.message})`);
    return;
  }

  throw serviceUnavailable(message);
};

const ensureSupabaseRoleRows = async (profile) => {
  if (!profile?.id) {
    return;
  }

  const client = requireSupabaseAdmin();
  const normalizedRole = safeRole(profile.role, 'TENANT');

  if (normalizedRole === 'LANDLORD' || normalizedRole === 'ADMIN') {
    await safeSupabaseMutation(
      client
        .from('landlords')
        .upsert(
          {
            id: profile.id,
            profile_id: profile.id,
          },
          { onConflict: 'profile_id' }
        ),
      'No fue posible sincronizar el perfil de arrendador en Supabase'
    );
  }

  if (normalizedRole === 'TENANT') {
    await safeSupabaseMutation(
      client
        .from('tenants')
        .upsert(
          {
            id: profile.id,
            profile_id: profile.id,
          },
          { onConflict: 'profile_id' }
        ),
      'No fue posible sincronizar el perfil de arrendatario en Supabase'
    );
  }
};

const fetchProfileById = async (profileId) => {
  const client = requireSupabaseAdmin();
  const { data, error } = await client
    .from(PROFILE_TABLE)
    .select(PROFILE_SELECT)
    .eq('id', profileId)
    .maybeSingle();

  if (error) {
    throw serviceUnavailable('No fue posible cargar tu perfil desde Supabase');
  }

  return profileRowToUser(data);
};

// Crea la fila del perfil en Supabase si aun no existe y completa datos basicos
// sin sobrescribir cambios editados desde la app.
const ensureProfile = async (authUser) => {
  if (!authUser) {
    return null;
  }

  const client = requireSupabaseAdmin();
  const authPayload = profilePayloadFromAuthUser(authUser);
  let syncedProfile = await fetchProfileById(authUser.id);

  if (!syncedProfile) {
    const { data, error } = await client
      .from(PROFILE_TABLE)
      .insert(profileInsertFromAuthUser(authUser, authPayload))
      .select(PROFILE_SELECT)
      .single();

    if (error) {
      if (error.code === '23505') {
        const existingProfile = await fetchProfileById(authUser.id);

        if (!existingProfile) {
          throw serviceUnavailable('No fue posible crear tu perfil en Supabase por un conflicto de datos');
        }

        await ensureSupabaseRoleRows(existingProfile);
        return existingProfile;
      }

      throw serviceUnavailable('No fue posible crear tu perfil en Supabase');
    }

    const createdProfile = profileRowToUser(data);
    await ensureSupabaseRoleRows(createdProfile);
    return createdProfile;
  }
  const patch = {};

  if (!syncedProfile.firstName && authPayload.firstName) {
    patch.firstName = authPayload.firstName;
  }

  if (!syncedProfile.lastName && authPayload.lastName) {
    patch.lastName = authPayload.lastName;
  }

  if (!syncedProfile.phone && authPayload.phone) {
    patch.phone = authPayload.phone;
  }

  if (!syncedProfile.bio && authPayload.bio) {
    patch.bio = authPayload.bio;
  }

  if (!syncedProfile.avatarUrl && authPayload.avatarUrl) {
    patch.avatarUrl = authPayload.avatarUrl;
  }

  if (!Object.keys(patch).length) {
    await ensureSupabaseRoleRows(syncedProfile);
    return syncedProfile;
  }

  const { data, error } = await client
    .from(PROFILE_TABLE)
    .update({
      ...profilePatchToRow(patch),
      updated_at: new Date().toISOString(),
    })
    .eq('id', authUser.id)
    .select(PROFILE_SELECT)
    .single();

  if (error) {
    throw serviceUnavailable('No fue posible actualizar tu perfil en Supabase');
  }

  const updatedProfile = profileRowToUser(data);
  await ensureSupabaseRoleRows(updatedProfile);
  return updatedProfile;
};

const tryAdminQuery = async (query) => {
  const { data, error } = await query;

  if (error) {
    return null;
  }

  return data || null;
};

// Lee grants administrativos desde el schema vivo de Supabase sin bloquear el
// login si una tabla/columna pertenece a una migracion no aplicada.
const fetchPlatformAdmin = async (authUserId) => {
  if (!supabaseAdmin) {
    return null;
  }

  const platformGrant = await tryAdminQuery(
    supabaseAdmin
      .from('platform_admins')
      .select(ADMIN_SELECT)
      .or(`auth_user_id.eq.${authUserId},profile_id.eq.${authUserId}`)
      .limit(1)
      .maybeSingle()
  );

  if (platformGrant) {
    return platformGrant;
  }

  const legacyProfileRole = await tryAdminQuery(
    supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('id', authUserId)
      .eq('role', 'admin')
      .limit(1)
      .maybeSingle()
  );

  if (legacyProfileRole) {
    return { auth_user_id: authUserId, profile_id: authUserId };
  }

  const accountProfileRole = await tryAdminQuery(
    supabaseAdmin
      .from('profiles')
      .select('id, primary_role')
      .eq('id', authUserId)
      .eq('primary_role', 'admin')
      .limit(1)
      .maybeSingle()
  );

  if (accountProfileRole) {
    return { auth_user_id: authUserId, profile_id: authUserId };
  }

  const roleGrant = await tryAdminQuery(
    supabaseAdmin
      .from('roles')
      .select('profile_id, role_key')
      .eq('profile_id', authUserId)
      .eq('role_key', 'admin')
      .eq('status', 'active')
      .limit(1)
      .maybeSingle()
  );

  if (roleGrant) {
    return { auth_user_id: authUserId, profile_id: authUserId };
  }

  return null;
};

// Enriquece el perfil con permisos administrativos otorgados por plataforma.
const decorateProfile = async (authUser, profile) => {
  const isAdminGrant = await fetchPlatformAdmin(authUser.id);
  const hasAdminPrivileges = Boolean(isAdminGrant) || isAuthAdmin(authUser);

  return {
    ...profile,
    role: hasAdminPrivileges ? 'ADMIN' : safeRole(profile?.role, 'TENANT'),
    isPlatformAdmin: hasAdminPrivileges,
  };
};

// Carga el usuario autenticado en req.user, ya sea como requisito estricto u opcional.
const attachUser = async (req, strict) => {
  const token = extractToken(req);

  if (!token) {
    if (strict) {
      throw unauthorized();
    }

    req.user = null;
    return;
  }

  if (!supabaseAnon) {
    if (strict) {
      throw unauthorized('Supabase no está configurado en el servidor');
    }

    req.user = null;
    return;
  }

  let userData;

  try {
    const { data, error } = await supabaseAnon.auth.getUser(token);

    if (error) {
      throw error;
    }

    userData = data;
  } catch (err) {
    console.error('[Nido Auth] No se pudo verificar el token con Supabase:', err.message);
    throw serviceUnavailable(
      'El servicio de autenticación no está disponible. Intenta de nuevo en unos segundos.'
    );
  }

  if (!userData?.user) {
    if (strict) {
      throw unauthorized('Tu sesión expiró o no es válida');
    }

    req.user = null;
    return;
  }

  try {
    const profile = await ensureProfile(userData.user);

    if (!profile) {
      throw serviceUnavailable('No fue posible cargar tu perfil. Intenta nuevamente en unos minutos.');
    }

    req.user = await decorateProfile(userData.user, profile);
  } catch (profileError) {
    if (strict) {
      throw profileError?.statusCode
        ? profileError
        : serviceUnavailable('No fue posible cargar tu perfil. Verifica la conexion de la base de datos.');
    }

    req.user = null;
  }
};

// Middlewares y helpers de autorizacion reutilizables por todos los modulos.
const requireAuth = async (req, _res, next) => {
  try {
    await attachUser(req, true);
    next();
  } catch (error) {
    next(error);
  }
};

const optionalAuth = async (req, _res, next) => {
  try {
    await attachUser(req, false);
    next();
  } catch (error) {
    next(error);
  }
};

const requireRoles = (...roles) => [
  requireAuth,
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(forbidden('No tienes permisos para acceder a este recurso'));
    }

    return next();
  },
];

const requireAdmin = requireRoles('ADMIN');

const assertOwnershipOrAdmin = (reqUser, ownerId) => {
  if (!reqUser) {
    throw unauthorized();
  }

  if (reqUser.role !== 'ADMIN' && reqUser.id !== ownerId) {
    throw forbidden();
  }
};

const deleteAuthUser = async (userId) => {
  if (!supabaseAdmin) {
    throw badRequest('Supabase de administración no está configurado en el servidor');
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    throw badRequest(error.message);
  }
};

module.exports = {
  assertOwnershipOrAdmin,
  decorateProfile,
  deleteAuthUser,
  ensureProfile,
  fetchPlatformAdmin,
  optionalAuth,
  requireAdmin,
  requireAuth,
  requireRoles,
};
