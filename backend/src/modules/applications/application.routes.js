const express = require('express');
const { asyncHandler } = require('../../shared/asyncHandler');
const { optionalAuth } = require('../../shared/auth');
const { validate } = require('../../shared/validate');
const { prequalifyApplicationSchema } = require('./application.schemas');
const controller = require('./application.controller');

const router = express.Router();

router.post(
  '/prequalify',
  optionalAuth,
  validate(prequalifyApplicationSchema),
  asyncHandler(controller.prequalifyApplication)
);

module.exports = router;
