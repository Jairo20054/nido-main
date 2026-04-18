const Joi = require('joi');
const { UserRole } = require('@prisma/client');

const registerSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(40).required(),
  lastName: Joi.string().trim().min(2).max(40).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(8).max(72).required(),
  phone: Joi.string().trim().max(24).allow('', null),
  role: Joi.string()
    .valid(UserRole.TENANT, UserRole.LANDLORD)
    .default(UserRole.TENANT),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});

module.exports = {
  loginSchema,
  registerSchema,
};
