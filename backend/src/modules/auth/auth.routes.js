const express = require('express');
const { asyncHandler } = require('../../shared/asyncHandler');
const { requireAuth } = require('../../shared/auth');
const { createRateLimiter } = require('../../shared/rateLimit');
const { validate } = require('../../shared/validate');
const {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
} = require('./auth.schemas');
const controller = require('./auth.controller');

// Endpoints de autenticacion y recuperacion de acceso.
const router = express.Router();
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyPrefix: 'auth',
  message: 'Demasiados intentos de autenticación. Intenta nuevamente en unos minutos',
});

router.post('/register', authLimiter, validate(registerSchema), asyncHandler(controller.register));
router.post('/login', authLimiter, validate(loginSchema), asyncHandler(controller.login));
router.post('/dev-login', authLimiter, asyncHandler(controller.devLogin));
router.post('/logout', requireAuth, asyncHandler(controller.logout));
router.post('/sync-user', requireAuth, asyncHandler(controller.syncUser));
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), asyncHandler(controller.forgotPassword));
router.get('/me', requireAuth, asyncHandler(controller.me));

module.exports = router;
