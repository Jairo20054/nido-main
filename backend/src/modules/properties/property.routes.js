const express = require('express');
const { asyncHandler } = require('../../shared/asyncHandler');
const { optionalAuth, requireAuth, requireRoles } = require('../../shared/auth');
const { paginationQuerySchema } = require('../../shared/pagination');
const { validate } = require('../../shared/validate');
const {
  createPropertySchema,
  propertyLocationSchema,
  propertyQuerySchema,
  propertyStatusSchema,
  updatePropertySchema,
} = require('./property.schemas');
const controller = require('./property.controller');

// Rutas del modulo de propiedades con permisos diferenciados segun el caso de uso.
const router = express.Router();

router.get('/', optionalAuth, validate(propertyQuerySchema, 'query'), asyncHandler(controller.listProperties));
router.get('/featured', optionalAuth, asyncHandler(controller.getFeaturedProperties));
router.get('/mine', requireAuth, validate(paginationQuerySchema, 'query'), asyncHandler(controller.getMyProperties));
router.post(
  '/',
  requireRoles('LANDLORD', 'ADMIN'),
  validate(createPropertySchema),
  asyncHandler(controller.createProperty)
);
router.patch(
  '/:id/status',
  requireRoles('ADMIN'),
  validate(propertyStatusSchema),
  asyncHandler(controller.changePropertyStatus)
);
router.patch(
  '/:id/location',
  requireAuth,
  validate(propertyLocationSchema),
  asyncHandler(controller.updatePropertyLocation)
);
router.get('/:id', optionalAuth, asyncHandler(controller.getPropertyById));
router.patch('/:id', requireAuth, validate(updatePropertySchema), asyncHandler(controller.updateProperty));
router.delete('/:id', requireAuth, asyncHandler(controller.deleteProperty));

module.exports = router;
