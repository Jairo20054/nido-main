const express = require('express');
const { asyncHandler } = require('../../shared/asyncHandler');
const { requireAuth } = require('../../shared/auth');
const { validate } = require('../../shared/validate');
const {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
} = require('./auth.schemas');
const controller = require('./auth.controller');

// Endpoints de autenticacion y recuperacion de acceso.
const router = express.Router();

router.post('/register', validate(registerSchema), asyncHandler(controller.register));
router.post('/login', validate(loginSchema), asyncHandler(controller.login));
router.post('/logout', asyncHandler(controller.logout));
router.post('/forgot-password', validate(forgotPasswordSchema), asyncHandler(controller.forgotPassword));
router.get('/me', requireAuth, asyncHandler(controller.me));

module.exports = router;
