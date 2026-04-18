const bcrypt = require('bcryptjs');
const { prisma } = require('../../shared/prisma');
const { badRequest } = require('../../shared/errors');
const { serializeUser } = require('../../shared/serializers');

const getProfile = async (req, res) => {
  res.json({
    success: true,
    data: serializeUser(req.user, true),
  });
};

const updateProfile = async (req, res) => {
  const payload = {
    ...req.body,
    phone: req.body.phone || null,
    bio: req.body.bio || null,
    avatarUrl: req.body.avatarUrl || null,
  };

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: payload,
  });

  res.json({
    success: true,
    message: 'Perfil actualizado',
    data: serializeUser(user, true),
  });
};

const deleteProfile = async (req, res) => {
  const isValidPassword = await bcrypt.compare(req.body.password, req.user.passwordHash);

  if (!isValidPassword) {
    throw badRequest('La contrasena no coincide');
  }

  await prisma.user.delete({
    where: { id: req.user.id },
  });

  res.json({
    success: true,
    message: 'Tu cuenta fue eliminada',
  });
};

module.exports = {
  deleteProfile,
  getProfile,
  updateProfile,
};
