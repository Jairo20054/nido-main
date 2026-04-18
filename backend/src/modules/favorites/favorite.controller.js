const { prisma } = require('../../shared/prisma');
const { notFound } = require('../../shared/errors');
const { serializeProperty } = require('../../shared/serializers');

const listFavorites = async (req, res) => {
  const favorites = await prisma.favorite.findMany({
    where: {
      userId: req.user.id,
    },
    include: {
      property: {
        include: {
          owner: true,
          images: true,
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
  });

  res.json({
    success: true,
    data: favorites.map((favorite) => serializeProperty(favorite.property, req.user.id)),
  });
};

const addFavorite = async (req, res) => {
  const property = await prisma.property.findUnique({
    where: { id: req.params.propertyId },
  });

  if (!property) {
    throw notFound('La propiedad no existe');
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
