// controllers/authController.js - Controlador de autenticación mejorado
// MODIFICADO POR IA: 2024-10-05

const AuthService = require('../services/authService');
const logger = require('../utils/logger');

// Controlador de autenticación con métodos completos
const authController = {
  // Registro de usuario con verificación opcional
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const requireEmailVerification = process.env.REQUIRE_EMAIL_VERIFICATION === 'true';

      // Crear usuario usando AuthService
      const user = await AuthService.createUser(
        { name, email, password },
        requireEmailVerification
      );

      let responseMessage = 'Usuario registrado exitosamente';
      if (requireEmailVerification) {
        responseMessage = 'Usuario creado. Verifique su correo.';
      }

      res.status(201).json({
        message: responseMessage,
        userId: user._id
      });
    } catch (error) {
      logger.error('Error en registro', { error: error.message, email: req.body.email });
      res.status(400).json({
        error: error.message
      });
    }
  },

  // Login con validación de email verificado
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const requireEmailVerification = process.env.REQUIRE_EMAIL_VERIFICATION === 'true';

      // Validar credenciales usando AuthService
      const { isValid, user, reason } = await AuthService.validatePassword(email, password);

      if (!isValid) {
        logger.warn('Intento de login fallido', { email, reason });
        return res.status(401).json({
          error: 'Credenciales inválidas'
        });
      }

      // Verificar email si es requerido
      if (requireEmailVerification && !user.emailVerified) {
        return res.status(403).json({
          error: 'Por favor verifica tu email antes de iniciar sesión'
        });
      }

      // Generar tokens
      const deviceInfo = req.headers['user-agent'] || 'unknown';
      const { accessToken, refreshToken } = await AuthService.generateTokens(user, deviceInfo);

      // Configurar cookie HttpOnly para refresh token
      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
      });

      // Responder con access token
      res.json({
        accessToken,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          roles: user.roles
        }
      });
    } catch (error) {
      logger.error('Error en login', { error: error.message, email: req.body.email });
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  },

  // Refresh token
  refresh: async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          error: 'Refresh token requerido'
        });
      }

      // Rotar refresh token
      const deviceInfo = req.headers['user-agent'] || 'unknown';
      const newRefreshToken = await AuthService.rotateRefreshToken(refreshToken, deviceInfo);

      // Generar nuevo access token
      const { user } = await AuthService.verifyRefreshToken(refreshToken);
      const accessToken = AuthService.generateAccessToken(user);

      // Configurar nueva cookie
      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.json({ accessToken });
    } catch (error) {
      logger.error('Error en refresh token', { error: error.message });
      res.status(401).json({
        error: 'Refresh token inválido'
      });
    }
  },

  // Logout
  logout: async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (refreshToken) {
        // Revocar refresh token
        await AuthService.revokeRefreshToken(refreshToken);
      }

      // Limpiar cookie
      res.clearCookie('refreshToken');

      res.json({
        message: 'Logout exitoso'
      });
    } catch (error) {
      logger.error('Error en logout', { error: error.message });
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  },

  // Verificar email
  verifyEmail: async (req, res) => {
    try {
      const { token } = req.query;

      const user = await AuthService.verifyEmail(token);

      res.json({
        message: 'Email verificado exitosamente',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified
        }
      });
    } catch (error) {
      logger.error('Error verificando email', { error: error.message });
      res.status(400).json({
        error: error.message
      });
    }
  },

  // Solicitar reset de contraseña
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      await AuthService.requestPasswordReset(email);

      // Siempre responder OK por seguridad (no revelar si email existe)
      res.json({
        message: 'Si el email existe, se ha enviado un enlace de reset'
      });
    } catch (error) {
      logger.error('Error en forgot password', { error: error.message });
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  },

  // Resetear contraseña
  resetPassword: async (req, res) => {
    try {
      const { token, password } = req.body;

      const user = await AuthService.resetPassword(token, password);

      res.json({
        message: 'Contraseña reseteada exitosamente'
      });
    } catch (error) {
      logger.error('Error reseteando contraseña', { error: error.message });
      res.status(400).json({
        error: error.message
      });
    }
  },

  // Obtener perfil del usuario autenticado
  getProfile: async (req, res) => {
    try {
      const user = req.user;

      res.json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          roles: user.roles,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      logger.error('Error obteniendo perfil', { error: error.message });
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  },

  // Callback de autenticación con Google
  googleCallback: async (req, res) => {
    try {
      // Usuario autenticado por Passport
      const user = req.user;

      // Generar token JWT
      const { token } = AuthService.generateTokens(user);

      // Redirigir al frontend con el token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/callback?token=${token}&provider=google`);
    } catch (error) {
      console.error('Error en callback de Google:', error);
      res.status(500).json({
        error: 'Error en autenticación con Google'
      });
    }
  },

  // Callback de autenticación con Facebook
  facebookCallback: async (req, res) => {
    try {
      // Usuario autenticado por Passport
      const user = req.user;

      // Generar token JWT
      const { token } = AuthService.generateTokens(user);

      // Redirigir al frontend con el token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/callback?token=${token}&provider=facebook`);
    } catch (error) {
      console.error('Error en callback de Facebook:', error);
      res.status(500).json({
        error: 'Error en autenticación con Facebook'
      });
    }
  },

  // Verificar token (para debugging o validación manual)
  verifyToken: async (req, res) => {
    try {
      // El middleware ya verificó el token, solo confirmar
      res.json({
        mensaje: 'Token válido',
        usuario: req.user.toPublicData()
      });
    } catch (error) {
      console.error('Error al verificar token:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  },

  // Logout (opcional, ya que JWT es stateless)
  logout: async (req, res) => {
    try {
      // En una implementación con refresh tokens, aquí se invalidarían
      // Por ahora, solo responder con éxito
      res.json({
        mensaje: 'Logout exitoso'
      });
    } catch (error) {
      console.error('Error en logout:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }
};

module.exports = authController;
