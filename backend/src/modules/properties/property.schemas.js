const Joi = require('joi');
const { PropertyStatus, PropertyType } = require('@prisma/client');

const propertyPayloadSchema = Joi.object({
  title: Joi.string().trim().min(8).max(100).required(),
  summary: Joi.string().trim().min(20).max(180).required(),
  description: Joi.string().trim().min(80).max(3000).required(),
  propertyType: Joi.string()
    .valid(
      PropertyType.APARTMENT,
      PropertyType.HOUSE,
      PropertyType.STUDIO,
      PropertyType.LOFT,
      PropertyType.PENTHOUSE,
      PropertyType.ROOM
    )
    .required(),
  status: Joi.string()
    .valid(
      PropertyStatus.DRAFT,
      PropertyStatus.PUBLISHED,
      PropertyStatus.RENTED,
      PropertyStatus.ARCHIVED
    )
    .default(PropertyStatus.PUBLISHED),
  city: Joi.string().trim().min(2).max(60).required(),
  neighborhood: Joi.string().trim().max(80).allow('', null),
  addressLine: Joi.string().trim().min(4).max(120).required(),
  monthlyRent: Joi.number().integer().min(500000).required(),
  maintenanceFee: Joi.number().integer().min(0).default(0),
  securityDeposit: Joi.number().integer().min(0).default(0),
  bedrooms: Joi.number().integer().min(0).max(12).required(),
  bathrooms: Joi.number().integer().min(1).max(12).required(),
  areaM2: Joi.number().integer().min(18).max(1500).required(),
  parkingSpots: Joi.number().integer().min(0).max(10).default(0),
  maxOccupants: Joi.number().integer().min(1).max(20).required(),
  furnished: Joi.boolean().default(false),
  petsAllowed: Joi.boolean().default(false),
  availableFrom: Joi.date().iso().required(),
  minLeaseMonths: Joi.number().integer().min(1).max(60).default(6),
  amenities: Joi.array().items(Joi.string().trim().min(2).max(40)).max(20).default([]),
  images: Joi.array().items(Joi.string().trim().uri()).max(12).default([]),
  latitude: Joi.number().min(-90).max(90).allow(null),
  longitude: Joi.number().min(-180).max(180).allow(null),
});

const createPropertySchema = propertyPayloadSchema.keys({
  images: Joi.array().items(Joi.string().trim().uri()).min(1).max(12).required(),
});

const updatePropertySchema = propertyPayloadSchema
  .fork(Object.keys(propertyPayloadSchema.describe().keys), (schema) => schema.optional())
  .min(1);

const propertyQuerySchema = Joi.object({
  q: Joi.string().trim().allow('', null),
  city: Joi.string().trim().allow('', null),
  propertyType: Joi.string().valid(
    PropertyType.APARTMENT,
    PropertyType.HOUSE,
    PropertyType.STUDIO,
    PropertyType.LOFT,
    PropertyType.PENTHOUSE,
    PropertyType.ROOM
  ),
  minRent: Joi.number().integer().min(0),
  maxRent: Joi.number().integer().min(0),
  bedrooms: Joi.number().integer().min(0).max(12),
  bathrooms: Joi.number().integer().min(1).max(12),
  furnished: Joi.boolean(),
  petsAllowed: Joi.boolean(),
  minLeaseMonths: Joi.number().integer().min(1).max(60),
  availableFrom: Joi.date().iso(),
  sort: Joi.string().valid('recommended', 'latest', 'rent-asc', 'rent-desc').default('recommended'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(24).default(9),
});

module.exports = {
  createPropertySchema,
  propertyQuerySchema,
  updatePropertySchema,
};
