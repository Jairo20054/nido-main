const Joi = require('joi');
const { RequestStatus } = require('@prisma/client');

const createRequestSchema = Joi.object({
  propertyId: Joi.string().required(),
  desiredMoveIn: Joi.date().iso().required(),
  leaseMonths: Joi.number().integer().min(1).max(60).required(),
  occupants: Joi.number().integer().min(1).max(12).required(),
  monthlyIncome: Joi.number().integer().min(0).allow(null),
  hasPets: Joi.boolean().default(false),
  phone: Joi.string().trim().min(7).max(24).required(),
  message: Joi.string().trim().min(20).max(1000).required(),
});

const updateRequestSchema = Joi.object({
  desiredMoveIn: Joi.date().iso(),
  leaseMonths: Joi.number().integer().min(1).max(60),
  occupants: Joi.number().integer().min(1).max(12),
  monthlyIncome: Joi.number().integer().min(0).allow(null),
  hasPets: Joi.boolean(),
  phone: Joi.string().trim().min(7).max(24),
  message: Joi.string().trim().min(20).max(1000),
}).min(1);

const reviewRequestSchema = Joi.object({
  status: Joi.string()
    .valid(RequestStatus.APPROVED, RequestStatus.REJECTED)
    .required(),
});

module.exports = {
  createRequestSchema,
  reviewRequestSchema,
  updateRequestSchema,
};
