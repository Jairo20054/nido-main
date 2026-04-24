const Joi = require('joi');

const ROLE_VALUES = ['tenant', 'landlord'];

const registerSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(40).required(),
  lastName: Joi.string().trim().min(2).max(40).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(8).max(72).required(),
  phone: Joi.string().trim().max(24).allow('', null),
  role: Joi.string()
    .lowercase()
    .valid(...ROLE_VALUES)
    .default('tenant'),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});

module.exports = {
  loginSchema,
  registerSchema,
};
