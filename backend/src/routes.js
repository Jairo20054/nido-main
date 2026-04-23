const express = require('express');
const authRoutes = require('./modules/auth/auth.routes');
const propertyRoutes = require('./modules/properties/property.routes');
const userRoutes = require('./modules/users/user.routes');
const favoriteRoutes = require('./modules/favorites/favorite.routes');
const requestRoutes = require('./modules/requests/request.routes');
const applicationRoutes = require('./modules/applications/application.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/properties', propertyRoutes);
router.use('/applications', applicationRoutes);
router.use('/users', userRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/requests', requestRoutes);

module.exports = router;
