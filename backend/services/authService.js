// services/authService.js - Servicio de autenticación mejorado con JWT Access + Refresh
// MODIFICADO POR IA: 2024-10-05

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const Token = require('../models/Token');
const jwtConfig = require('../config/jwt');
const emailService = require('../utils/email');
const logger = require('../utils/logger');

// Servicio de autenticación para manejar JWT y operaciones relacionadas
class AuthService {
  constructor() {
    this.jwtSecret = jwtConfig.secret;
    this.accessTokenExpiry = jwtConfig.accessTokenExpiry;
    this.refreshTokenExpiry = jwtConfig.refreshTokenExpiry;
  }

  // Generar access token
  generateAccessToken(user) {
    try {
      const payload = {
        userId: user._id,
        email: user.email,
        name: user.name,
        roles: user.roles
      };

      return jwt.sign(payload, this.jwtSecret, {
        expiresIn: this.accessTokenExpiry,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      });
    } catch (error) {
      logger.error('Error generando access token', { error: error.message });
      throw new Error('Error al generar access token');
    }
  }

  // Generar refresh token único
  generateRefreshToken() {
    return crypto.randomBytes(64).toString('hex');
  }

  // Generar tokens de acceso y refresh
  async generateTokens(user, deviceInfo = 'unknown') {
    try {
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken();

      // Calcular fecha de expiración del refresh token
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 días

      // Almacenar refresh token en BD
      user.refreshTokens.push({
        token: refreshToken,
        expiresAt,
        deviceInfo
      });

      await user.save();

      return { accessToken, refreshToken };
    } catch (error) {
      logger.error('Error generando tokens', { error: error.message });
      throw new Error('Error al generar tokens de autenticación');
    }
  }

  // Verificar y decodificar access token JWT
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      });
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

  // Verificar refresh token y obtener usuario
  async verifyRefreshToken(refreshToken) {
    try {
      const user = await User.findOne({
        'refreshTokens.token': refreshToken,
        'refreshTokens.revoked': false,
        'refreshTokens.expiresAt': { $gt: new Date() }
      });

      if (!user) {
        throw new Error('Refresh token inválido o expirado');
      }

      // Encontrar el token específico
      const tokenDoc = user.refreshTokens.find(t => t.token === refreshToken);
      if (!tokenDoc) {
        throw new Error('Refresh token no encontrado');
      }

      return { user, tokenDoc };
    } catch (error) {
      logger.error('Error verificando refresh token', { error: error.message });
      throw error;
    }
  }

  // Rotar refresh token (generar nuevo y revocar antiguo)
  async rotateRefreshToken(oldRefreshToken, deviceInfo = 'unknown') {
    try {
      const { user, tokenDoc } = await this.verifyRefreshToken(oldRefreshToken);

      // Revocar el token antiguo
      tokenDoc.revoked = true;

      // Generar nuevo refresh token
      const newRefreshToken = this.generateRefreshToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      user.refreshTokens.push({
        token: newRefreshToken,
        expiresAt,
        deviceInfo
      });

      await user.save();

      return newRefreshToken;
    } catch (error) {
      logger.error('Error rotando refresh token', { error: error.message });
      throw error;
    }
  }

  // Revocar refresh token específico
  async revokeRefreshToken(refreshToken) {
    try {
      const result = await User.updateOne(
        { 'refreshTokens.token': refreshToken },
        { $set: { 'refreshTokens.$.revoked': true } }
      );

      if (result.modifiedCount === 0) {
        throw new Error('Refresh token no encontrado');
      }

      logger.info('Refresh token revocado', { refreshToken: refreshToken.substring(0, 10) + '...' });
      return true;
    } catch (error) {
      logger.error('Error revocando refresh token', { error: error.message });
      throw error;
    }
  }

  // Revocar todos los refresh tokens de un usuario
  async revokeAllUserRefreshTokens(userId) {
    try {
      const result = await User.updateOne(
        { _id: userId },
        { $set: { 'refreshTokens.$[].revoked': true } }
      );

      logger.info('Todos los refresh tokens revocados para usuario', { userId });
      return result.modifiedCount > 0;
    } catch (error) {
      logger.error('Error revocando todos los refresh tokens', { error: error.message });
      throw error;
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
      const decoded = this.verifyToken(token);
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  // Crear usuario con verificación de email opcional
  async createUser(userData, requireEmailVerification = false) {
    try {
      const { name, email, password } = userData;

      // Verificar si el email ya existe
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('El email ya está registrado');
      }

      // Crear usuario
      const user = new User({
        name,
        email,
        password,
        emailVerified: !requireEmailVerification
      });

      await user.save();

      // Enviar email de verificación si es requerido
      if (requireEmailVerification) {
        await this.sendVerificationEmail(user);
      }

      return user;
    } catch (error) {
      logger.error('Error creando usuario', { error: error.message });
      throw error;
    }
  }

  // Enviar email de verificación
  async sendVerificationEmail(user) {
    try {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 horas

      // Guardar token en BD
      await Token.create({
        userId: user._id,
        token,
        type: 'emailVerification',
        expiresAt
      });

      // Enviar email
      const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
      await emailService.sendVerificationEmail(user.email, user.name, verificationUrl);

      logger.info('Email de verificación enviado', { userId: user._id, email: user.email });
    } catch (error) {
      logger.error('Error enviando email de verificación', { error: error.message });
      throw error;
    }
  }

  // Verificar email con token
  async verifyEmail(token) {
    try {
      const tokenDoc = await Token.findOne({
        token,
        type: 'emailVerification',
        used: false,
        expiresAt: { $gt: new Date() }
      });

      if (!tokenDoc) {
        throw new Error('Token de verificación inválido o expirado');
      }

      // Marcar email como verificado
      const user = await User.findByIdAndUpdate(
        tokenDoc.userId,
        { emailVerified: true },
        { new: true }
      );

      // Marcar token como usado
      tokenDoc.used = true;
      await tokenDoc.save();

      logger.info('Email verificado exitosamente', { userId: user._id });
      return user;
    } catch (error) {
      logger.error('Error verificando email', { error: error.message });
      throw error;
    }
  }

  // Solicitar reset de contraseña
  async requestPasswordReset(email) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        // No revelar si el email existe o no por seguridad
        logger.warn('Intento de reset password para email no existente', { email });
        return;
      }

      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // 1 hora

      // Guardar token
      await Token.create({
        userId: user._id,
        token,
        type: 'passwordReset',
        expiresAt
      });

      // Enviar email
      const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
      await emailService.sendPasswordResetEmail(user.email, user.name, resetUrl);

      logger.info('Email de reset password enviado', { userId: user._id, email: user.email });
    } catch (error) {
      logger.error('Error solicitando reset password', { error: error.message });
      throw error;
    }
  }

  // Resetear contraseña
  async resetPassword(token, newPassword) {
    try {
      const tokenDoc = await Token.findOne({
        token,
        type: 'passwordReset',
        used: false,
        expiresAt: { $gt: new Date() }
      });

      if (!tokenDoc) {
        throw new Error('Token de reset inválido o expirado');
      }

      const user = await User.findById(tokenDoc.userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Actualizar contraseña
      user.password = newPassword;

      // Revocar todos los refresh tokens por seguridad
      await this.revokeAllUserRefreshTokens(user._id);

      await user.save();

      // Marcar token como usado
      tokenDoc.used = true;
      await tokenDoc.save();

      logger.info('Contraseña reseteada exitosamente', { userId: user._id });
      return user;
    } catch (error) {
      logger.error('Error reseteando contraseña', { error: error.message });
      throw error;
    }
  }

  // Validar contraseña (para login)
  async validatePassword(email, password) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return { isValid: false, user: null, reason: 'Usuario no encontrado' };
      }

      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return { isValid: false, user: null, reason: 'Contraseña incorrecta' };
      }

      return { isValid: true, user, reason: null };
    } catch (error) {
      logger.error('Error validando contraseña', { error: error.message });
      throw error;
    }
  }
}

module.exports = new AuthService();
