const express = require('express');
const router = express.Router();

// Importar las rutas individuales
const authRoutes = require('./authRoutes');
const propertyRoutes = require('./propertyRoutes');
const userRoutes = require('./userRoutes');
const bookingRoutes = require('./bookingRoutes');
const storyRoutes = require('./storyRoutes');

// Ruta para imágenes placeholder
router.get('/placeholder/:width/:height', (req, res) => {
  const { width, height } = req.params;
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#cccccc"/>
      <text x="50%" y="50%" font-family="Arial" font-size="20" fill="#666666" text-anchor="middle" dy=".3em">${width}x${height}</text>
    </svg>
  `;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
});

// Usar las rutas individuales
router.use('/auth', authRoutes);
router.use('/properties', propertyRoutes);
router.use('/users', userRoutes);
router.use('/bookings', bookingRoutes);
router.use('/stories', storyRoutes);

module.exports = router;
