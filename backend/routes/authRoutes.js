const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const passport = require('../config/passport');

// Configuración de rate limiting para prevenir ataques de fuerza bruta
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos por ventana de tiempo
  message: {
    error: 'Demasiados intentos, por favor intente nuevamente en 15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // No contar intentos exitosos
});

// Validaciones para registro con mensajes en español
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),

  body('email')
    .isEmail()
    .withMessage('Por favor proporcione un email válido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('El email no debe exceder los 255 caracteres'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
];

// Validaciones para login con mensajes en español
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Por favor proporcione un email válido')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
];

// Middleware para validar errores de express-validator
const handleValidationErrors = (req, res, next) => {
  const errors = require('express-validator').validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Datos inválidos',
      detalles: errors.array()
    });
  }
  next();
};

// Rutas de autenticación tradicional

// Registro de usuario
router.post(
  '/register',
  authLimiter, // Rate limiting
  registerValidation, // Validaciones
  handleValidationErrors, // Manejo de errores de validación
  authController.register // Controlador
);

// Login tradicional
router.post(
  '/login',
  authLimiter, // Rate limiting
  loginValidation, // Validaciones
  handleValidationErrors, // Manejo de errores de validación
  authController.login // Controlador
);

// Rutas de autenticación OAuth

// Iniciar autenticación con Google
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'] // Permisos que solicitamos
  })
);

// Callback de Google OAuth
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  authController.googleCallback // Procesar usuario autenticado
);

// Iniciar autenticación con Facebook
router.get(
  '/facebook',
  passport.authenticate('facebook', {
    scope: ['email'] // Permisos que solicitamos
  })
);

// Callback de Facebook OAuth
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  authController.facebookCallback // Procesar usuario autenticado
);

// Ruta para intercambiar token de Google por JWT
router.post(
  '/google/token',
  async (req, res) => {
    try {
      const { access_token } = req.body;

      if (!access_token) {
        return res.status(400).json({
          error: 'Token de acceso de Google requerido'
        });
      }

      // Aquí normalmente validarías el token con Google APIs
      // Para simplificar, asumimos que el token es válido y obtenemos info del usuario
      // En producción, usa Google APIs para validar el token

      // Simular obtención de datos del usuario (en producción usa Google APIs)
      const googleUserData = {
        provider: 'google',
        providerId: 'simulated_google_id', // En producción obtén de Google
        email: 'user@gmail.com', // En producción obtén de Google
        name: 'Usuario Google' // En producción obtén de Google
      };

      // Encontrar o crear usuario
      const user = await require('../services/authService').findOrCreateOAuthUser(googleUserData);

      // Generar token JWT
      const { token } = require('../services/authService').generateTokens(user);

      res.json({
        mensaje: 'Login con Google exitoso',
        usuario: user.toPublicData(),
        token
      });
    } catch (error) {
      console.error('Error en intercambio de token Google:', error);
      res.status(500).json({
        error: 'Error en autenticación con Google'
      });
    }
  }
);

// Rutas protegidas (requieren autenticación)

// Obtener perfil del usuario autenticado
router.get(
  '/profile',
  require('../middleware/auth').verifyToken, // Middleware de autenticación
  authController.getProfile // Controlador
);

// Verificar token (útil para debugging)
router.get(
  '/verify',
  require('../middleware/auth').verifyToken, // Middleware de autenticación
  authController.verifyToken // Controlador
);

// Logout
router.post(
  '/logout',
  require('../middleware/auth').verifyToken, // Middleware de autenticación
  authController.logout // Controlador
);

module.exports = router;
