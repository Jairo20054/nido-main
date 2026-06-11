const { PropertyStatus, UserRole } = require('@prisma/client');
const { prisma } = require('../../shared/prisma');
const { buildPaginationMeta, getPagination } = require('../../shared/pagination');
const { serializeProperty, serializeUser } = require('../../shared/serializers');

const STATUS_TO_SLUG = {
  [PropertyStatus.PUBLISHED]: 'publicada',
  [PropertyStatus.PENDING]: 'pendiente',
  [PropertyStatus.RENTED]: 'arrendada',
  [PropertyStatus.REJECTED]: 'rechazada',
};

const PUBLICATION_STATUSES = Object.keys(STATUS_TO_SLUG);
const MARKETPLACE_HEALTH_THRESHOLD = 10;

const parseSort = (sort, fallbackField = 'createdAt') => {
  const [field, direction] = String(sort || `${fallbackField}:desc`).split(':');
  const safeDirection = direction === 'asc' ? 'asc' : 'desc';

  return { [field || fallbackField]: safeDirection };
};

const deltaFromWindows = async (model, now, currentStart, previousStart) => {
  const [current, previous] = await Promise.all([
    model.count({
      where: {
        createdAt: {
          gte: currentStart,
          lte: now,
        },
      },
    }),
    model.count({
      where: {
        createdAt: {
          gte: previousStart,
          lt: currentStart,
        },
      },
    }),
  ]);

  if (!previous) {
    return null;
  }

  return Math.round(((current - previous) / previous) * 100);
};

const buildMetric = async (model, now, currentStart, previousStart) => {
  const [value, delta] = await Promise.all([
    model.count(),
    deltaFromWindows(model, now, currentStart, previousStart),
  ]);

  return { value, delta };
};

// Include especifico del panel admin para exponer relaciones utiles en moderacion.
const adminPropertyInclude = {
  owner: true,
  media: true,
  favorites: true,
  approvalHistory: {
    include: {
      actor: true,
    },
    orderBy: [{ createdAt: 'desc' }],
  },
  _count: {
    select: {
      rentalRequests: true,
    },
  },
};

// Devuelve el inventario completo con filtros administrativos y metadatos de moderacion.
const listAdminProperties = async (req, res) => {
  const { status, city, q } = req.query;
  const { page, limit, skip, take } = getPagination(req.query);
  const where = {};

  if (status) {
    where.status = status;
  }

  if (city) {
    where.city = {
      contains: city,
      mode: 'insensitive',
    };
  }

  // El buscador del panel administra propiedades y tambien datos del arrendador asociado.
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { city: { contains: q, mode: 'insensitive' } },
      { neighborhood: { contains: q, mode: 'insensitive' } },
      { owner: { firstName: { contains: q, mode: 'insensitive' } } },
      { owner: { lastName: { contains: q, mode: 'insensitive' } } },
      { owner: { email: { contains: q, mode: 'insensitive' } } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: adminPropertyInclude,
      orderBy: [{ updatedAt: 'desc' }],
      skip,
      take,
    }),
    prisma.property.count({ where }),
  ]);

  res.json({
    success: true,
    data: items.map((item) => serializeProperty(item, req.user.id)),
    meta: buildPaginationMeta({ page, limit, total }),
  });
};

const getAdminStats = async (_req, res) => {
  const now = new Date();
  const currentStart = new Date(now);
  currentStart.setDate(currentStart.getDate() - 30);
  const previousStart = new Date(now);
  previousStart.setDate(previousStart.getDate() - 60);

  const [properties, users, requests, saved] = await Promise.all([
    buildMetric(prisma.property, now, currentStart, previousStart),
    buildMetric(prisma.user, now, currentStart, previousStart),
    buildMetric(prisma.rentalRequest, now, currentStart, previousStart),
    buildMetric(prisma.favorite, now, currentStart, previousStart),
  ]);

  res.json({
    success: true,
    data: {
      properties,
      users,
      requests,
      saved,
    },
  });
};

const listAdminPublications = async (req, res) => {
  const limit = Number(req.query.limit || 5);
  const orderBy = parseSort(req.query.sort, 'createdAt');

  const [statusCounts, items] = await Promise.all([
    prisma.property.groupBy({
      by: ['status'],
      where: {
        status: {
          in: PUBLICATION_STATUSES,
        },
      },
      _count: {
        _all: true,
      },
    }),
    prisma.property.findMany({
      where: {
        status: {
          in: PUBLICATION_STATUSES,
        },
      },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
      },
      orderBy,
      take: limit,
    }),
  ]);

  const pipeline = Object.values(STATUS_TO_SLUG).reduce((acc, slug) => {
    acc[slug] = 0;
    return acc;
  }, {});

  statusCounts.forEach((item) => {
    const slug = STATUS_TO_SLUG[item.status];
    if (slug) {
      pipeline[slug] = item._count._all;
    }
  });

  res.json({
    success: true,
    data: {
      pipeline,
      items: items.map((item) => ({
        id: item.id,
        title: item.title,
        status: STATUS_TO_SLUG[item.status] || 'pendiente',
        createdAt: item.createdAt,
      })),
    },
  });
};

// Lista arrendadores junto con el numero de propiedades asociadas a cada perfil.
const listLandlords = async (req, res) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const where = {
    role: UserRole.LANDLORD,
  };
  const [landlords, propertyCounts, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
    }),
    prisma.property.groupBy({
      by: ['ownerId'],
      _count: {
        _all: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  const propertyMap = new Map(propertyCounts.map((item) => [item.ownerId, item._count._all]));
  const rows = landlords.map((user) => ({
    ...serializeUser(user, true),
    propertyCount: propertyMap.get(user.id) || 0,
    propertiesCount: propertyMap.get(user.id) || 0,
    status: 'active',
  }));

  const sortedRows =
    req.query.sort === 'propertiesCount:desc'
      ? rows.sort((a, b) => b.propertiesCount - a.propertiesCount)
      : rows;

  res.json({
    success: true,
    data: sortedRows.slice(skip, skip + take),
    meta: buildPaginationMeta({ page, limit, total }),
  });
};

const getMarketplaceConfig = async (_req, res) => {
  const [publishedProperties, pendingProperties, activeLandlords] = await Promise.all([
    prisma.property.count({ where: { status: PropertyStatus.PUBLISHED } }),
    prisma.property.count({ where: { status: PropertyStatus.PENDING } }),
    prisma.user.count({ where: { role: UserRole.LANDLORD } }),
  ]);

  const hasHealthyInventory =
    publishedProperties >= MARKETPLACE_HEALTH_THRESHOLD && activeLandlords > 0;

  res.json({
    success: true,
    data: {
      heading: 'Salud del marketplace',
      description: hasHealthyInventory
        ? `${publishedProperties} publicaciones activas y ${activeLandlords} arrendadores sostienen la oferta disponible.`
        : `${publishedProperties} publicaciones activas, ${pendingProperties} pendientes y ${activeLandlords} arrendadores requieren seguimiento operativo.`,
      ctaLabel: 'Ver configuracion',
    },
  });
};

module.exports = {
  getAdminStats,
  getMarketplaceConfig,
  listAdminPublications,
  listAdminProperties,
  listLandlords,
};
