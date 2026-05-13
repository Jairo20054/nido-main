const { Prisma } = require('@prisma/client');
const { AppError } = require('./errors');

// Middleware final de errores. Convierte fallos de dominio y Prisma en respuestas HTTP
// consistentes para el frontend y deja los errores desconocidos como 500.
const errorHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      details: error.details || null,
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un registro con estos datos',
        details: error.meta?.target || null,
      });
    }

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Recurso no encontrado',
        details: null,
      });
    }

    if (error.code === 'P2021' || error.code === 'P1001' || error.code === 'P1000') {
      return res.status(503).json({
        success: false,
        message: 'La base de datos no esta inicializada o no es accesible',
        details: error.meta?.table || null,
      });
    }
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return res.status(503).json({
      success: false,
      message: 'El servicio de datos no esta disponible. Intenta nuevamente en unos minutos',
      details: null,
    });
  }

  console.error('Unexpected error:', {
    message: error?.message || 'Unknown error',
    stack: error?.stack || 'No stack trace',
    details: error?.details || null,
  });

  return res.status(500).json({
    success: false,
    message: 'Ocurrio un error inesperado en el servidor',
  });
};

module.exports = { errorHandler };
