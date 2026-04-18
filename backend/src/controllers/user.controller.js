const prisma = require('../lib/prisma');
const HttpError = require('../utils/http-error');
const serializeUser = require('../utils/serialize-user');

const publicPropertySelect = {
  id: true,
  slug: true,
  title: true,
  city: true,
  neighborhood: true,
  monthlyRent: true,
  adminFee: true,
  bedrooms: true,
  bathrooms: true,
  areaM2: true,
  coverImage: true,
  featured: true,
  propertyType: true,
  availableFrom: true
};

const listUsers = async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      data: users.map(serializeUser)
    });
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res) => {
  res.json({
    data: serializeUser(req.user)
  });
};

const updateCurrentUser = async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: req.body
    });

    res.json({
      data: serializeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

const deleteCurrentUser = async (req, res, next) => {
  try {
    await prisma.user.delete({
      where: { id: req.user.id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.id !== req.params.id) {
      throw new HttpError(403, 'No puedes consultar ese usuario.');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.params.id }
    });

    if (!user) {
      throw new HttpError(404, 'Usuario no encontrado.');
    }

    res.json({
      data: serializeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

const updateUserById = async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.id !== req.params.id) {
      throw new HttpError(403, 'No puedes editar ese usuario.');
    }

    if (req.user.role !== 'ADMIN' && req.body.role === 'ADMIN') {
      throw new HttpError(403, 'No puedes escalar privilegios a administrador.');
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json({
      data: serializeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

const deleteUserById = async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.id !== req.params.id) {
      throw new HttpError(403, 'No puedes eliminar ese usuario.');
    }

    await prisma.user.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const getFavoriteProperties = async (req, res, next) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        property: {
          select: publicPropertySelect
        }
      }
    });

    res.json({
      data: favorites.map((favorite) => favorite.property)
    });
  } catch (error) {
    next(error);
  }
};

const addFavorite = async (req, res, next) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.propertyId }
    });

    if (!property || property.status !== 'ACTIVE') {
      throw new HttpError(404, 'La propiedad no esta disponible.');
    }

    await prisma.favorite.upsert({
      where: {
        userId_propertyId: {
          userId: req.user.id,
          propertyId: req.params.propertyId
        }
      },
      update: {},
      create: {
        userId: req.user.id,
        propertyId: req.params.propertyId
      }
    });

    res.status(201).json({
      data: { propertyId: req.params.propertyId }
    });
  } catch (error) {
    next(error);
  }
};

const removeFavorite = async (req, res, next) => {
  try {
    await prisma.favorite.deleteMany({
      where: {
        userId: req.user.id,
        propertyId: req.params.propertyId
      }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listUsers,
  getCurrentUser,
  updateCurrentUser,
  deleteCurrentUser,
  getUserById,
  updateUserById,
  deleteUserById,
  getFavoriteProperties,
  addFavorite,
  removeFavorite
};
