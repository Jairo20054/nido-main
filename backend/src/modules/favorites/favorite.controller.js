const { PropertyStatus } = require('@prisma/client');
const { prisma } = require('../../shared/prisma');
const { notFound } = require('../../shared/errors');
const { buildPaginationMeta, getPagination } = require('../../shared/pagination');
const { serializeProperty } = require('../../shared/serializers');

// Devuelve las propiedades guardadas por el usuario actual.
const listFavorites = async (req, res) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const where = {
    userId: req.user.id,
  };
  const [favorites, total] = await Promise.all([
    prisma.favorite.findMany({
      where,
      include: {
        property: {
          include: {
            owner: true,
            media: true,
            favorites: {
              where: {
                userId: req.user.id,
              },
            },
            _count: {
              select: {
                rentalRequests: true,
              },
            },
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
      skip,
      take,
    }),
    prisma.favorite.count({ where }),
  ]);

  res.json({
    success: true,
    data: favorites.map((favorite) => serializeProperty(favorite.property, req.user.id)),
    meta: buildPaginationMeta({ page, limit, total }),
  });
};

// Guarda una propiedad como favorita idempotentemente usando upsert.
const addFavorite = async (req, res) => {
  const property = await prisma.property.findFirst({
    where: {
      id: req.params.propertyId,
      status: PropertyStatus.PUBLISHED,
    },
  });

  if (!property) {
    throw notFound('La propiedad no está disponible');
  }

  await prisma.favorite.upsert({
    where: {
      userId_propertyId: {
        userId: req.user.id,
        propertyId: req.params.propertyId,
      },
    },
    update: {},
    create: {
      userId: req.user.id,
      propertyId: req.params.propertyId,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Propiedad guardada',
  });
};

// Elimina la relacion de favorito sin fallar si ya no existia.
const removeFavorite = async (req, res) => {
  await prisma.favorite.deleteMany({
    where: {
      userId: req.user.id,
      propertyId: req.params.propertyId,
    },
  });

  res.json({
    success: true,
    message: 'Propiedad retirada de guardados',
  });
};

module.exports = {
  addFavorite,
  listFavorites,
  removeFavorite,
};
