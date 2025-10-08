const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const rateLimit = require('express-rate-limit');
const passport = require('../config/passport');

// Configuración de rate limiting para login y forgot-password
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 5,
  message: {
    error: 'Demasiados intentos, por favor intente nuevamente más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

// Rutas de autenticación

// Registro
router.post(
  '/register',
  authLimiter,
  validate.validateRegister,
  validate.handleValidationErrors,
  authController.register
);

// Login
router.post(
  '/login',
  authLimiter,
  validate.validateLogin,
  validate.handleValidationErrors,
  authController.login
);

// Refresh token
router.post(
  '/refresh',
  authLimiter,
  validate.validateRefresh,
  validate.handleValidationErrors,
  authController.refresh
);

// Logout
router.post(
  '/logout',
  authController.logout
);

// Verificar email
router.get(
  '/verify-email',
  validate.validateVerifyEmail,
  validate.handleValidationErrors,
  authController.verifyEmail
);

// Forgot password
router.post(
  '/forgot-password',
  authLimiter,
  validate.validateForgotPassword,
  validate.handleValidationErrors,
  authController.forgotPassword
);

// Reset password
router.post(
  '/reset-password',
  validate.validateResetPassword,
  validate.handleValidationErrors,
  authController.resetPassword
);

// Rutas OAuth Google
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  authController.googleCallback
);

// Rutas OAuth Facebook
router.get(
  '/facebook',
  passport.authenticate('facebook', {
    scope: ['email']
  })
);

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  authController.facebookCallback
);

// Rutas protegidas (requieren autenticación)
const auth = require('../middleware/auth');

// Obtener perfil del usuario autenticado
router.get(
  '/profile',
  auth.verifyToken,
  authController.getProfile
);

module.exports = router;
