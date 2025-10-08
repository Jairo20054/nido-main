// models/Token.js - Modelo para tokens de verificación y reset de contraseña
// CREADO POR IA: 2024-10-05

const mongoose = require('mongoose');

// Esquema para tokens temporales (verificación email, reset password)
const tokenSchema = new mongoose.Schema({
  // ID del usuario al que pertenece el token
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Token único generado
  token: {
    type: String,
    required: true,
    unique: true
  },
  // Tipo de token
  type: {
    type: String,
    enum: ['emailVerification', 'passwordReset'],
    required: true
  },
  // Fecha de expiración del token
  expiresAt: {
    type: Date,
    required: true
  },
  // Si el token ya fue usado
  used: {
    type: Boolean,
    default: false
  },
  // Fecha de creación
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Índice compuesto para optimizar búsquedas
tokenSchema.index({ userId: 1, type: 1 });
tokenSchema.index({ token: 1 });
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index para expiración automática

// Método para verificar si el token es válido
tokenSchema.methods.isValid = function() {
  return !this.used && this.expiresAt > new Date();
};

// Método estático para limpiar tokens expirados
tokenSchema.statics.cleanupExpired = async function() {
  const result = await this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
  return result.deletedCount;
};

module.exports = mongoose.model('Token', tokenSchema);
