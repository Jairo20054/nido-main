const express = require('express');
const authController = require('../controllers/auth.controller');
const validateRequest = require('../middleware/validate-request');
const { authenticate } = require('../middleware/auth');
const authSchemas = require('../schemas/auth.schemas');

const router = express.Router();

router.post('/register', validateRequest(authSchemas.register), authController.register);
router.post('/login', validateRequest(authSchemas.login), authController.login);
router.get('/me', authenticate, authController.me);
router.post('/logout', authenticate, authController.logout);

module.exports = router;
