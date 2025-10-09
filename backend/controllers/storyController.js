// controllers/storyController.js - Controlador para gestión de historias

const Story = require('../models/Story');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/stories');
    try {
      await fs.mkdir(uploadDir, { recursive: true }); // Usar fs.promises para no bloquear
      cb(null, uploadDir);
    } catch (error) {
      console.error('Error al crear el directorio de subida:', error);
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'story-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const multerUpload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Validar tipos de archivo
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      // Usar un error con un código específico para un mejor manejo en el frontend
      const error = new Error('Tipo de archivo no permitido. Solo se aceptan imágenes (JPG, PNG, GIF, WEBP) y videos (MP4, MOV, AVI).');
      error.code = 'INVALID_FILE_TYPE';
      cb(error);
    }
  }
});

// Middleware para manejar la subida de un solo archivo llamado 'media'
const upload = multerUpload.single('media');

/**
 * Obtener todas las historias activas
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getStories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Obtener historias activas con paginación
    const stories = await Story.find({
      expiresAt: { $gt: new Date() }
    })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    // Obtener total para paginación
    const total = await Story.countDocuments({
      expiresAt: { $gt: new Date() }
    });

    res.json({
      success: true,
      data: stories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener historias:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Obtener historias de un usuario específico
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getUserStories = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verificar que el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Obtener historias activas del usuario
    const stories = await Story.find({
      userId,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: stories
    });
  } catch (error) {
    console.error('Error al obtener historias del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Crear una nueva historia
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const createStory = async (req, res) => {
  // NOTA: Este endpoint se ha vuelto redundante con `uploadStoryMedia`.
  // Se recomienda usar `uploadStoryMedia` para crear historias a partir de archivos subidos.
  // Si se necesita crear una historia desde una URL existente, se puede mantener,
  // pero por ahora lo marcaremos como no implementado para evitar confusión.
  res.status(501).json({
    success: false,
    message: 'No implementado. Utilice el endpoint de subida de archivos para crear historias.'
  });
};

/**
 * Subir archivo para historia
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const uploadStoryMedia = async (req, res) => {
  // Este controlador se ejecuta DESPUÉS del middleware `upload`
  // El middleware se encarga de procesar el archivo y manejar errores iniciales.
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No se recibió ningún archivo. Asegúrate de que el campo se llame "media".' });
    }

    const userId = req.user.id; // Asumimos que el middleware de autenticación añade `req.user`
    const { duration } = req.body; // El frontend puede enviar la duración del video

    // Determinar tipo de media
    const isVideo = file.mimetype.startsWith('video/');
    const mediaType = isVideo ? 'video' : 'image';

    // Crear URL pública y relativa del archivo
    const fileUrl = `/uploads/stories/${file.filename}`;

    // Crear el objeto de media para la historia
    const mediaItem = {
      type: mediaType,
      url: fileUrl,
      // Duración: usa la del frontend si existe, si no, valores por defecto.
      duration: duration ? parseInt(duration, 10) : (isVideo ? 10000 : 5000) // 10s para videos, 5s para imágenes
    };

    // Crear y guardar la nueva historia en la base de datos
    const story = new Story({
      userId,
      media: [mediaItem] // Las historias pueden tener múltiples elementos, pero aquí creamos una con uno solo
    });

    await story.save();

    // Poblar los datos del usuario para devolver una respuesta completa
    await story.populate('userId', 'name email profilePicture'); // Añadimos profilePicture

    res.status(201).json({
      success: true,
      data: story,
      message: 'Historia creada exitosamente.'
    });
  } catch (error) {
    console.error('Error al procesar la subida de la historia:', error);

    // Si el error viene de Mongoose (ej. validación del modelo)
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: 'Error de validación', errors });
    }

    // Error general del servidor
    res.status(500).json({ success: false, message: 'Error interno del servidor al crear la historia.' });
  }
};

/**
 * Eliminar una historia
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const deleteStory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Buscar y eliminar la historia (solo si pertenece al usuario)
    const story = await Story.findOneAndDelete({
      _id: id,
      userId
    });

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Historia no encontrada o no autorizada'
      });
    }

    // Eliminar archivos físicos si existen
    for (const mediaItem of story.media) {
      try {
        const filePath = path.join(__dirname, '../../', mediaItem.url);
        await fs.unlink(filePath);
      } catch (fileError) {
        console.warn('Error al eliminar archivo:', fileError.message);
      }
    }

    res.json({
      success: true,
      message: 'Historia eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar historia:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Middleware para manejar errores de Multer de forma centralizada
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'El archivo es demasiado grande. El límite es de 50MB.' });
    }
    return res.status(400).json({ success: false, message: `Error de Multer: ${err.message}` });
  } else if (err) {
    if (err.code === 'INVALID_FILE_TYPE') {
      return res.status(400).json({ success: false, message: err.message });
    }
    return res.status(500).json({ success: false, message: `Ocurrió un error inesperado: ${err.message}` });
  }
  next();
};

module.exports = {
  getStories,
  getUserStories,
  createStory,
  uploadStoryMedia,
  deleteStory,
  upload, // Exportar el middleware de subida
  handleUploadErrors // Exportar el manejador de errores
};
