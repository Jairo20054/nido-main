// middleware/validate.js - Validaciones con express-validator para autenticación
// CREADO POR IA: 2024-10-05

const { body, param, query } = require('express-validator');

// Validaciones para registro
const validateRegister = [
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
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una letra minúscula, una mayúscula y un número')
];

// Validaciones para login
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Por favor proporcione un email válido')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
];

// Validaciones para forgot password
const validateForgotPassword = [
  body('email')
    .isEmail()
    .withMessage('Por favor proporcione un email válido')
    .normalizeEmail()
];

// Validaciones para reset password
const validateResetPassword = [
  body('token')
    .notEmpty()
    .withMessage('Token de reset requerido'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una letra minúscula, una mayúscula y un número'),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    })
];

// Validaciones para verify email
const validateVerifyEmail = [
  query('token')
    .notEmpty()
    .withMessage('Token de verificación requerido')
];

// Validaciones para refresh token (no body validation needed, uses cookie)
const validateRefresh = [];

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Datos inválidos',
      detalles: errors.array()
    });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateVerifyEmail,
  validateRefresh,
  handleValidationErrors
};
