// ============================================================================
// RUTAS DE AUTENTICACIÓN CON SUPABASE
// ============================================================================
// Este módulo define todos los endpoints de autenticación disponibles en la API

const express = require('express');
const { asyncHandler } = require('../../shared/asyncHandler');

// Middleware de autenticación de Supabase
const { requireAuth, requireAuthOptional } = require('../../shared/supabase-auth-middleware');

// Middleware de validación de esquemas
const { validate } = require('../../shared/validate');

// Esquemas de validación
const { loginSchema, registerSchema } = require('./auth.schemas');

// Controladores de autenticación
const controller = require('./auth.controller');

const router = express.Router();

// ============================================================================
// RUTAS PÚBLICAS (No requieren autenticación)
// ============================================================================

/**
 * POST /auth/register
 * Registrar un nuevo usuario
 * 
 * Body:
 *   - firstName: string
 *   - lastName: string
 *   - email: string
 *   - password: string
 *   - phone: string (opcional)
 *   - role: string (opcional)
 */
router.post(
  '/register',
  validate(registerSchema),
  asyncHandler(controller.register)
);

/**
 * POST /auth/login
 * Iniciar sesión de un usuario
 * 
 * Body:
 *   - email: string
 *   - password: string
 */
router.post(
  '/login',
  validate(loginSchema),
  asyncHandler(controller.login)
);

/**
 * POST /auth/forgot-password
 * Solicitar enlace de recuperación de contraseña
 * 
 * Body:
 *   - email: string
 */
router.post(
  '/forgot-password',
  asyncHandler(controller.forgotPassword)
);

/**
 * POST /auth/reset-password-confirm
 * Confirmar nueva contraseña desde enlace de recuperación
 * 
 * Body:
 *   - newPassword: string
 * 
 * Header:
 *   - Authorization: Bearer <token_from_reset_link>
 */
router.post(
  '/reset-password-confirm',
  asyncHandler(controller.resetPasswordConfirm)
);

// ============================================================================
// RUTAS PROTEGIDAS (Requieren autenticación)
// ============================================================================

/**
 * GET /auth/me
 * Obtener datos del usuario autenticado
 * 
 * Header:
 *   - Authorization: Bearer <access_token>
 */
router.get(
  '/me',
  requireAuth,
  asyncHandler(controller.me)
);

/**
 * POST /auth/logout
 * Cerrar sesión del usuario
 * 
 * Header:
 *   - Authorization: Bearer <access_token>
 * 
 * Nota: En arquitectura stateless, el logout es principalmente en el cliente.
 *       El cliente simplemente descarta el token de acceso.
 */
router.post(
  '/logout',
  requireAuth,
  asyncHandler(controller.logout)
);

/**
 * POST /auth/change-password
 * Cambiar contraseña del usuario autenticado
 * 
 * Body:
 *   - newPassword: string
 * 
 * Header:
 *   - Authorization: Bearer <access_token>
 */
router.post(
  '/change-password',
  requireAuth,
  asyncHandler(controller.changePassword)
);

module.exports = router;

