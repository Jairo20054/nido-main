const express = require('express');
const { asyncHandler } = require('../../shared/asyncHandler');
const { requireAuth } = require('../../shared/auth');
const { validate } = require('../../shared/validate');
const { loginSchema, registerSchema } = require('./auth.schemas');
const controller = require('./auth.controller');

const router = express.Router();

router.post('/register', validate(registerSchema), asyncHandler(controller.register));
router.post('/login', validate(loginSchema), asyncHandler(controller.login));
router.post('/logout', asyncHandler(controller.logout));
router.get('/me', requireAuth, asyncHandler(controller.me));

module.exports = router;
