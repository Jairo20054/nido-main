const { Prisma } = require('@prisma/client');
const { AppError } = require('./errors');
const { env } = require('./env');

const isProduction = env.NODE_ENV === 'production';

const prismaTarget = (error) => error.meta?.target || error.meta?.field_name || null;

// Middleware final de errores. Convierte fallos de dominio y Prisma en respuestas HTTP
// consistentes para el frontend y deja los errores desconocidos como 500.
const errorHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      details: isProduction ? null : error.details || null,
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un registro con estos datos',
        details: prismaTarget(error),
      });
    }

    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: 'La relacion indicada no existe o no es valida',
        details: isProduction ? null : prismaTarget(error),
      });
    }

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Recurso no encontrado',
        details: null,
      });
    }

    if (['P2021', 'P1001', 'P1000', 'P1012'].includes(error.code)) {
      return res.status(503).json({
        success: false,
        message: 'La base de datos no esta inicializada o no es accesible',
        details: isProduction ? null : error.meta?.table || null,
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
    stack: isProduction ? undefined : error?.stack || 'No stack trace',
    details: isProduction ? undefined : error?.details || null,
  });

  return res.status(500).json({
    success: false,
    message: 'Ocurrio un error inesperado en el servidor',
  });
};

module.exports = { errorHandler };
