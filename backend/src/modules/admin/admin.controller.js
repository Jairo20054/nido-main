const { UserRole } = require('@prisma/client');
const { prisma } = require('../../shared/prisma');
const { buildPaginationMeta, getPagination } = require('../../shared/pagination');
const { serializeProperty, serializeUser } = require('../../shared/serializers');

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
      skip,
      take,
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

  res.json({
    success: true,
    data: landlords.map((user) => ({
      ...serializeUser(user, true),
      propertyCount: propertyMap.get(user.id) || 0,
    })),
    meta: buildPaginationMeta({ page, limit, total }),
  });
};

module.exports = {
  listAdminProperties,
  listLandlords,
};
