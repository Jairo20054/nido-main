const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const env = require('../config/env');
const HttpError = require('../utils/http-error');

const authenticate = async (req, _res, next) => {
  try {
    const authorization = req.headers.authorization || '';
    const [, token] = authorization.split(' ');

    if (!token) {
      return next(new HttpError(401, 'Debes iniciar sesion para continuar.'));
    }

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });

    if (!user) {
      return next(new HttpError(401, 'La sesion ya no es valida.'));
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(new HttpError(401, 'Token invalido o expirado.'));
  }
};

const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new HttpError(403, 'No tienes permisos para esta accion.'));
  }

  return next();
};

module.exports = {
  authenticate,
  requireRole
};
