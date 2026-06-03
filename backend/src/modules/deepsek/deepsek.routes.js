const express = require('express');
const { asyncHandler } = require('../../shared/asyncHandler');
const { requireAuth } = require('../../shared/auth');
const { createRateLimiter } = require('../../shared/rateLimit');
const { validate } = require('../../shared/validate');
const controller = require('./deepsek.controller');
const { analyzeSchema } = require('./deepsek.schemas');

const router = express.Router();
const analyzeLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 12,
  keyPrefix: 'deepsek-analyze',
  message: 'Demasiadas solicitudes de análisis. Intenta nuevamente en un momento',
});

router.post(
  '/analyze',
  analyzeLimiter,
  // [SECURITY FIX] Requiere sesion para proteger consumo de API server-side · Audit 2026
  requireAuth,
  validate(analyzeSchema),
  asyncHandler(controller.analyze)
);

module.exports = router;
