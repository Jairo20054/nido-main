// models/Story.js - Modelo de Historias para el componente StoriesBar

const mongoose = require('mongoose');

// Esquema del modelo Story
const storySchema = new mongoose.Schema({
  // ID del usuario que creó la historia
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El userId es requerido']
  },
  // Array de objetos media: [{ type: 'image'|'video', url: string, duration?: number }]
  media: {
    type: [{
      type: {
        type: String,
        enum: ['image', 'video'],
        required: true
      },
      url: {
        type: String,
        required: true
      },
      duration: {
        type: Number,
        default: 5000 // 5 segundos por defecto
      }
    }],
    required: [true, 'Al menos un elemento media es requerido'],
    validate: {
      validator: function(mediaArray) {
        return mediaArray && mediaArray.length > 0;
      },
      message: 'Debe haber al menos un elemento media'
    }
  },
  // Fecha de creación
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Fecha de expiración (24 horas después de creación)
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
    }
  }
});

// Índice para expiración automática de historias
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Índice compuesto para optimizar consultas por usuario y fecha
storySchema.index({ userId: 1, createdAt: -1 });

// Método virtual para verificar si la historia ha expirado
storySchema.virtual('isExpired').get(function() {
  return Date.now() > this.expiresAt;
});

// Método para obtener datos públicos de la historia
storySchema.methods.toPublicData = function() {
  const storyObject = this.toObject();
  delete storyObject.__v;
  return storyObject;
};

// Método estático para obtener historias activas (no expiradas)
storySchema.statics.getActiveStories = function(limit = 50) {
  return this.find({
    expiresAt: { $gt: new Date() }
  })
  .populate('userId', 'name email')
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Método estático para obtener historias de un usuario específico
storySchema.statics.getUserStories = function(userId) {
  return this.find({
    userId,
    expiresAt: { $gt: new Date() }
  })
  .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Story', storySchema);
