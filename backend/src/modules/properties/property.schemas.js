const Joi = require('joi');
const { MediaType, PropertyStatus, PropertyType, RentalType } = require('@prisma/client');

const PROPERTY_MEDIA_URL_MAX_LENGTH = 2048;
const MAX_IMAGE_COUNT = 20;
const MIN_PUBLISH_IMAGE_COUNT = 3;
const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024;
const MAX_VIDEO_SIZE_BYTES = 20 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_MIME_TYPES = ['video/mp4', 'video/webm', 'video/external'];
const EXTERNAL_VIDEO_URL_PATTERN = /^https:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\//i;
const SAFE_PHONE_PATTERN = /^\+?[0-9\s().-]{7,20}$/;
const UNSAFE_TEXT_PATTERN = /<\s*\/?\s*[a-z][^>]*>|javascript:|data:text\/html/i;

const safeText = (value, helpers) => {
  if (typeof value === 'string' && UNSAFE_TEXT_PATTERN.test(value)) {
    return helpers.message('No incluyas HTML, scripts ni enlaces potencialmente inseguros.');
  }

  return value;
};

const text = (schema) => schema.custom(safeText, 'validacion de texto seguro');
const optionalText = (max) => text(Joi.string().trim().max(max).allow('', null));
const requiredText = (min, max) => text(Joi.string().trim().min(min).max(max).required());
const phoneText = optionalText(32).pattern(SAFE_PHONE_PATTERN).messages({
  'string.pattern.base': 'Ingresa un teléfono válido.',
});
const enumText = (...values) => text(Joi.string().valid(...values));
const listText = (min = 2, max = 60) => text(Joi.string().trim().min(min).max(max));

const ensureMediaSafety = (payload, helpers) => {
  const mimeType = payload.mimeType || '';

  if (payload.type === MediaType.IMAGE) {
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(mimeType)) {
      return helpers.message('Las imágenes deben estar en JPG, PNG o WebP.');
    }

    if (payload.sizeBytes && payload.sizeBytes > MAX_IMAGE_SIZE_BYTES) {
      return helpers.message('Cada imagen debe pesar máximo 4 MB.');
    }
  }

  if (payload.type === MediaType.VIDEO) {
    if (mimeType && !ALLOWED_VIDEO_MIME_TYPES.includes(mimeType)) {
      return helpers.message('El video debe estar en MP4, WebM o ser un enlace permitido.');
    }

    if (mimeType === 'video/external' && !EXTERNAL_VIDEO_URL_PATTERN.test(payload.url)) {
      return helpers.message('El enlace de video debe ser de YouTube o Vimeo.');
    }

    if (payload.sizeBytes && payload.sizeBytes > MAX_VIDEO_SIZE_BYTES) {
      return helpers.message('El video debe pesar máximo 20 MB.');
    }
  }

  return payload;
};

// Esquemas de validacion para el payload de propiedades y sus consultas.
const propertyMediaSchema = Joi.object({
  id: Joi.string().trim().optional(),
  type: Joi.string().valid(MediaType.IMAGE, MediaType.VIDEO).required(),
  url: Joi.string()
    .trim()
    .uri({ scheme: ['http', 'https'] })
    .max(PROPERTY_MEDIA_URL_MAX_LENGTH)
    .required(),
  alt: optionalText(160),
  position: Joi.number().integer().min(0).required(),
  mimeType: Joi.string().trim().max(80).allow('', null),
  sizeBytes: Joi.number().integer().min(0).max(MAX_VIDEO_SIZE_BYTES).allow(null),
}).custom(ensureMediaSafety);

const propertyPayloadSchema = Joi.object({
  title: requiredText(8, 100),
  summary: requiredText(20, 180),
  description: requiredText(80, 4000),
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
  city: requiredText(2, 60),
  department: optionalText(60),
  neighborhood: optionalText(80),
  addressLine: requiredText(4, 160),
  addressDetail: optionalText(160),
  hideExactAddress: Joi.boolean().default(false),
  zoneReference: optionalText(180),
  monthlyRent: Joi.number().integer().min(100000).required(),
  maintenanceFee: Joi.number().integer().min(0).default(0),
  administrationIncluded: Joi.boolean().default(false),
  securityDeposit: Joi.number().integer().min(0).default(0),
  depositRequired: Joi.boolean().default(false),
  servicesIncluded: Joi.array().items(listText()).max(16).default([]),
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
  balcony: Joi.boolean().default(false),
  equippedKitchen: Joi.boolean().default(false),
  laundryArea: Joi.boolean().default(false),
  elevator: Joi.boolean().default(false),
  doorman: Joi.boolean().default(false),
  security: Joi.boolean().default(false),
  commonAreas: Joi.boolean().default(false),
  minLeaseMonths: Joi.number().integer().min(1).max(60).default(6),
  amenities: Joi.array().items(listText()).max(24).default([]),
  rules: optionalText(1200),
  requirements: optionalText(1200),
  idealTenantProfile: optionalText(600),
  specialConditions: optionalText(1200),
  contactMethod: optionalText(280),
  verificationDetails: optionalText(1200),
  contactName: optionalText(100),
  contactDocumentType: optionalText(32),
  contactDocumentNumber: optionalText(40),
  contactPhone: phoneText,
  contactWhatsapp: phoneText,
  contactEmail: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).max(120).allow('', null),
  contactRelationship: enumText('OWNER', 'ADMINISTRATOR', 'REAL_ESTATE', 'ATTORNEY', 'OTHER').allow('', null),
  contactHours: optionalText(120),
  contactPreference: enumText('WHATSAPP', 'PHONE', 'EMAIL').allow('', null),
  publishingAuthorization: Joi.boolean().default(false),
  acceptsStudents: Joi.boolean().default(false),
  acceptsFamilies: Joi.boolean().default(false),
  acceptsCosigner: Joi.boolean().default(false),
  requiresRentalStudy: Joi.boolean().default(false),
  visitsAllowed: Joi.boolean().default(false),
  visitHours: optionalText(160),
  visitNotes: optionalText(600),
  latitude: Joi.number().min(-90).max(90).allow(null),
  longitude: Joi.number().min(-180).max(180).allow(null),
  media: Joi.array().items(propertyMediaSchema).max(MAX_IMAGE_COUNT + 1).required(),
  reviewNote: optionalText(1000),
});

// Reglas de negocio adicionales que no se expresan comodamente solo con tipos.
const ensureMediaRules = (payload, helpers) => {
  const images = payload.media.filter((item) => item.type === MediaType.IMAGE);
  const videoEntries = payload.media.filter((item) => item.type === MediaType.VIDEO);

  if (images.length < MIN_PUBLISH_IMAGE_COUNT && payload.status !== PropertyStatus.DRAFT) {
    return helpers.error('any.custom', {
      message: `Necesitas al menos ${MIN_PUBLISH_IMAGE_COUNT} imágenes para enviar o publicar la propiedad`,
    });
  }

  if (!payload.city || !payload.addressLine || !payload.monthlyRent) {
    return helpers.error('any.custom', {
      message: 'Ciudad, dirección y valor mensual del arriendo son obligatorios',
    });
  }

  if (videoEntries.length > 1) {
    return helpers.error('any.custom', {
      message: 'Solo puedes adjuntar un video por publicación',
    });
  }

  if (!payload.availableImmediately && !payload.availableFrom) {
    return helpers.error('any.custom', {
      message: 'Define disponibilidad inmediata o una fecha disponible',
    });
  }

  if (
    payload.status !== PropertyStatus.DRAFT &&
    (!payload.contactName || (!payload.contactPhone && !payload.contactEmail))
  ) {
    return helpers.error('any.custom', {
      message: 'Completa la información del propietario o responsable antes de enviar la publicación',
    });
  }

  if (payload.status !== PropertyStatus.DRAFT && !payload.publishingAuthorization) {
    return helpers.error('any.custom', {
      message: 'Debes confirmar que tienes autorización para publicar esta propiedad',
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
  limit: Joi.number().integer().min(1).max(50).default(9),
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
