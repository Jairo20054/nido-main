const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const { validateQuery } = require('../middleware/validation');
const logger = require('../utils/logger');

/**
 * SEARCH API - Búsqueda avanzada con filtros reales
 * GET /api/properties/search
 * 
 * Query params:
 * - city (string, required)
 * - checkIn (YYYY-MM-DD, required)
 * - checkOut (YYYY-MM-DD, required)
 * - guests (number, required)
 * - priceMin (number)
 * - priceMax (number)
 * - propertyType (string)
 * - amenities (array)
 * - page (number, default: 1)
 * - limit (number, default: 20)
 */
router.get('/search', async (req, res) => {
  try {
    const {
      city,
      checkIn,
      checkOut,
      guests,
      priceMin,
      priceMax,
      propertyType,
      amenities,
      page = 1,
      limit = 20,
    } = req.query;

    // VALIDACIÓN
    if (!city || !checkIn || !checkOut || !guests) {
      return res.status(400).json({
        success: false,
        message: 'Parámetros requeridos: city, checkIn, checkOut, guests',
      });
    }

    // VALIDAR FECHAS
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate) || isNaN(checkOutDate)) {
      return res.status(400).json({
        success: false,
        message: 'Fechas inválidas. Usa formato YYYY-MM-DD',
      });
    }

    if (checkInDate >= checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'La fecha de salida debe ser posterior a la de entrada',
      });
    }

    // BUILD FILTER
    const filter = {
      city: { $regex: city, $options: 'i' },
      capacity: { $gte: parseInt(guests) },
      status: 'active',
    };

    // PRICE FILTER
    if (priceMin || priceMax) {
      filter.price = {};
      if (priceMin) filter.price.$gte = parseInt(priceMin);
      if (priceMax) filter.price.$lte = parseInt(priceMax);
    }

    // PROPERTY TYPE FILTER
    if (propertyType) {
      filter.propertyType = propertyType;
    }

    // AMENITIES FILTER
    if (amenities && Array.isArray(amenities) && amenities.length > 0) {
      filter.amenities = { $in: amenities };
    }

    // GET BOOKED PROPERTIES DURING DATE RANGE
    const bookedProperties = await Booking.distinct('propertyId', {
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        {
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate },
        },
      ],
    });

    // EXCLUDE BOOKED PROPERTIES
    if (bookedProperties.length > 0) {
      filter._id = { $nin: bookedProperties };
    }

    // PAGINATION
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // FETCH PROPERTIES
    const properties = await Property.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .select(
        'title city price propertyType images bedrooms bathrooms capacity amenities rating reviewCount superhost'
      )
      .lean();

    // GET TOTAL COUNT FOR PAGINATION
    const total = await Property.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: {
        properties,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
        filters: {
          city,
          checkIn,
          checkOut,
          guests,
          priceMin: priceMin || 'any',
          priceMax: priceMax || 'any',
          propertyType: propertyType || 'any',
        },
      },
    });
  } catch (error) {
    logger.error('Error en búsqueda de propiedades', {
      message: error.message,
      query: req.query,
    });

    return res.status(500).json({
      success: false,
      message: 'Error al buscar propiedades',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET property by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('hostId', 'name email profileImage reviewCount superhost')
      .lean();

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Propiedad no encontrada',
      });
    }

    return res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    logger.error('Error al obtener propiedad', {
      id: req.params.id,
      error: error.message,
    });

    return res.status(500).json({
      success: false,
      message: 'Error al obtener propiedad',
    });
  }
});

/**
 * GET all properties (home page)
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const properties = await Property.find({ status: 'active' })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .select(
        'title city price propertyType images bedrooms bathrooms capacity amenities rating reviewCount superhost'
      )
      .sort({ createdAt: -1 })
      .lean();

    const total = await Property.countDocuments({ status: 'active' });

    return res.status(200).json({
      success: true,
      data: {
        properties,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Error al obtener propiedades', {
      error: error.message,
    });

    return res.status(500).json({
      success: false,
      message: 'Error al obtener propiedades',
    });
  }
});

module.exports = router;
