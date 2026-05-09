const express = require('express');
const { asyncHandler } = require('../../shared/asyncHandler');
const { createRateLimiter } = require('../../shared/rateLimit');
const { validate } = require('../../shared/validate');
const controller = require('./deepsek.controller');
const { analyzeSchema } = require('./deepsek.schemas');

const router = express.Router();
const analyzeLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 12,
  keyPrefix: 'deepsek-analyze',
  message: 'Demasiadas solicitudes de analisis. Intenta nuevamente en un momento',
});

router.post('/analyze', analyzeLimiter, validate(analyzeSchema), asyncHandler(controller.analyze));

module.exports = router;
