const express = require('express');
const router = express.Router();
const servicesController = require('../controllers/servicesController');
const validate = require('../middleware/validate');
const Joi = require('joi');

const searchSchema = Joi.object({
    q: Joi.string().allow('').optional(),
    category: Joi.string().optional(),
    city: Joi.string().optional(),
    priceMin: Joi.number().min(0).optional(),
    priceMax: Joi.number().min(0).optional(),
    sort: Joi.string().valid('price_asc', 'price_desc', 'recent').optional(),
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).max(100).optional()
});

router.get('/', validate(searchSchema, 'query'), servicesController.getServices);

module.exports = router;
