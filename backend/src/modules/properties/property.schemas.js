const Joi = require('joi');
const { MediaType, PropertyStatus, PropertyType, RentalType } = require('@prisma/client');

// Esquemas de validacion para el payload de propiedades y sus consultas.
const propertyMediaSchema = Joi.object({
  id: Joi.string().trim().optional(),
  type: Joi.string().valid(MediaType.IMAGE, MediaType.VIDEO).required(),
  url: Joi.string().trim().min(12).max(4000000).required(),
  alt: Joi.string().trim().max(160).allow('', null),
  position: Joi.number().integer().min(0).required(),
  mimeType: Joi.string().trim().max(80).allow('', null),
  sizeBytes: Joi.number().integer().min(0).max(30000000).allow(null),
});

const propertyPayloadSchema = Joi.object({
  title: Joi.string().trim().min(8).max(100).required(),
  summary: Joi.string().trim().min(20).max(180).required(),
  description: Joi.string().trim().min(80).max(4000).required(),
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
  rentalType: Joi.string()
    .valid(RentalType.FULL_HOME, RentalType.ROOM_ONLY, RentalType.SHARED_HOME)
    .required(),
  status: Joi.string()
    .valid(
      PropertyStatus.DRAFT,
      PropertyStatus.PENDING,
      PropertyStatus.APPROVED,
      PropertyStatus.REJECTED,
      PropertyStatus.PUBLISHED,
      PropertyStatus.RENTED,
      PropertyStatus.ARCHIVED
    )
    .default(PropertyStatus.DRAFT),
  city: Joi.string().trim().min(2).max(60).required(),
  neighborhood: Joi.string().trim().max(80).allow('', null),
  addressLine: Joi.string().trim().min(4).max(160).required(),
  zoneReference: Joi.string().trim().max(180).allow('', null),
  monthlyRent: Joi.number().integer().min(100000).required(),
  maintenanceFee: Joi.number().integer().min(0).default(0),
  securityDeposit: Joi.number().integer().min(0).default(0),
  availableImmediately: Joi.boolean().default(false),
  availableFrom: Joi.date().iso().allow(null),
  bedrooms: Joi.number().integer().min(0).max(12).required(),
  bathrooms: Joi.number().integer().min(1).max(12).required(),
  areaM2: Joi.number().integer().min(10).max(2000).required(),
  floor: Joi.number().integer().min(0).max(150).allow(null),
  parkingSpots: Joi.number().integer().min(0).max(10).default(0),
  strata: Joi.number().integer().min(0).max(10).allow(null),
  maxOccupants: Joi.number().integer().min(1).max(20).required(),
  furnished: Joi.boolean().default(false),
  petsAllowed: Joi.boolean().default(false),
  utilitiesIncluded: Joi.boolean().default(false),
  minLeaseMonths: Joi.number().integer().min(1).max(60).default(6),
  amenities: Joi.array().items(Joi.string().trim().min(2).max(60)).max(24).default([]),
  rules: Joi.string().trim().max(1200).allow('', null),
  requirements: Joi.string().trim().max(1200).allow('', null),
  idealTenantProfile: Joi.string().trim().max(600).allow('', null),
  specialConditions: Joi.string().trim().max(1200).allow('', null),
  contactMethod: Joi.string().trim().max(280).allow('', null),
  verificationDetails: Joi.string().trim().max(1200).allow('', null),
  latitude: Joi.number().min(-90).max(90).allow(null),
  longitude: Joi.number().min(-180).max(180).allow(null),
  media: Joi.array().items(propertyMediaSchema).max(13).required(),
  reviewNote: Joi.string().trim().max(1000).allow('', null),
});

// Reglas de negocio adicionales que no se expresan comodamente solo con tipos.
const ensureMediaRules = (payload, helpers) => {
  const images = payload.media.filter((item) => item.type === MediaType.IMAGE);
  const videoEntries = payload.media.filter((item) => item.type === MediaType.VIDEO);

  if (images.length < 4 && payload.status !== PropertyStatus.DRAFT) {
    return helpers.error('any.custom', {
      message: 'Necesitas al menos 4 fotos para enviar o publicar la vivienda',
    });
  }

  if (!payload.city || !payload.addressLine || !payload.monthlyRent) {
    return helpers.error('any.custom', {
      message: 'Ciudad, direccion y canon mensual son obligatorios',
    });
  }

  if (videoEntries.length > 1) {
    return helpers.error('any.custom', {
      message: 'Solo puedes adjuntar un video por publicacion',
    });
  }

  if (!payload.availableImmediately && !payload.availableFrom) {
    return helpers.error('any.custom', {
      message: 'Define disponibilidad inmediata o una fecha disponible',
    });
  }

  return payload;
};

const createPropertySchema = propertyPayloadSchema.custom(ensureMediaRules);

const updatePropertySchema = propertyPayloadSchema
  .fork(Object.keys(propertyPayloadSchema.describe().keys), (schema) => schema.optional())
  .min(1)
  .custom((value, helpers) => {
    if (value.media) {
      return ensureMediaRules(
        {
          ...value,
          status: value.status || PropertyStatus.DRAFT,
          city: value.city || 'tmp',
          addressLine: value.addressLine || 'tmp',
          monthlyRent: value.monthlyRent || 1,
          availableImmediately: value.availableImmediately ?? true,
        },
        helpers
      );
    }

    return value;
  });

const propertyQuerySchema = Joi.object({
  q: Joi.string().trim().allow('', null),
  city: Joi.string().trim().allow('', null),
  neighborhood: Joi.string().trim().allow('', null),
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
  utilitiesIncluded: Joi.boolean(),
  status: Joi.string().valid(
    PropertyStatus.DRAFT,
    PropertyStatus.PENDING,
    PropertyStatus.APPROVED,
    PropertyStatus.REJECTED,
    PropertyStatus.PUBLISHED,
    PropertyStatus.RENTED,
    PropertyStatus.ARCHIVED
  ),
  sort: Joi.string().valid('recommended', 'latest', 'rent-asc', 'rent-desc').default('recommended'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(24).default(9),
});

const propertyStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      PropertyStatus.DRAFT,
      PropertyStatus.PENDING,
      PropertyStatus.APPROVED,
      PropertyStatus.REJECTED,
      PropertyStatus.PUBLISHED,
      PropertyStatus.RENTED,
      PropertyStatus.ARCHIVED
    )
    .required(),
  reviewNote: Joi.string().trim().max(1000).allow('', null),
});

module.exports = {
  createPropertySchema,
  propertyQuerySchema,
  propertyStatusSchema,
  updatePropertySchema,
};
