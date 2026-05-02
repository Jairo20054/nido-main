const express = require('express');
const { asyncHandler } = require('../../shared/asyncHandler');
const { validate } = require('../../shared/validate');
const controller = require('./deepsek.controller');
const { analyzeSchema } = require('./deepsek.schemas');

const router = express.Router();

router.post('/analyze', validate(analyzeSchema), asyncHandler(controller.analyze));

module.exports = router;
