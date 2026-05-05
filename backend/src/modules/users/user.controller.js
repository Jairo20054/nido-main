const { prisma } = require('../../shared/prisma');
const { badRequest, unauthorized } = require('../../shared/errors');
const { serializeUser } = require('../../shared/serializers');
const { deleteAuthUser } = require('../../shared/auth');
const { supabaseAnon } = require('../../shared/supabase');

// Devuelve el perfil autenticado ya serializado para el cliente.
const getProfile = async (req, res) => {
  res.json({
    success: true,
    data: serializeUser(req.user, true),
  });
};

// Actualiza solo los campos editables del perfil publico del usuario.
const updateProfile = async (req, res) => {
  const payload = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
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
    data: serializeUser(
      {
        ...user,
        role: req.user.role,
        isPlatformAdmin: req.user.isPlatformAdmin,
      },
      true
    ),
  });
};

// Reautentica con contrasena antes de eliminar la cuenta y el usuario de Supabase.
const deleteProfile = async (req, res) => {
  if (!supabaseAnon) {
    throw badRequest('Supabase no esta configurado en el servidor');
  }

  const { error } = await supabaseAnon.auth.signInWithPassword({
    email: req.user.email,
    password: req.body.password,
  });

  if (error) {
    throw unauthorized('La contrasena no coincide');
  }

  await deleteAuthUser(req.user.id);
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
