// Errores de dominio centralizados para uniformar respuestas y codigos HTTP.
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
const unauthorized = (message = 'Necesitas iniciar sesión') => new AppError(401, message);
const forbidden = (message = 'No tienes permiso para realizar esta acción') => new AppError(403, message);
const serviceUnavailable = (message = 'Servicio temporalmente no disponible', details) =>
  new AppError(503, message, details);
const tooManyRequests = (message = 'Demasiados intentos. Intenta nuevamente más tarde') =>
  new AppError(429, message);

module.exports = {
  AppError,
  badRequest,
  forbidden,
  notFound,
  serviceUnavailable,
  tooManyRequests,
  unauthorized,
};
