const { Prisma, UserRole } = require('@prisma/client');
const { badRequest, conflict, forbidden, serviceUnavailable, unauthorized } = require('../../shared/errors');
const { prisma } = require('../../shared/prisma');

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ACTIVE_STATUSES = new Set(['active', 'ACTIVE', undefined, null, '']);

const safeRole = (role, fallback = UserRole.TENANT) => {
  if (typeof role !== 'string') {
    return fallback;
  }

  const normalized = role.toUpperCase();
  return Object.values(UserRole).includes(normalized) ? normalized : fallback;
};

const deriveNameParts = (user = {}) => {
  const fullName = String(user.fullName || user.full_name || '').trim();
  const [firstFromFullName, ...rest] = fullName.split(/\s+/).filter(Boolean);
  const emailLocalPart = String(user.email || '').split('@')[0] || 'usuario';

  return {
    firstName: String(user.firstName || user.first_name || firstFromFullName || emailLocalPart).trim(),
    lastName: String(user.lastName || user.last_name || rest.join(' ') || 'Nido').trim(),
  };
};

const normalizeDatabaseUserPayload = (user = {}) => {
  const id = String(user.id || '').trim();
  const email = String(user.email || '').trim().toLowerCase();
  const { firstName, lastName } = deriveNameParts(user);

  if (!UUID_PATTERN.test(id)) {
    throw unauthorized('El usuario autenticado no tiene un identificador valido');
  }

  if (!email) {
    throw unauthorized('El usuario autenticado no tiene correo asociado');
  }

  return {
    id,
    email,
    firstName: firstName || 'Usuario',
    lastName: lastName || 'Nido',
    phone: user.phone || null,
    bio: user.bio || null,
    avatarUrl: user.avatarUrl || user.avatar_url || null,
    role: safeRole(user.role),
  };
};

const mapPrismaUserError = (error) => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002' &&
    Array.isArray(error.meta?.target) &&
    error.meta.target.includes('email')
  ) {
    return conflict('El correo autenticado ya pertenece a otro perfil operativo');
  }

  if (
    error instanceof Prisma.PrismaClientInitializationError ||
    (error instanceof Prisma.PrismaClientKnownRequestError &&
      ['P1000', 'P1001', 'P1012', 'P2021'].includes(error.code))
  ) {
    return serviceUnavailable('La base de datos operacional no esta disponible');
  }

  return error;
};

// Garantiza que el usuario de Supabase Auth exista tambien en la base que usa Prisma.
// Es idempotente y evita FKs rotas en propiedades, favoritos, solicitudes e historial.
const ensureDatabaseUserProfile = async (authUser, client = prisma) => {
  const payload = normalizeDatabaseUserPayload(authUser);

  try {
    const existing = await client.user.findUnique({
      where: { id: payload.id },
    });

    if (!existing) {
      return client.user.create({
        data: payload,
      });
    }

    return client.user.update({
      where: { id: existing.id },
      data: {
        email: payload.email,
        firstName: existing.firstName || payload.firstName,
        lastName: existing.lastName || payload.lastName,
        phone: existing.phone || payload.phone,
        bio: existing.bio || payload.bio,
        avatarUrl: existing.avatarUrl || payload.avatarUrl,
        role: payload.role,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002' &&
      Array.isArray(error.meta?.target) &&
      error.meta.target.includes('id')
    ) {
      const existing = await client.user.findUnique({ where: { id: payload.id } });

      if (existing) {
        return existing;
      }
    }

    throw mapPrismaUserError(error);
  }
};

const assertValidUuid = (value, label = 'id') => {
  if (!value || typeof value !== 'string' || !value.trim()) {
    throw badRequest(`${label} es obligatorio`);
  }

  if (!UUID_PATTERN.test(value.trim())) {
    throw badRequest(`${label} no tiene un formato valido`);
  }
};

const getAuthenticatedDatabaseUserOrThrow = async (authUser, client = prisma) => {
  if (!authUser) {
    throw unauthorized();
  }

  const databaseUser = await ensureDatabaseUserProfile(authUser, client);

  if (!ACTIVE_STATUSES.has(authUser.status)) {
    throw forbidden('Tu usuario no esta activo');
  }

  if (authUser.deletedAt || authUser.deleted_at || databaseUser.deletedAt || databaseUser.deleted_at) {
    throw forbidden('Tu usuario fue eliminado y no puede realizar esta accion');
  }

  return databaseUser;
};

const assertUserCanCreateProperties = (user) => {
  if (![UserRole.LANDLORD, UserRole.ADMIN].includes(safeRole(user?.role))) {
    throw forbidden('Solo un arrendador o administrador puede gestionar propiedades');
  }
};

const assertValidId = (value, label = 'id') => {
  if (!value || typeof value !== 'string' || !value.trim()) {
    throw badRequest(`${label} es obligatorio`);
  }
};

module.exports = {
  assertUserCanCreateProperties,
  assertValidId,
  assertValidUuid,
  ensureDatabaseUserProfile,
  getAuthenticatedDatabaseUserOrThrow,
  safeRole,
};
