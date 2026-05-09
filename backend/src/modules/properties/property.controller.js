const { randomBytes } = require('crypto');
const { MediaType, PropertyStatus, UserRole } = require('@prisma/client');
const { env } = require('../../shared/env');
const { prisma } = require('../../shared/prisma');
const { supabaseService } = require('../../shared/supabase');
const { badRequest, forbidden, notFound } = require('../../shared/errors');
const { buildPaginationMeta, getPagination } = require('../../shared/pagination');
const { slugify } = require('../../shared/slugify');
const { serializeProperty } = require('../../shared/serializers');

const PUBLIC_STATUSES = [PropertyStatus.PUBLISHED];
const ADMIN_VISIBLE_STATUSES = Object.values(PropertyStatus);
const LANDLORD_ALLOWED_CREATE_STATUSES = [
  PropertyStatus.DRAFT,
  PropertyStatus.PENDING,
  PropertyStatus.PUBLISHED,
];
const PROPERTY_MEDIA_BUCKET = env.SUPABASE_PROPERTY_MEDIA_BUCKET || 'property-media-public';

// Include reutilizable para las lecturas de propiedades. Agrega favoritos solo cuando
// hay usuario autenticado para no consultar relaciones innecesarias en publico.
const propertyInclude = (currentUserId) => ({
  owner: true,
  media: true,
  approvalHistory: {
    include: {
      actor: true,
    },
    orderBy: [{ createdAt: 'desc' }],
  },
  ...(currentUserId
    ? {
        favorites: {
          where: {
            userId: currentUserId,
          },
        },
      }
    : {}),
  _count: {
    select: {
      rentalRequests: true,
    },
  },
});

// Normaliza campos opcionales, disponibilidad y coleccion de medios antes de persistir.
const normalizePropertyInput = (payload = {}) => ({
  ...payload,
  neighborhood: payload.neighborhood || null,
  zoneReference: payload.zoneReference || null,
  rules: payload.rules || null,
  requirements: payload.requirements || null,
  idealTenantProfile: payload.idealTenantProfile || null,
  specialConditions: payload.specialConditions || null,
  contactMethod: payload.contactMethod || null,
  verificationDetails: payload.verificationDetails || null,
  floor: payload.floor ?? null,
  strata: payload.strata ?? null,
  latitude: payload.latitude ?? null,
  longitude: payload.longitude ?? null,
  availableImmediately: Boolean(payload.availableImmediately),
  availableFrom: payload.availableImmediately ? null : payload.availableFrom,
  media: (payload.media || [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((item, index) => ({
      ...item,
      alt: item.alt || payload.title || null,
      mimeType: item.mimeType || null,
      position: index,
      sizeBytes: item.sizeBytes ?? null,
    })),
});

// Toma la primera imagen como portada cuando no se define explicitamente.
const getCoverImage = (payload, fallback = null) =>
  payload.media.find((item) => item.type === MediaType.IMAGE)?.url || fallback;

// Reconstruye el path interno de Storage para poder limpiar assets huérfanos
// despues de editar o eliminar una propiedad.
const deriveStoragePathFromUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    const parsed = new URL(url, env.SUPABASE_URL || 'http://localhost');
    const publicPrefix = `/storage/v1/object/public/${PROPERTY_MEDIA_BUCKET}/`;
    const authenticatedPrefix = `/storage/v1/object/authenticated/${PROPERTY_MEDIA_BUCKET}/`;

    if (parsed.pathname.includes(publicPrefix)) {
      return decodeURIComponent(parsed.pathname.split(publicPrefix)[1] || '');
    }

    if (parsed.pathname.includes(authenticatedPrefix)) {
      return decodeURIComponent(parsed.pathname.split(authenticatedPrefix)[1] || '');
    }
  } catch (_error) {
    return null;
  }

  return null;
};

const cleanupPropertyMediaAssets = async (mediaUrls = []) => {
  const storagePaths = [...new Set(mediaUrls.map(deriveStoragePathFromUrl).filter(Boolean))];

  if (!storagePaths.length || !supabaseService) {
    return;
  }

  const { error } = await supabaseService.storage.from(PROPERTY_MEDIA_BUCKET).remove(storagePaths);

  if (error) {
    // La propiedad ya quedo consistente en Prisma; el cleanup puede reintentarse luego.
    console.error('No fue posible limpiar assets de propiedades en Storage:', error.message);
  }
};

// Genera un slug estable y suficientemente unico para URLs amigables.
const generateSlug = async (title, city, propertyId = '') => {
  const base = slugify(`${title}-${city}`);
  const shortId = propertyId ? propertyId.slice(-6) : randomBytes(4).toString('hex');
  return `${base}-${shortId}`;
};

// Reglas de permisos y transicion de estados.
const canManageProperty = (user, property) =>
  user?.role === UserRole.ADMIN || property.ownerId === user?.id;

const isAdmin = (user) => user?.role === UserRole.ADMIN;

const assertLandlordOrAdmin = (user) => {
  if (![UserRole.LANDLORD, UserRole.ADMIN].includes(user.role)) {
    throw forbidden('Solo un arrendador o administrador puede gestionar viviendas');
  }
};

// Controla que un arrendador no pueda autopublicar sin pasar por revision.
const resolveStatusForCreation = (user, requestedStatus) => {
  if (isAdmin(user)) {
    return requestedStatus || PropertyStatus.PUBLISHED;
  }

  if (!LANDLORD_ALLOWED_CREATE_STATUSES.includes(requestedStatus || PropertyStatus.DRAFT)) {
    return PropertyStatus.PENDING;
  }

  if (requestedStatus === PropertyStatus.PUBLISHED) {
    return PropertyStatus.PENDING;
  }

  return requestedStatus || PropertyStatus.DRAFT;
};

// Controla que ciertas transiciones editoriales sigan siendo exclusivas de administracion.
const resolveStatusForUpdate = (user, existing, requestedStatus) => {
  if (!requestedStatus) {
    return existing.status;
  }

  if (isAdmin(user)) {
    return requestedStatus;
  }

  if (requestedStatus === PropertyStatus.PUBLISHED) {
    return PropertyStatus.PENDING;
  }

  if ([PropertyStatus.APPROVED, PropertyStatus.REJECTED].includes(requestedStatus)) {
    throw forbidden('Solo el administrador puede aprobar o rechazar publicaciones');
  }

  return requestedStatus;
};

// Registra trazabilidad de aprobaciones y cambios de estado.
const recordApprovalHistory = async ({ tx, propertyId, actorId, fromStatus, toStatus, note }) => {
  if (fromStatus === toStatus && !note) {
    return;
  }

  await tx.propertyApprovalHistory.create({
    data: {
      propertyId,
      actorId,
      fromStatus,
      toStatus,
      note: note || null,
    },
  });
};

// Convierte query params del listado en filtros Prisma.
const buildWhere = (query, user) => {
  const where = {};
  const canSeeAllStatuses = user?.role === UserRole.ADMIN;

  if (query.q) {
    where.OR = [
      { title: { contains: query.q, mode: 'insensitive' } },
      { summary: { contains: query.q, mode: 'insensitive' } },
      { neighborhood: { contains: query.q, mode: 'insensitive' } },
      { city: { contains: query.q, mode: 'insensitive' } },
    ];
  }

  if (query.city) {
    where.city = {
      contains: query.city,
      mode: 'insensitive',
    };
  }

  if (query.neighborhood) {
    where.neighborhood = {
      contains: query.neighborhood,
      mode: 'insensitive',
    };
  }

  if (query.propertyType) {
    where.propertyType = query.propertyType;
  }

  if (query.minRent !== undefined || query.maxRent !== undefined) {
    where.monthlyRent = {};

    if (query.minRent !== undefined) {
      where.monthlyRent.gte = query.minRent;
    }

    if (query.maxRent !== undefined) {
      where.monthlyRent.lte = query.maxRent;
    }
  }

  if (query.bedrooms !== undefined) {
    where.bedrooms = { gte: query.bedrooms };
  }

  if (query.bathrooms !== undefined) {
    where.bathrooms = { gte: query.bathrooms };
  }

  if (query.furnished !== undefined) {
    where.furnished = query.furnished;
  }

  if (query.petsAllowed !== undefined) {
    where.petsAllowed = query.petsAllowed;
  }

  if (query.utilitiesIncluded !== undefined) {
    where.utilitiesIncluded = query.utilitiesIncluded;
  }

  if (query.status) {
    if (canSeeAllStatuses) {
      where.status = query.status;
    } else {
      // Los usuarios publicos nunca deben forzar estados internos desde la URL.
      where.status = PropertyStatus.PUBLISHED;
    }
  } else if (!canSeeAllStatuses) {
    where.status = {
      in: PUBLIC_STATUSES,
    };
  }

  return where;
};

// Define el criterio de orden soportado por el catalogo.
const buildOrderBy = (sort) => {
  switch (sort) {
    case 'rent-asc':
      return [{ monthlyRent: 'asc' }, { createdAt: 'desc' }];
    case 'rent-desc':
      return [{ monthlyRent: 'desc' }, { createdAt: 'desc' }];
    case 'latest':
      return [{ createdAt: 'desc' }];
    default:
      return [{ publishedAt: 'desc' }, { createdAt: 'desc' }];
  }
};

// Reemplaza todos los medios cuando la actualizacion incluye una nueva coleccion.
const buildMediaMutation = (payload) => ({
  deleteMany: {},
  create: payload.media.map((item) => ({
    type: item.type,
    url: item.url,
    alt: item.alt,
    position: item.position,
    mimeType: item.mimeType,
    sizeBytes: item.sizeBytes,
  })),
});

// Lista paginada del catalogo con filtros y conteo total.
const listProperties = async (req, res) => {
  const { page, limit, sort, ...filters } = req.query;
  const skip = (page - 1) * limit;
  const currentUserId = req.user?.id || null;
  const where = buildWhere(filters, req.user);

  const [items, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: propertyInclude(currentUserId),
      orderBy: buildOrderBy(sort),
      skip,
      take: limit,
    }),
    prisma.property.count({ where }),
  ]);

  res.json({
    success: true,
    data: items.map((property) => serializeProperty(property, currentUserId)),
    meta: {
      ...buildPaginationMeta({ page, limit, total }),
    },
  });
};

// Seleccion reducida para la home publica.
const getFeaturedProperties = async (req, res) => {
  const currentUserId = req.user?.id || null;
  const items = await prisma.property.findMany({
    where: {
      status: PropertyStatus.PUBLISHED,
    },
    include: propertyInclude(currentUserId),
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    take: 6,
  });

  res.json({
    success: true,
    data: items.map((property) => serializeProperty(property, currentUserId)),
  });
};

// Devuelve el inventario del arrendador autenticado o todo el inventario para admin.
const getMyProperties = async (req, res) => {
  assertLandlordOrAdmin(req.user);
  const { page, limit, skip, take } = getPagination(req.query);

  const where = isAdmin(req.user)
    ? {}
    : {
        ownerId: req.user.id,
      };

  const [items, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: propertyInclude(req.user.id),
      orderBy: [{ updatedAt: 'desc' }],
      skip,
      take,
    }),
    prisma.property.count({ where }),
  ]);

  res.json({
    success: true,
    data: items.map((property) => serializeProperty(property, req.user.id)),
    meta: buildPaginationMeta({ page, limit, total }),
  });
};

// Recupera una propiedad puntual respetando visibilidad por rol/estado.
const getPropertyById = async (req, res) => {
  const property = await prisma.property.findUnique({
    where: { id: req.params.id },
    include: propertyInclude(req.user?.id || null),
  });

  if (!property) {
    throw notFound('La propiedad no existe');
  }

  if (!canManageProperty(req.user, property) && !PUBLIC_STATUSES.includes(property.status)) {
    throw notFound('La propiedad no esta disponible');
  }

  res.json({
    success: true,
    data: serializeProperty(property, req.user?.id || null),
  });
};

// Alta transaccional de propiedades junto con sus medios e historial de aprobacion.
const createProperty = async (req, res) => {
  assertLandlordOrAdmin(req.user);

  const payload = normalizePropertyInput(req.body);
  const finalStatus = resolveStatusForCreation(req.user, payload.status);
  const slug = await generateSlug(payload.title, payload.city);

  const property = await prisma.$transaction(async (tx) => {
    const created = await tx.property.create({
      data: {
        slug,
        ownerId: req.user.id,
        title: payload.title,
        summary: payload.summary,
        description: payload.description,
        propertyType: payload.propertyType,
        rentalType: payload.rentalType,
        status: finalStatus,
        city: payload.city,
        neighborhood: payload.neighborhood,
        addressLine: payload.addressLine,
        zoneReference: payload.zoneReference,
        monthlyRent: payload.monthlyRent,
        maintenanceFee: payload.maintenanceFee,
        securityDeposit: payload.securityDeposit,
        availableImmediately: payload.availableImmediately,
        availableFrom: payload.availableFrom,
        bedrooms: payload.bedrooms,
        bathrooms: payload.bathrooms,
        areaM2: payload.areaM2,
        floor: payload.floor,
        parkingSpots: payload.parkingSpots,
        strata: payload.strata,
        maxOccupants: payload.maxOccupants,
        furnished: payload.furnished,
        petsAllowed: payload.petsAllowed,
        utilitiesIncluded: payload.utilitiesIncluded,
        minLeaseMonths: payload.minLeaseMonths,
        amenities: payload.amenities,
        rules: payload.rules,
        requirements: payload.requirements,
        idealTenantProfile: payload.idealTenantProfile,
        specialConditions: payload.specialConditions,
        contactMethod: payload.contactMethod,
        verificationDetails: payload.verificationDetails,
        coverImage: getCoverImage(payload, null),
        latitude: payload.latitude,
        longitude: payload.longitude,
        approvedAt:
          finalStatus === PropertyStatus.APPROVED || finalStatus === PropertyStatus.PUBLISHED
            ? new Date()
            : null,
        publishedAt: finalStatus === PropertyStatus.PUBLISHED ? new Date() : null,
        media: {
          create: payload.media.map((item) => ({
            type: item.type,
            url: item.url,
            alt: item.alt,
            position: item.position,
            mimeType: item.mimeType,
            sizeBytes: item.sizeBytes,
          })),
        },
      },
      include: propertyInclude(req.user.id),
    });

    await recordApprovalHistory({
      tx,
      propertyId: created.id,
      actorId: req.user.id,
      fromStatus: null,
      toStatus: finalStatus,
      note: payload.reviewNote || (finalStatus === PropertyStatus.PENDING ? 'Enviada para revision' : null),
    });

    return created;
  });

  res.status(201).json({
    success: true,
    message:
      property.status === PropertyStatus.PENDING
        ? 'Propiedad enviada a revision'
        : 'Propiedad guardada correctamente',
    data: serializeProperty(property, req.user.id),
  });
};

// Actualiza la publicacion y registra cualquier transicion editorial relevante.
const updateProperty = async (req, res) => {
  const existing = await prisma.property.findUnique({
    where: { id: req.params.id },
    include: {
      media: true,
    },
  });

  if (!existing) {
    throw notFound('La propiedad no existe');
  }

  if (!canManageProperty(req.user, existing)) {
    throw forbidden();
  }

  const payload = normalizePropertyInput({
    ...existing,
    ...req.body,
  });
  const nextStatus = resolveStatusForUpdate(req.user, existing, req.body.status);
  const removedMediaUrls = req.body.media
    ? existing.media
        .filter(
          (currentItem) =>
            !payload.media.some(
              (nextItem) =>
                nextItem.type === currentItem.type && nextItem.url === currentItem.url
            )
        )
        .map((item) => item.url)
    : [];

  const property = await prisma.$transaction(async (tx) => {
    const updated = await tx.property.update({
      where: { id: req.params.id },
      data: {
        title: payload.title,
        summary: payload.summary,
        description: payload.description,
        propertyType: payload.propertyType,
        rentalType: payload.rentalType,
        status: nextStatus,
        city: payload.city,
        neighborhood: payload.neighborhood,
        addressLine: payload.addressLine,
        zoneReference: payload.zoneReference,
        monthlyRent: payload.monthlyRent,
        maintenanceFee: payload.maintenanceFee,
        securityDeposit: payload.securityDeposit,
        availableImmediately: payload.availableImmediately,
        availableFrom: payload.availableFrom,
        bedrooms: payload.bedrooms,
        bathrooms: payload.bathrooms,
        areaM2: payload.areaM2,
        floor: payload.floor,
        parkingSpots: payload.parkingSpots,
        strata: payload.strata,
        maxOccupants: payload.maxOccupants,
        furnished: payload.furnished,
        petsAllowed: payload.petsAllowed,
        utilitiesIncluded: payload.utilitiesIncluded,
        minLeaseMonths: payload.minLeaseMonths,
        amenities: payload.amenities,
        rules: payload.rules,
        requirements: payload.requirements,
        idealTenantProfile: payload.idealTenantProfile,
        specialConditions: payload.specialConditions,
        contactMethod: payload.contactMethod,
        verificationDetails: payload.verificationDetails,
        rejectionReason:
          nextStatus === PropertyStatus.REJECTED
            ? payload.reviewNote || existing.rejectionReason
            : null,
        coverImage: req.body.media ? getCoverImage(payload, null) : existing.coverImage,
        latitude: payload.latitude,
        longitude: payload.longitude,
        approvedAt:
          nextStatus === PropertyStatus.APPROVED || nextStatus === PropertyStatus.PUBLISHED
            ? existing.approvedAt || new Date()
            : nextStatus === PropertyStatus.REJECTED
              ? null
              : existing.approvedAt,
        publishedAt:
          nextStatus === PropertyStatus.PUBLISHED
            ? existing.publishedAt || new Date()
            : nextStatus === PropertyStatus.ARCHIVED || nextStatus === PropertyStatus.RENTED
              ? existing.publishedAt
              : existing.publishedAt,
        media: req.body.media ? buildMediaMutation(payload) : undefined,
      },
      include: propertyInclude(req.user.id),
    });

    await recordApprovalHistory({
      tx,
      propertyId: updated.id,
      actorId: req.user.id,
      fromStatus: existing.status,
      toStatus: nextStatus,
      note: payload.reviewNote || null,
    });

    return updated;
  });

  await cleanupPropertyMediaAssets(removedMediaUrls);

  res.json({
    success: true,
    message: 'Propiedad actualizada',
    data: serializeProperty(property, req.user.id),
  });
};

// Endpoint reducido para cambios de estado desde moderacion.
const changePropertyStatus = async (req, res) => {
  const property = await prisma.property.findUnique({
    where: { id: req.params.id },
  });

  if (!property) {
    throw notFound('La propiedad no existe');
  }

  const nextStatus = req.body.status;

  const updated = await prisma.$transaction(async (tx) => {
    const item = await tx.property.update({
      where: { id: req.params.id },
      data: {
        status: nextStatus,
        rejectionReason: nextStatus === PropertyStatus.REJECTED ? req.body.reviewNote || null : null,
        approvedAt:
          nextStatus === PropertyStatus.APPROVED || nextStatus === PropertyStatus.PUBLISHED
            ? property.approvedAt || new Date()
            : nextStatus === PropertyStatus.REJECTED
              ? null
              : property.approvedAt,
        publishedAt:
          nextStatus === PropertyStatus.PUBLISHED ? property.publishedAt || new Date() : property.publishedAt,
      },
      include: propertyInclude(req.user.id),
    });

    await recordApprovalHistory({
      tx,
      propertyId: item.id,
      actorId: req.user.id,
      fromStatus: property.status,
      toStatus: nextStatus,
      note: req.body.reviewNote || null,
    });

    return item;
  });

  res.json({
    success: true,
    message: 'Estado actualizado',
    data: serializeProperty(updated, req.user.id),
  });
};

// Restringe borrado cuando existen solicitudes activas, salvo para administracion.
const deleteProperty = async (req, res) => {
  const property = await prisma.property.findUnique({
    where: { id: req.params.id },
    include: {
      media: true,
    },
  });

  if (!property) {
    throw notFound('La propiedad no existe');
  }

  if (!canManageProperty(req.user, property)) {
    throw forbidden();
  }

  const activeRequests = await prisma.rentalRequest.count({
    where: {
      propertyId: property.id,
      status: {
        in: ['PENDING', 'APPROVED'],
      },
    },
  });

  if (activeRequests > 0 && !isAdmin(req.user)) {
    throw badRequest('No puedes eliminar una propiedad con solicitudes activas');
  }

  await prisma.property.delete({
    where: { id: req.params.id },
  });

  await cleanupPropertyMediaAssets(property.media.map((item) => item.url));

  res.json({
    success: true,
    message: 'Propiedad eliminada',
  });
};

// KPIs del panel admin construidos a partir de agregaciones directas de Prisma.
const getAdminPropertyStats = async (_req, res) => {
  const [propertiesByStatus, usersByRole, totals] = await Promise.all([
    prisma.property.groupBy({
      by: ['status'],
      _count: {
        _all: true,
      },
    }),
    prisma.user.groupBy({
      by: ['role'],
      _count: {
        _all: true,
      },
    }),
    Promise.all([
      prisma.property.count(),
      prisma.rentalRequest.count(),
      prisma.favorite.count(),
    ]),
  ]);

  res.json({
    success: true,
    data: {
      propertiesByStatus: propertiesByStatus.map((item) => ({
        status: item.status,
        total: item._count._all,
      })),
      usersByRole: usersByRole.map((item) => ({
        role: item.role,
        total: item._count._all,
      })),
      totals: {
        properties: totals[0],
        requests: totals[1],
        favorites: totals[2],
      },
    },
  });
};

module.exports = {
  changePropertyStatus,
  createProperty,
  deleteProperty,
  getAdminPropertyStats,
  getFeaturedProperties,
  getMyProperties,
  getPropertyById,
  listProperties,
  updateProperty,
};
