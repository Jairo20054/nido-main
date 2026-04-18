const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const env = require('../config/env');
const HttpError = require('../utils/http-error');
const serializeUser = require('../utils/serialize-user');

const createToken = (user) =>
  jwt.sign(
    {
      role: user.role,
      email: user.email
    },
    env.jwtSecret,
    {
      expiresIn: '7d',
      subject: user.id
    }
  );

const authResponse = (user) => ({
  token: createToken(user),
  user: serializeUser(user)
});

const register = async (req, res, next) => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: req.body.email.toLowerCase() }
    });

    if (existingUser) {
      throw new HttpError(409, 'Ya existe una cuenta registrada con ese correo.');
    }

    const passwordHash = await bcrypt.hash(req.body.password, 10);

    const user = await prisma.user.create({
      data: {
        name: req.body.name,
        email: req.body.email.toLowerCase(),
        passwordHash,
        role: req.body.role || 'TENANT'
      }
    });

    res.status(201).json({
      data: authResponse(user)
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.body.email.toLowerCase() }
    });

    if (!user) {
      throw new HttpError(401, 'Correo o contrasena invalidos.');
    }

    const isValid = await bcrypt.compare(req.body.password, user.passwordHash);

    if (!isValid) {
      throw new HttpError(401, 'Correo o contrasena invalidos.');
    }

    res.json({
      data: authResponse(user)
    });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res) => {
  res.json({
    data: serializeUser(req.user)
  });
};

const logout = async (_req, res) => {
  res.status(204).send();
};

module.exports = {
  register,
  login,
  me,
  logout
};
