const express = require('express');
const { asyncHandler } = require('../../shared/asyncHandler');
const { requireAuth } = require('../../shared/auth');
const { validate } = require('../../shared/validate');
const { deleteProfileSchema, updateProfileSchema } = require('./user.schemas');
const controller = require('./user.controller');

const router = express.Router();

router.use(requireAuth);
router.get('/me', asyncHandler(controller.getProfile));
router.patch('/me', validate(updateProfileSchema), asyncHandler(controller.updateProfile));
router.delete('/me', validate(deleteProfileSchema), asyncHandler(controller.deleteProfile));

module.exports = router;
