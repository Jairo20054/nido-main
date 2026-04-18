const express = require('express');
const propertyController = require('../controllers/property.controller');
const validateRequest = require('../middleware/validate-request');
const { authenticate, requireRole } = require('../middleware/auth');
const propertySchemas = require('../schemas/property.schemas');

const router = express.Router();

router.get('/', validateRequest(propertySchemas.query, 'query'), propertyController.listProperties);
router.get('/mine', authenticate, requireRole('HOST', 'ADMIN'), validateRequest(propertySchemas.query, 'query'), propertyController.listMyProperties);
router.get('/:id', propertyController.getPropertyById);
router.post('/', authenticate, requireRole('HOST', 'ADMIN'), validateRequest(propertySchemas.create), propertyController.createProperty);
router.put('/:id', authenticate, requireRole('HOST', 'ADMIN'), validateRequest(propertySchemas.update), propertyController.updateProperty);
router.delete('/:id', authenticate, requireRole('HOST', 'ADMIN'), propertyController.deleteProperty);

module.exports = router;
