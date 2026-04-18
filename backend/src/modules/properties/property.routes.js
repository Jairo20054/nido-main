const express = require('express');
const { asyncHandler } = require('../../shared/asyncHandler');
const { optionalAuth, requireAuth } = require('../../shared/auth');
const { validate } = require('../../shared/validate');
const { createPropertySchema, propertyQuerySchema, updatePropertySchema } = require('./property.schemas');
const controller = require('./property.controller');

const router = express.Router();

router.get('/', optionalAuth, validate(propertyQuerySchema, 'query'), asyncHandler(controller.listProperties));
router.get('/featured', optionalAuth, asyncHandler(controller.getFeaturedProperties));
router.get('/mine', requireAuth, asyncHandler(controller.getMyProperties));
router.get('/:id', optionalAuth, asyncHandler(controller.getPropertyById));
router.post('/', requireAuth, validate(createPropertySchema), asyncHandler(controller.createProperty));
router.patch('/:id', requireAuth, validate(updatePropertySchema), asyncHandler(controller.updateProperty));
router.delete('/:id', requireAuth, asyncHandler(controller.deleteProperty));

module.exports = router;
