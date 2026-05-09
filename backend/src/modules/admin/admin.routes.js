const express = require('express');
const { asyncHandler } = require('../../shared/asyncHandler');
const { requireAdmin } = require('../../shared/auth');
const { paginationQuerySchema } = require('../../shared/pagination');
const { validate } = require('../../shared/validate');
const propertyController = require('../properties/property.controller');
const { propertyQuerySchema, propertyStatusSchema, updatePropertySchema } = require('../properties/property.schemas');
const controller = require('./admin.controller');

// Rutas exclusivas del rol administrador.
const router = express.Router();

router.use(requireAdmin);
router.get('/properties', validate(propertyQuerySchema, 'query'), asyncHandler(controller.listAdminProperties));
router.get('/landlords', validate(paginationQuerySchema, 'query'), asyncHandler(controller.listLandlords));
router.get('/stats', asyncHandler(propertyController.getAdminPropertyStats));
router.patch('/properties/:id', validate(updatePropertySchema), asyncHandler(propertyController.updateProperty));
router.patch('/properties/:id/status', validate(propertyStatusSchema), asyncHandler(propertyController.changePropertyStatus));
router.delete('/properties/:id', asyncHandler(propertyController.deleteProperty));

module.exports = router;
