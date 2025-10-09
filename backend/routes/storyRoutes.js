// routes/storyRoutes.js - Rutas para gestión de historias

const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const auth = require('../middleware/auth');
const router = require('express').Router();

// Middleware de autenticación para rutas protegidas
const requireAuth = auth.verifyToken;

// Aplicar middleware de autenticación a todas las rutas
router.use(requireAuth);

/**
 * @route GET /api/stories
 * @desc Obtener todas las historias activas
 * @access Private
 */
router.get('/', storyController.getStories);

/**
 * @route GET /api/stories/user/:userId
 * @desc Obtener historias de un usuario específico
 * @access Private
 */
router.get('/user/:userId', storyController.getUserStories);

/**
 * @route POST /api/stories
 * @desc Crear una nueva historia con media proporcionado
 * @access Private
 */
router.post('/', storyController.createStory);

/**
 * @route POST /api/stories/upload
 * @desc Subir archivo y crear historia automáticamente
 * @access Private
 */
router.post('/upload', storyController.upload, storyController.uploadStoryMedia);

/**
 * @route DELETE /api/stories/:id
 * @desc Eliminar una historia (solo el propietario)
 * @access Private
 */
router.delete('/:id', storyController.deleteStory);

module.exports = router;
