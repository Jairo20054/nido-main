// models/User.js - Modelo de Usuario mejorado para autenticación completa
// MODIFICADO POR IA: 2024-10-05

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Esquema del modelo Usuario para autenticación completa
const userSchema = new mongoose.Schema({
  // Nombre completo del usuario (requerido)
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  // Email único del usuario (requerido)
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true
  },
  // Contraseña hasheada (requerida para login tradicional)
  password: {
    type: String,
    required: function() {
      // La contraseña es requerida solo si no hay googleId o facebookId
      return !this.googleId && !this.facebookId;
    },
    minlength: 6
  },
  // Roles del usuario (por defecto 'user')
  roles: {
    type: [String],
    enum: ['user', 'admin', 'host'],
    default: ['user']
  },
  // Verificación de email
  emailVerified: {
    type: Boolean,
    default: false
  },
  // Tokens de refresh almacenados (array con metadata)
  refreshTokens: [{
    token: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true
    },
    deviceInfo: {
      type: String,
      default: 'unknown'
    },
    revoked: {
      type: Boolean,
      default: false
    }
  }],
  // ID de Google para OAuth (opcional)
  googleId: {
    type: String,
    default: null
  },
  // ID de Facebook para OAuth (opcional)
  facebookId: {
    type: String,
    default: null
  },
  // Fecha de creación del usuario
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Fecha de última actualización
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para hashear la contraseña antes de guardar
userSchema.pre('save', async function(next) {
  // Actualizar updatedAt
  this.updatedAt = Date.now();

  // Solo hashear si la contraseña fue modificada y existe
  if (!this.isModified('password') || !this.password) return next();

  try {
    // Generar salt y hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  // Verificar que la contraseña del usuario existe
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para obtener datos públicos del usuario (sin contraseña)
userSchema.methods.toPublicData = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
