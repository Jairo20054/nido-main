const express = require('express');
const { asyncHandler } = require('../../shared/asyncHandler');
const { requireAuth } = require('../../shared/auth');
const { validate } = require('../../shared/validate');
const { createRequestSchema, reviewRequestSchema, updateRequestSchema } = require('./request.schemas');
const controller = require('./request.controller');

const router = express.Router();

router.use(requireAuth);
router.get('/mine', asyncHandler(controller.getMyRequests));
router.get('/received', asyncHandler(controller.getReceivedRequests));
router.get('/:id', asyncHandler(controller.getRequestById));
router.post('/', validate(createRequestSchema), asyncHandler(controller.createRequest));
router.patch('/:id', validate(updateRequestSchema), asyncHandler(controller.updateRequest));
router.patch('/:id/status', validate(reviewRequestSchema), asyncHandler(controller.reviewRequest));
router.delete('/:id', asyncHandler(controller.deleteRequest));

module.exports = router;
