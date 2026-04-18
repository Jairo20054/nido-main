const bcrypt = require('bcryptjs');
const { prisma } = require('../../shared/prisma');
const { badRequest, unauthorized } = require('../../shared/errors');
const { signToken } = require('../../shared/auth');
const { serializeUser } = require('../../shared/serializers');

const buildAuthPayload = (user) => ({
  token: signToken(user),
  user: serializeUser(user, true),
});

const register = async (req, res) => {
  const { firstName, lastName, email, password, phone, role } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw badRequest('Ya existe una cuenta con este correo');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      passwordHash,
      phone: phone || null,
      role,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Cuenta creada correctamente',
    data: buildAuthPayload(user),
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw unauthorized('Correo o contrasena incorrectos');
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    throw unauthorized('Correo o contrasena incorrectos');
  }

  res.json({
    success: true,
    message: 'Sesion iniciada',
    data: buildAuthPayload(user),
  });
};

const me = async (req, res) => {
  res.json({
    success: true,
    data: serializeUser(req.user, true),
  });
};

const logout = async (_req, res) => {
  res.json({
    success: true,
    message: 'Sesion cerrada',
  });
};

module.exports = {
  login,
  logout,
  me,
  register,
};
