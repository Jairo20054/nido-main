const Joi = require('joi');
const { RequestStatus } = require('@prisma/client');

const cuidPattern = /^[a-z0-9]{20,32}$/i;
const colombianPhonePattern = /^(\+?57\s?)?3\d{2}[\s-]?\d{3}[\s-]?\d{4}$/;

// Validaciones de entrada para crear, editar y revisar solicitudes de arriendo.
const createRequestSchema = Joi.object({
  propertyId: Joi.string().trim().pattern(cuidPattern).required(),
  desiredMoveIn: Joi.date().iso().greater('now').required(),
  leaseMonths: Joi.number().integer().min(1).max(60).required(),
  occupants: Joi.number().integer().min(1).max(12).required(),
  monthlyIncome: Joi.number().integer().min(0).allow(null),
  hasPets: Joi.boolean().default(false),
  phone: Joi.string().trim().pattern(colombianPhonePattern).required().messages({
    'string.pattern.base': 'El teléfono debe ser un celular colombiano válido, por ejemplo +57 300 000 0000.',
  }),
  message: Joi.string().trim().min(20).max(1000).required(),
});

const updateRequestSchema = Joi.object({
  desiredMoveIn: Joi.date().iso().greater('now'),
  leaseMonths: Joi.number().integer().min(1).max(60),
  occupants: Joi.number().integer().min(1).max(12),
  monthlyIncome: Joi.number().integer().min(0).allow(null),
  hasPets: Joi.boolean(),
  phone: Joi.string().trim().pattern(colombianPhonePattern).messages({
    'string.pattern.base': 'El teléfono debe ser un celular colombiano válido, por ejemplo +57 300 000 0000.',
  }),
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
