const express = require('express');
const { asyncHandler } = require('../../shared/asyncHandler');
const { requireAuth } = require('../../shared/auth');
const { paginationQuerySchema } = require('../../shared/pagination');
const { validate } = require('../../shared/validate');
const controller = require('./favorite.controller');

// Rutas privadas de gestion de favoritos.
const router = express.Router();

router.use(requireAuth);
router.get('/', validate(paginationQuerySchema, 'query'), asyncHandler(controller.listFavorites));
router.post('/:propertyId', asyncHandler(controller.addFavorite));
router.delete('/:propertyId', asyncHandler(controller.removeFavorite));

module.exports = router;
