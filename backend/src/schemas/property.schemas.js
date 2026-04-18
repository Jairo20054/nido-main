const Joi = require('joi');

const basePropertyShape = {
  title: Joi.string().trim().min(5).max(120),
  description: Joi.string().trim().min(40).max(1200),
  propertyType: Joi.string().valid('APARTMENT', 'HOUSE', 'STUDIO', 'LOFT', 'ROOM'),
  status: Joi.string().valid('ACTIVE', 'DRAFT', 'ARCHIVED'),
  city: Joi.string().trim().min(2).max(80),
  neighborhood: Joi.string().trim().min(2).max(80),
  address: Joi.string().trim().min(5).max(180),
  monthlyRent: Joi.number().integer().min(1),
  adminFee: Joi.number().integer().min(0),
  deposit: Joi.number().integer().min(0),
  areaM2: Joi.number().integer().min(10),
  bedrooms: Joi.number().integer().min(0),
  bathrooms: Joi.number().min(0.5).max(10),
  parkingSpots: Joi.number().integer().min(0),
  furnished: Joi.boolean(),
  petFriendly: Joi.boolean(),
  utilitiesIncluded: Joi.boolean(),
  featured: Joi.boolean(),
  availableFrom: Joi.date().iso(),
  leaseTermMonths: Joi.number().integer().min(1).max(36),
  coverImage: Joi.string().trim().min(1),
  gallery: Joi.array().items(Joi.string().trim().min(1)).min(1).max(12),
  amenities: Joi.array().items(Joi.string().trim().min(1).max(60)).max(20)
};

module.exports = {
  query: Joi.object({
    search: Joi.string().trim().allow('').optional(),
    city: Joi.string().trim().optional(),
    neighborhood: Joi.string().trim().optional(),
    propertyType: Joi.string().valid('APARTMENT', 'HOUSE', 'STUDIO', 'LOFT', 'ROOM').optional(),
    minRent: Joi.number().integer().min(0).optional(),
    maxRent: Joi.number().integer().min(0).optional(),
    bedrooms: Joi.number().integer().min(0).optional(),
    bathrooms: Joi.number().min(0).optional(),
    furnished: Joi.boolean().optional(),
    petFriendly: Joi.boolean().optional(),
    featured: Joi.boolean().optional(),
    status: Joi.string().valid('ACTIVE', 'DRAFT', 'ARCHIVED').optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(24).default(9),
    sort: Joi.string().valid('newest', 'rent-asc', 'rent-desc', 'size-desc').default('newest')
  }),
  create: Joi.object({
    ...basePropertyShape,
    title: basePropertyShape.title.required(),
    description: basePropertyShape.description.required(),
    propertyType: basePropertyShape.propertyType.required(),
    city: basePropertyShape.city.required(),
    neighborhood: basePropertyShape.neighborhood.required(),
    address: basePropertyShape.address.required(),
    monthlyRent: basePropertyShape.monthlyRent.required(),
    areaM2: basePropertyShape.areaM2.required(),
    bedrooms: basePropertyShape.bedrooms.required(),
    bathrooms: basePropertyShape.bathrooms.required(),
    availableFrom: basePropertyShape.availableFrom.required(),
    coverImage: basePropertyShape.coverImage.required(),
    gallery: basePropertyShape.gallery.required(),
    amenities: basePropertyShape.amenities.required()
  }),
  update: Joi.object(basePropertyShape).min(1)
};
