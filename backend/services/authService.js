const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Servicio de autenticación para manejar JWT y operaciones relacionadas
class AuthService {
  constructor() {
    // Clave secreta para JWT desde variables de entorno
    this.jwtSecret = process.env.JWT_SECRET;
    // Tiempo de expiración del token (24 horas)
    this.jwtExpiresIn = '24h';
  }

  // Generar tokens de acceso y refresh
  generateTokens(user) {
    try {
      // Payload del token con información básica del usuario
      const payload = {
        userId: user._id,
        email: user.email,
        name: user.name
      };

      // Generar token JWT con expiración de 24 horas
      const token = jwt.sign(payload, this.jwtSecret, {
        expiresIn: this.jwtExpiresIn
      });

      return { token };
    } catch (error) {
      throw new Error('Error al generar tokens de autenticación');
    }
  }

  // Verificar y decodificar token JWT
  verifyToken(token) {
    try {
      // Verificar la firma y expiración del token
      const decoded = jwt.verify(token, this.jwtSecret);
      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expirado');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Token inválido');
      } else {
        throw new Error('Error al verificar token');
      }
    }
  }

  // Encontrar o crear usuario para OAuth
  async findOrCreateOAuthUser(oauthData) {
    try {
      const { provider, providerId, email, name } = oauthData;
      let user;

      // Buscar usuario existente por provider ID
      if (provider === 'google') {
        user = await User.findOne({ googleId: providerId });
      } else if (provider === 'facebook') {
        user = await User.findOne({ facebookId: providerId });
      }

      // Si no existe, buscar por email
      if (!user) {
        user = await User.findOne({ email });
      }

      // Si el usuario existe pero no tiene el provider ID, actualizarlo
      if (user) {
        if (provider === 'google' && !user.googleId) {
          user.googleId = providerId;
          await user.save();
        } else if (provider === 'facebook' && !user.facebookId) {
          user.facebookId = providerId;
          await user.save();
        }
      } else {
        // Crear nuevo usuario
        const userData = {
          name,
          email,
          [provider === 'google' ? 'googleId' : 'facebookId']: providerId
        };
        user = new User(userData);
        await user.save();
      }

      return user;
    } catch (error) {
      throw new Error('Error al procesar usuario OAuth');
    }
  }

  // Obtener usuario por ID desde token
  async getUserFromToken(token) {
    try {
      // Verificar token
      const decoded = this.verifyToken(token);

      // Buscar usuario en la base de datos
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService();
