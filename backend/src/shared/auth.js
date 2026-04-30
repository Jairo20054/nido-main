const { badRequest, unauthorized, forbidden } = require('./errors');
const { supabaseAnon, supabaseService } = require('./supabase');

// Capa transversal de autenticacion/autorizacion. Resuelve sesiones de Supabase,
// materializa perfiles de negocio y expone middlewares de control de acceso.
const ALLOWED_SELF_ASSIGNED_ROLES = ['TENANT', 'LANDLORD'];
const PROFILE_SELECT = [
  'id',
  'auth_id',
  'email',
  'first_name',
  'last_name',
  'phone',
  'bio',
  'avatar_url',
  'role',
  'created_at',
  'updated_at',
  'country_code',
  'locale',
  'timezone',
].join(', ');
const ADMIN_SELECT = ['auth_user_id', 'profile_id'].join(', ');

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

const getAuthRole = (authUser, fallback = 'TENANT') =>
  safeRole(authUser?.app_metadata?.role || authUser?.user_metadata?.role, fallback);

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

// Traduce el usuario de Supabase Auth al formato esperado por la tabla de perfiles.
const profilePayloadFromAuthUser = (authUser) => {
  const metadata = authUser.user_metadata || {};
  const appMetadata = authUser.app_metadata || {};
  const { firstName, lastName } = deriveNameParts(authUser);
  const selfAssignedRole = getAuthRole(authUser, 'TENANT');

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
    isPlatformAdmin: safeRole(appMetadata.role, 'TENANT') === 'ADMIN',
  };
};

const buildFallbackProfile = (authUser) => {
  const payload = profilePayloadFromAuthUser(authUser);
  const isPlatformAdmin = safeRole(authUser?.app_metadata?.role, 'TENANT') === 'ADMIN';

  return normalizeProfileRow({
    id: authUser.id,
    auth_id: authUser.id,
    email: authUser.email || payload.email,
    first_name: payload.firstName,
    last_name: payload.lastName,
    phone: payload.phone,
    bio: payload.bio,
    avatar_url: payload.avatarUrl,
    role: isPlatformAdmin ? 'ADMIN' : payload.role,
    country_code: payload.countryCode,
    locale: payload.locale,
    timezone: payload.timezone,
    isPlatformAdmin,
  });
};

// Operaciones auxiliares sobre perfiles y grants administrativos.
const fetchProfile = async (authUserId) => {
  if (!supabaseService) {
    return null;
  }

  const { data, error } = await supabaseService
    .from('profiles')
    .select(PROFILE_SELECT)
    .or(`id.eq.${authUserId},auth_id.eq.${authUserId}`)
    .maybeSingle();

  if (error) {
    throw badRequest(error.message);
  }

  return data || null;
};

const fetchPlatformAdmin = async (authUserId) => {
  if (!supabaseService) {
    return null;
  }

  const { data, error } = await supabaseService
    .from('platform_admins')
    .select(ADMIN_SELECT)
    .or(`auth_user_id.eq.${authUserId},profile_id.eq.${authUserId}`)
    .maybeSingle();

  if (error) {
    throw badRequest(error.message);
  }

  return data || null;
};

const normalizeProfileRow = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    auth_id: row.auth_id || row.id,
    email: row.email || null,
    firstName: row.first_name || '',
    lastName: row.last_name || '',
    phone: row.phone || null,
    bio: row.bio || null,
    avatarUrl: row.avatar_url || null,
    role: safeRole(row.role, 'TENANT'),
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
    countryCode: row.country_code || null,
    locale: row.locale || null,
    timezone: row.timezone || null,
  };
};

// Inserta o actualiza el perfil persistido a partir del usuario autenticado.
const upsertProfile = async (authUser, existingProfile = null) => {
  const payload = profilePayloadFromAuthUser(authUser);
  const baseData = {
    id: authUser.id,
    auth_id: authUser.id,
    email: authUser.email || payload.email,
    first_name: payload.firstName,
    last_name: payload.lastName,
    phone: payload.phone,
    bio: payload.bio,
    avatar_url: payload.avatarUrl,
    role: payload.role,
    country_code: payload.countryCode,
    locale: payload.locale,
    timezone: payload.timezone,
  };

  if (!supabaseService) {
    return null;
  }

  if (existingProfile) {
    const { data, error } = await supabaseService
      .from('profiles')
      .update(baseData)
      .or(`id.eq.${authUser.id},auth_id.eq.${authUser.id}`)
      .select(PROFILE_SELECT)
      .maybeSingle();

    if (error) {
      throw badRequest(error.message);
    }

    return normalizeProfileRow(data);
  }

  const { data, error } = await supabaseService
    .from('profiles')
    .insert(baseData)
    .select(PROFILE_SELECT)
    .maybeSingle();

  if (error) {
    throw badRequest(error.message);
  }

  return normalizeProfileRow(data);
};

// Garantiza que todo usuario autenticado tenga un perfil de negocio asociado.
const ensureProfile = async (authUser) => {
  if (!authUser) {
    return null;
  }

  const existingProfile = await fetchProfile(authUser.id);

  if (existingProfile) {
    return normalizeProfileRow(existingProfile);
  }

  if (supabaseService) {
    return upsertProfile(authUser);
  }

  return buildFallbackProfile(authUser);
};

// Enriquece el perfil con permisos administrativos otorgados por plataforma.
const decorateProfile = async (authUser, profile) => {
  const isAdminGrant = await fetchPlatformAdmin(authUser.id);
  const isAuthAdmin = safeRole(authUser?.app_metadata?.role, profile?.role) === 'ADMIN';

  return {
    ...profile,
    role: isAdminGrant || isAuthAdmin ? 'ADMIN' : profile.role,
    isPlatformAdmin: Boolean(isAdminGrant) || isAuthAdmin,
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

  try {
    if (!supabaseAnon) {
      throw unauthorized('Supabase no esta configurado en el servidor');
    }

    const { data, error } = await supabaseAnon.auth.getUser(token);

    if (error || !data?.user) {
      throw unauthorized('Tu sesion expiro o no es valida');
    }

    const profile = await ensureProfile(data.user);

    if (!profile) {
      throw unauthorized('No fue posible cargar tu perfil');
    }

    req.user = await decorateProfile(data.user, profile);
  } catch (error) {
    if (strict) {
      throw error?.statusCode ? error : unauthorized('Tu sesion expiro o no es valida');
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
  if (!supabaseService) {
    throw badRequest('Supabase de administracion no esta configurado en el servidor');
  }

  await supabaseService.auth.admin.deleteUser(userId);
};

module.exports = {
  assertOwnershipOrAdmin,
  deleteAuthUser,
  ensureProfile,
  fetchPlatformAdmin,
  optionalAuth,
  requireAdmin,
  requireAuth,
  requireRoles,
};
