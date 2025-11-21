const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');
const validate = require('../middleware/validate');
const Joi = require('joi');

const searchSchema = Joi.object({
    q: Joi.string().allow('').optional(),
    category: Joi.string().optional(),
    brand: Joi.string().optional(),
    condition: Joi.string().valid('new', 'used').optional(),
    city: Joi.string().optional(),
    priceMin: Joi.number().min(0).optional(),
    priceMax: Joi.number().min(0).optional(),
    shippingAvailable: Joi.boolean().optional(),
    sort: Joi.string().valid('price_asc', 'price_desc', 'recent').optional(),
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).max(100).optional()
});

router.get('/', validate(searchSchema, 'query'), productsController.getProducts);

module.exports = router;
