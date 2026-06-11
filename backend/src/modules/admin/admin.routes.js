const express = require('express');
const Joi = require('joi');
const { asyncHandler } = require('../../shared/asyncHandler');
const { requireAdmin } = require('../../shared/auth');
const { paginationQuerySchema } = require('../../shared/pagination');
const { validate } = require('../../shared/validate');
const propertyController = require('../properties/property.controller');
const { propertyQuerySchema, propertyStatusSchema, updatePropertySchema } = require('../properties/property.schemas');
const controller = require('./admin.controller');

// Rutas exclusivas del rol administrador.
const router = express.Router();
const adminPublicationsQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(20).default(5),
  sort: Joi.string().valid('createdAt:desc', 'createdAt:asc').default('createdAt:desc'),
});
const adminLandlordsQuerySchema = paginationQuerySchema.keys({
  sort: Joi.string().valid('propertiesCount:desc', 'createdAt:desc').default('createdAt:desc'),
});

router.use(...requireAdmin);
router.get('/properties', validate(propertyQuerySchema, 'query'), asyncHandler(controller.listAdminProperties));
router.get('/publications', validate(adminPublicationsQuerySchema, 'query'), asyncHandler(controller.listAdminPublications));
router.get('/landlords', validate(adminLandlordsQuerySchema, 'query'), asyncHandler(controller.listLandlords));
router.get('/stats', asyncHandler(controller.getAdminStats));
router.get('/config/marketplace', asyncHandler(controller.getMarketplaceConfig));
router.patch('/properties/:id', validate(updatePropertySchema), asyncHandler(propertyController.updateProperty));
router.patch('/properties/:id/status', validate(propertyStatusSchema), asyncHandler(propertyController.changePropertyStatus));
router.delete('/properties/:id', asyncHandler(propertyController.deleteProperty));

module.exports = router;
