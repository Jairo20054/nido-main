const express = require('express');
const userController = require('../controllers/user.controller');
const validateRequest = require('../middleware/validate-request');
const { authenticate, requireRole } = require('../middleware/auth');
const userSchemas = require('../schemas/user.schemas');

const router = express.Router();

router.use(authenticate);

router.get('/me', userController.getCurrentUser);
router.patch('/me', validateRequest(userSchemas.updateMe), userController.updateCurrentUser);
router.delete('/me', userController.deleteCurrentUser);
router.get('/me/favorites', userController.getFavoriteProperties);
router.post('/me/favorites/:propertyId', userController.addFavorite);
router.delete('/me/favorites/:propertyId', userController.removeFavorite);

router.get('/', requireRole('ADMIN'), userController.listUsers);
router.get('/:id', userController.getUserById);
router.patch('/:id', validateRequest(userSchemas.updateById), userController.updateUserById);
router.delete('/:id', userController.deleteUserById);

module.exports = router;
