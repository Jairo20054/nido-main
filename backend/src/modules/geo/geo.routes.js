const express = require('express');
const { asyncHandler } = require('../../shared/asyncHandler');
const { createRateLimiter } = require('../../shared/rateLimit');
const { validate } = require('../../shared/validate');
const controller = require('./geo.controller');
const {
  geocodeSchema,
  nearbyQuerySchema,
  reverseGeocodeSchema,
  routeQuerySchema,
} = require('./geo.schemas');

const router = express.Router();
const externalGeoLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  keyPrefix: 'geo-external',
  message: 'Demasiadas consultas de mapa. Intenta nuevamente en un momento',
});

router.get('/nearby', validate(nearbyQuerySchema, 'query'), asyncHandler(controller.getNearbyProperties));
router.get('/route', externalGeoLimiter, validate(routeQuerySchema, 'query'), asyncHandler(controller.getRoute));
router.post('/geocode', externalGeoLimiter, validate(geocodeSchema), asyncHandler(controller.geocode));
router.post('/reverse-geocode', externalGeoLimiter, validate(reverseGeocodeSchema), asyncHandler(controller.reverseGeocode));

module.exports = router;
