const { AppError } = require('./errors');

const errorHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      details: error.details || null,
    });
  }

  console.error(error);

  return res.status(500).json({
    success: false,
    message: 'Ocurrio un error inesperado en el servidor',
  });
};

module.exports = { errorHandler };
