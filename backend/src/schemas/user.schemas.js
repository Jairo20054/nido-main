const Joi = require('joi');

module.exports = {
  updateMe: Joi.object({
    name: Joi.string().trim().min(3).max(80).optional(),
    phone: Joi.string().trim().max(30).allow('', null).optional(),
    city: Joi.string().trim().max(80).allow('', null).optional(),
    bio: Joi.string().trim().max(240).allow('', null).optional(),
    role: Joi.string().valid('TENANT', 'HOST').optional()
  }).min(1),
  updateById: Joi.object({
    name: Joi.string().trim().min(3).max(80).optional(),
    phone: Joi.string().trim().max(30).allow('', null).optional(),
    city: Joi.string().trim().max(80).allow('', null).optional(),
    bio: Joi.string().trim().max(240).allow('', null).optional(),
    role: Joi.string().valid('TENANT', 'HOST', 'ADMIN').optional()
  }).min(1)
};
