// middleware/roles.js - Middleware para control de acceso basado en roles
// CREADO POR IA: 2024-10-05

const logger = require('../utils/logger');

/**
 * Middleware factory para verificar roles
 * @param {string|string[]} allowedRoles - Rol(es) permitidos
 * @returns {Function} Middleware function
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        logger.warn('Intento de acceso sin autenticación', {
          path: req.path,
          method: req.method,
          ip: req.ip
        });
        return res.status(401).json({
          error: 'Autenticación requerida'
        });
      }

      // Convertir allowedRoles a array si es string
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      // Verificar si el usuario tiene alguno de los roles permitidos
      const hasRole = req.user.roles.some(role => roles.includes(role));

      if (!hasRole) {
        logger.warn('Acceso denegado por rol insuficiente', {
          userId: req.user._id,
          userRoles: req.user.roles,
          requiredRoles: roles,
          path: req.path,
          method: req.method
        });
        return res.status(403).json({
          error: 'Permisos insuficientes'
        });
      }

      // Usuario autorizado
      next();
    } catch (error) {
      logger.error('Error en middleware de roles', {
        error: error.message,
        userId: req.user?._id,
        path: req.path
      });
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  };
};

/**
 * Verificar rol específico (alias para requireRole)
 * @param {string} role - Rol requerido
 */
const requireAdmin = requireRole('admin');
const requireHost = requireRole('host');
const requireUser = requireRole('user');

/**
 * Verificar múltiples roles
 */
const requireAdminOrHost = requireRole(['admin', 'host']);
const requireUserOrHost = requireRole(['user', 'host']);

module.exports = {
  requireRole,
  requireAdmin,
  requireHost,
  requireUser,
  requireAdminOrHost,
  requireUserOrHost
};
