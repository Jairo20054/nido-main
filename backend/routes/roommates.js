const express = require('express');
const router = express.Router();
const roommatesController = require('../controllers/roommatesController');
const validate = require('../middleware/validate');
const Joi = require('joi');

const searchSchema = Joi.object({
    q: Joi.string().allow('').optional(),
    city: Joi.string().optional(),
    budgetMin: Joi.number().min(0).optional(),
    budgetMax: Joi.number().min(0).optional(),
    moveInDate: Joi.date().optional(),
    genderPreference: Joi.string().valid('male', 'female', 'any').optional(),
    petsAllowed: Joi.boolean().optional(),
    student: Joi.boolean().optional(),
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).max(100).optional()
});

router.get('/', validate(searchSchema, 'query'), roommatesController.getRoommates);

module.exports = router;
