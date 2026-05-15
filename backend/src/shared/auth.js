const { prisma } = require('./prisma');
const { badRequest, forbidden, unauthorized } = require('./errors');
const { supabaseAnon, supabaseService } = require('./supabase');

// Capa transversal de autenticacion/autorizacion. Supabase valida la identidad
// y Prisma conserva el perfil operativo que usa el resto del dominio.
const ALLOWED_SELF_ASSIGNED_ROLES = ['TENANT', 'LANDLORD'];
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

// Traduce el usuario autenticado al shape esperado por Prisma.
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

// Crea o sincroniza la fila Prisma del usuario de forma idempotente.
const ensureProfile = async (authUser) => {
  if (!authUser) {
    return null;
  }

  const authPayload = profilePayloadFromAuthUser(authUser);
  const syncedProfile = await prisma.user.upsert({
    where: {
      id: authUser.id,
    },
    create: {
      id: authUser.id,
      email: authUser.email || authPayload.email,
      firstName: authPayload.firstName,
      lastName: authPayload.lastName,
      phone: authPayload.phone,
      bio: authPayload.bio,
      avatarUrl: authPayload.avatarUrl,
      role: isAuthAdmin(authUser) ? 'ADMIN' : authPayload.role,
    },
    update: {
      ...(authUser.email ? { email: authUser.email } : {}),
      ...(isAuthAdmin(authUser) ? { role: 'ADMIN' } : {}),
    },
  });

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
    return syncedProfile;
  }

  return prisma.user.update({
    where: {
      id: authUser.id,
    },
    data: patch,
  });
};

// Lee el grant administrativo desde Supabase sin bloquear el login si la
// tabla aun no existe en el proyecto conectado.
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
    return null;
  }

  return data || null;
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
