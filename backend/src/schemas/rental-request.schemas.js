const Joi = require('joi');

module.exports = {
  create: Joi.object({
    propertyId: Joi.string().required(),
    moveInDate: Joi.date().iso().required(),
    leaseMonths: Joi.number().integer().min(1).max(36).required(),
    householdSize: Joi.number().integer().min(1).max(8).required(),
    monthlyIncome: Joi.number().integer().min(0).allow(null).optional(),
    message: Joi.string().trim().min(10).max(500).required(),
    applicantPhone: Joi.string().trim().max(30).allow('', null).optional(),
    applicantEmail: Joi.string().trim().email().optional()
  }),
  update: Joi.object({
    moveInDate: Joi.date().iso().optional(),
    leaseMonths: Joi.number().integer().min(1).max(36).optional(),
    householdSize: Joi.number().integer().min(1).max(8).optional(),
    monthlyIncome: Joi.number().integer().min(0).allow(null).optional(),
    message: Joi.string().trim().min(10).max(500).optional(),
    applicantPhone: Joi.string().trim().max(30).allow('', null).optional(),
    applicantEmail: Joi.string().trim().email().optional(),
    status: Joi.string().valid('PENDING', 'CONTACTED', 'APPROVED', 'DECLINED', 'WITHDRAWN').optional()
  }).min(1)
};
