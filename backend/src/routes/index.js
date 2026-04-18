const express = require('express');
const authRoutes = require('./auth.routes');
const propertyRoutes = require('./property.routes');
const userRoutes = require('./user.routes');
const rentalRequestRoutes = require('./rental-request.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/properties', propertyRoutes);
router.use('/users', userRoutes);
router.use('/rental-requests', rentalRequestRoutes);

module.exports = router;
