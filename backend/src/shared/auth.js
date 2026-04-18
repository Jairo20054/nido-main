const jwt = require('jsonwebtoken');
const { prisma } = require('./prisma');
const { env } = require('./env');
const { unauthorized } = require('./errors');

const extractToken = (req) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null;
  }

  return authorization.slice(7);
};

const signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

const attachUser = async (req, strict) => {
  const token = extractToken(req);

  if (!token) {
    if (strict) {
      throw unauthorized();
    }
    req.user = null;
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw unauthorized('La sesion ya no es valida');
    }

    req.user = user;
  } catch (_error) {
    if (strict) {
      throw unauthorized('Tu sesion expiro o no es valida');
    }
    req.user = null;
  }
};

const requireAuth = async (req, _res, next) => {
  try {
    await attachUser(req, true);
    next();
  } catch (error) {
    next(error);
  }
};

const optionalAuth = async (req, _res, next) => {
  await attachUser(req, false);
  next();
};

module.exports = {
  optionalAuth,
  requireAuth,
  signToken,
};
