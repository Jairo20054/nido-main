class AppError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

const notFound = (message = 'Recurso no encontrado') => new AppError(404, message);
const badRequest = (message = 'Solicitud invalida', details) => new AppError(400, message, details);
const unauthorized = (message = 'Necesitas iniciar sesion') => new AppError(401, message);
const forbidden = (message = 'No tienes permiso para realizar esta accion') => new AppError(403, message);

module.exports = {
  AppError,
  badRequest,
  forbidden,
  notFound,
  unauthorized,
};
