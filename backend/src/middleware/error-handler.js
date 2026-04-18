const { Prisma } = require('@prisma/client');
const HttpError = require('../utils/http-error');

module.exports = (error, _req, res, _next) => {
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({
      error: {
        message: error.message,
        details: error.details
      }
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: {
          message: 'Ya existe un registro con ese valor unico.'
        }
      });
    }
  }

  console.error(error);

  return res.status(500).json({
    error: {
      message: 'Ocurrio un error interno en el servidor.'
    }
  });
};
