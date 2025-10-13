const Property = require('../models/Property');
const User = require('../models/User');
const Joi = require('joi'); // Para validación
const { sanitizeInput, sanitizeSearchInput, sanitizeObjectId } = require('../utils/sanitizer'); // Para sanitizar entradas

// Constantes para mensajes y códigos de estado
const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  FORBIDDEN: 403,
  SERVER_ERROR: 500,
};

const MESSAGES = {
  SERVER_ERROR: 'Error interno del servidor',
  PROPERTY_NOT_FOUND: 'Propiedad no encontrada',
  FORBIDDEN: 'No tienes permiso para esta acción',
  VALIDATION_ERROR: 'Error de validación',
  PROPERTY_CREATED: 'Propiedad creada exitosamente',
  PROPERTY_UPDATED: 'Propiedad actualizada exitosamente',
  PROPERTY_DELETED: 'Propiedad eliminada exitosamente',
};

// Función helper para calcular distancia entre dos puntos (fórmula de Haversine)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Esquema de validación para query params en getAllProperties
const searchSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  location: Joi.string().trim().max(100).optional(),
  lat: Joi.number().min(-90).max(90).optional(),
  lon: Joi.number().min(-180).max(180).optional(),
  radius: Joi.number().min(1).max(100).optional(), // km
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  propertyType: Joi.string().optional(),
}).and('lat', 'lon', 'radius'); // lat, lon, radius deben ir juntos

/**
 * Construye el filtro para búsqueda de propiedades
 * @param {Object} query - Query params
 * @returns {Object} Filtro para MongoDB
 */
const buildPropertyFilter = (query) => {
  const filter = {};

  // Sanitizar y filtrar por ciudad
  if (query.location) {
    filter.city = { $regex: sanitizeSearchInput(query.location), $options: 'i' };
  }

  // Filtro geoespacial
  if (query.lat && query.lon && query.radius) {
    filter.location = {
      $near: {
        $geometry: { type: 'Point', coordinates: [parseFloat(query.lon), parseFloat(query.lat)] },
        $maxDistance: parseFloat(query.radius) * 1000, // km a metros
      },
    };
  }

  // Filtro de precio
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = parseFloat(query.minPrice);
    if (query.maxPrice) filter.price.$lte = parseFloat(query.maxPrice);
  }

  // Filtro de tipo de propiedad
  if (query.propertyType) {
    filter.propertyType = sanitizeSearchInput(query.propertyType);
  }

  return filter;
};

/**
 * Obtener todas las propiedades con filtros y paginación
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getAllProperties = async (req, res) => {
  try {
    // Validar query params
    const { error, value } = searchSchema.validate(req.query, { stripUnknown: true });
    if (error) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.VALIDATION_ERROR,
        errors: error.details.map((err) => err.message),
      });
    }

    const { page, limit, ...filters } = value;
    const skip = (page - 1) * limit;

    // Construir filtro
    const filter = buildPropertyFilter(filters);

    // Ejecutar consulta con lean para mejor rendimiento
    let sortOption = { createdAt: -1 };

    // Si hay coordenadas del usuario, buscar propiedades cercanas primero
    if (filters.lat && filters.lon) {
      // Para simplificar, usamos $near que ordena por distancia automáticamente
      // Pero necesitamos ajustar el filtro para incluir el radio si está especificado
      const geoFilter = { ...filter };
      if (filters.radius) {
        geoFilter.location = {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(filters.lon), parseFloat(filters.lat)] },
            $maxDistance: parseFloat(filters.radius) * 1000, // km a metros
          },
        };
      } else {
        // Sin radio específico, buscar en un área razonable (50km)
        geoFilter.location = {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(filters.lon), parseFloat(filters.lat)] },
            $maxDistance: 50000, // 50km
          },
        };
      }

      // Ejecutar consulta geoespacial
      const properties = await Property.find(geoFilter)
        .limit(limit * 2) // Obtener más para ordenar después
        .lean()
        .select('title city price propertyType images location');

      // Calcular distancias y ordenar en JavaScript (para demo)
      const userLat = parseFloat(filters.lat);
      const userLon = parseFloat(filters.lon);

      properties.forEach(property => {
        if (property.location && property.location.coordinates) {
          const [propLon, propLat] = property.location.coordinates;
          const distance = calculateDistance(userLat, userLon, propLat, propLon);
          property.distance = distance;
        }
      });

      properties.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));

      // Aplicar paginación después del ordenamiento
      const paginatedProperties = properties.slice(skip, skip + limit);

      const total = await Property.countDocuments(geoFilter);

      // Retornar resultado
      res.status(STATUS_CODES.OK).json({
        success: true,
        data: paginatedProperties,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          next: page * limit < total ? `${baseUrl}?page=${page + 1}&limit=${limit}&lat=${filters.lat}&lon=${filters.lon}` : null,
          prev: page > 1 ? `${baseUrl}?page=${page - 1}&limit=${limit}&lat=${filters.lat}&lon=${filters.lon}` : null,
        },
      });
      return;
    }

    // Consulta normal sin coordenadas
    const [properties, total] = await Promise.all([
      Property.find(filter)
        .skip(skip)
        .limit(limit)
        .sort(sortOption)
        .lean()
        .select('title city price propertyType images location'),
      Property.countDocuments(filter),
    ]);

    // Generar enlaces de paginación
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}/properties`;
    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      next: page * limit < total ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null,
      prev: page > 1 ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null,
    };

    res.status(STATUS_CODES.OK).json({
      success: true,
      data: properties,
      pagination,
    });
  } catch (error) {
    console.error('Error al obtener propiedades:', error);
    res.status(STATUS_CODES.SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Obtener una propiedad por ID
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'ID de propiedad inválido',
      });
    }

    // Buscar propiedad y popular host (solo campos necesarios)
    const property = await Property.findById(id)
      .populate('host', 'name email')
      .lean()
      .select('-__v'); // Excluir campo __v

    if (!property) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.PROPERTY_NOT_FOUND,
      });
    }

    res.status(STATUS_CODES.OK).json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error('Error al obtener propiedad:', error);
    res.status(STATUS_CODES.SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Crear una nueva propiedad
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const createProperty = async (req, res) => {
  try {
    // Validar body (puedes usar Joi aquí también)
    const propertyData = {
      ...req.body,
      host: req.user.id, // Desde middleware de autenticación
    };

    const property = new Property(propertyData);
    await property.save();

    res.status(STATUS_CODES.CREATED).json({
      success: true,
      data: property,
      message: MESSAGES.PROPERTY_CREATED,
    });
  } catch (error) {
    console.error('Error al crear propiedad:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.VALIDATION_ERROR,
        errors,
      });
    }
    res.status(STATUS_CODES.SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Actualizar una propiedad
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'ID de propiedad inválido',
      });
    }

    const property = await Property.findById(id);
    if (!property) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.PROPERTY_NOT_FOUND,
      });
    }

    // Verificar permisos
    if (property.host.toString() !== req.user.id) {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: MESSAGES.FORBIDDEN,
      });
    }

    // Actualizar solo campos proporcionados
    Object.assign(property, req.body);
    await property.save();

    res.status(STATUS_CODES.OK).json({
      success: true,
      data: property,
      message: MESSAGES.PROPERTY_UPDATED,
    });
  } catch (error) {
    console.error('Error al actualizar propiedad:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.VALIDATION_ERROR,
        errors,
      });
    }
    res.status(STATUS_CODES.SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Eliminar una propiedad
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'ID de propiedad inválido',
      });
    }

    const property = await Property.findById(id);
    if (!property) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.PROPERTY_NOT_FOUND,
      });
    }

    // Verificar permisos
    if (property.host.toString() !== req.user.id) {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: MESSAGES.FORBIDDEN,
      });
    }

    await Property.deleteOne({ _id: id });

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: MESSAGES.PROPERTY_DELETED,
    });
  } catch (error) {
    console.error('Error al eliminar propiedad:', error);
    res.status(STATUS_CODES.SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Manejar formulario de contacto para propiedades
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const contactProperty = async (req, res) => {
  try {
    const { propertyId, name, email, phone, message } = req.body;

    // Validar datos requeridos
    if (!propertyId || !name || !email || !message) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Faltan campos requeridos: propertyId, name, email, message',
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Formato de email inválido',
      });
    }

    // Verificar que la propiedad existe
    const property = await Property.findById(propertyId).populate('host', 'name email');
    if (!property) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.PROPERTY_NOT_FOUND,
      });
    }

    // Aquí podrías enviar email al host de la propiedad
    // Por ahora solo retornamos éxito
    console.log('Contacto recibido:', {
      propertyId,
      propertyTitle: property.title,
      hostEmail: property.host.email,
      contact: { name, email, phone, message }
    });

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: 'Mensaje enviado exitosamente. El propietario se pondrá en contacto contigo pronto.',
    });
  } catch (error) {
    console.error('Error al procesar contacto:', error);
    res.status(STATUS_CODES.SERVER_ERROR).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
    });
  }
};

module.exports = {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  contactProperty,
};
