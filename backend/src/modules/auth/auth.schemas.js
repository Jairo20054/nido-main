const Joi = require('joi');

const ROLE_VALUES = ['tenant', 'landlord'];

// Validaciones de entrada para autenticacion publica.
const registerSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(40).required(),
  lastName: Joi.string().trim().min(2).max(40).required(),
  email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).required(),
  password: Joi.string().min(8).max(72).required(),
  phone: Joi.string().trim().max(24).allow('', null),
  role: Joi.string()
    .lowercase()
    .valid(...ROLE_VALUES)
    .default('tenant'),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }),
  identifier: Joi.string().trim().lowercase().min(1).max(254),
  password: Joi.string().required(),
}).or('email', 'identifier');

const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).required(),
});

module.exports = {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
};
