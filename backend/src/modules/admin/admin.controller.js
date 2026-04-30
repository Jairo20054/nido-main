const { UserRole } = require('@prisma/client');
const { prisma } = require('../../shared/prisma');
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

  const items = await prisma.property.findMany({
    where,
    include: adminPropertyInclude,
    orderBy: [{ updatedAt: 'desc' }],
  });

  res.json({
    success: true,
    data: items.map((item) => serializeProperty(item, req.user.id)),
  });
};

// Lista arrendadores junto con el numero de propiedades asociadas a cada perfil.
const listLandlords = async (_req, res) => {
  const [landlords, propertyCounts] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: UserRole.LANDLORD,
      },
      orderBy: [{ createdAt: 'desc' }],
    }),
    prisma.property.groupBy({
      by: ['ownerId'],
      _count: {
        _all: true,
      },
    }),
  ]);

  const propertyMap = new Map(propertyCounts.map((item) => [item.ownerId, item._count._all]));

  res.json({
    success: true,
    data: landlords.map((user) => ({
      ...serializeUser(user, true),
      propertyCount: propertyMap.get(user.id) || 0,
    })),
  });
};

module.exports = {
  listAdminProperties,
  listLandlords,
};
