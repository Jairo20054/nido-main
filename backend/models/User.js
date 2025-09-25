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
  }
});

// Middleware para hashear la contraseña antes de guardar
userSchema.pre('save', async function(next) {
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
