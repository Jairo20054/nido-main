const Joi = require('joi');

const roleSchema = Joi.string().valid('TENANT', 'HOST');

module.exports = {
  register: Joi.object({
    name: Joi.string().trim().min(3).max(80).required(),
    email: Joi.string().trim().email().required(),
    password: Joi.string().min(8).max(72).required(),
    role: roleSchema.optional()
  }),
  login: Joi.object({
    email: Joi.string().trim().email().required(),
    password: Joi.string().min(8).max(72).required()
  })
};
