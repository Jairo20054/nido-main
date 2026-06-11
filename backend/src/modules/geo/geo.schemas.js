const Joi = require('joi');

const latitude = Joi.number().min(-90).max(90).required();
const longitude = Joi.number().min(-180).max(180).required();

const nearbyQuerySchema = Joi.object({
  lat: latitude,
  lng: longitude,
  radiusKm: Joi.number().min(0.1).max(50).default(5),
  limit: Joi.number().integer().min(1).max(50).default(20),
});

const routeQuerySchema = Joi.object({
  fromLat: latitude,
  fromLng: longitude,
  toLat: latitude,
  toLng: longitude,
  profile: Joi.string().valid('driving-car', 'foot-walking', 'cycling-regular').default('driving-car'),
});

const geocodeSchema = Joi.object({
  address: Joi.string().trim().min(3).max(220).required(),
});

const reverseGeocodeSchema = Joi.object({
  latitude,
  longitude,
});

module.exports = {
  geocodeSchema,
  nearbyQuerySchema,
  reverseGeocodeSchema,
  routeQuerySchema,
};
