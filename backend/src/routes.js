const express = require('express');
const adminRoutes = require('./modules/admin/admin.routes');
const authRoutes = require('./modules/auth/auth.routes');
const propertyRoutes = require('./modules/properties/property.routes');
const userRoutes = require('./modules/users/user.routes');
const favoriteRoutes = require('./modules/favorites/favorite.routes');
const applicationRoutes = require('./modules/applications/application.routes');
const requestRoutes = require('./modules/requests/request.routes');

// Router raiz que compone los modulos funcionales del backend.
const router = express.Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/properties', propertyRoutes);
router.use('/applications', applicationRoutes);
router.use('/requests', requestRoutes);
router.use('/users', userRoutes);
router.use('/favorites', favoriteRoutes);

module.exports = router;
