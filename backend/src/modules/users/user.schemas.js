const Joi = require('joi');

const updateProfileSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(40),
  lastName: Joi.string().trim().min(2).max(40),
  phone: Joi.string().trim().max(24).allow('', null),
  bio: Joi.string().trim().max(300).allow('', null),
  avatarUrl: Joi.string().trim().uri().allow('', null),
  role: Joi.string().lowercase().valid('tenant', 'landlord'),
}).min(1);

const deleteProfileSchema = Joi.object({
  password: Joi.string().required(),
});

module.exports = {
  deleteProfileSchema,
  updateProfileSchema,
};
