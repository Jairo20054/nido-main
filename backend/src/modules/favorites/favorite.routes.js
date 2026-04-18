const express = require('express');
const { asyncHandler } = require('../../shared/asyncHandler');
const { requireAuth } = require('../../shared/auth');
const controller = require('./favorite.controller');

const router = express.Router();

router.use(requireAuth);
router.get('/', asyncHandler(controller.listFavorites));
router.post('/:propertyId', asyncHandler(controller.addFavorite));
router.delete('/:propertyId', asyncHandler(controller.removeFavorite));

module.exports = router;
