const User = require('../models/User');
const AuthService = require('../services/authService');
const { validationResult } = require('express-validator');

// Controlador de autenticación con métodos para registro, login y OAuth
const authController = {
  // Registro de usuario tradicional
  register: async (req, res) => {
    try {
      // Validar datos de entrada con express-validator
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Datos de registro inválidos',
          detalles: errors.array()
        });
      }

      const { name, email, password } = req.body;

      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          error: 'El email ya está registrado'
        });
      }

      // Crear nuevo usuario
      const user = new User({
        name,
        email,
        password
      });

      await user.save();

      // Generar token JWT
      const { token } = AuthService.generateTokens(user);

      // Responder con éxito
      res.status(201).json({
        mensaje: 'Usuario registrado exitosamente',
        usuario: user.toPublicData(),
        token
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({
        error: 'Error interno del servidor durante el registro'
      });
    }
  },

  // Login tradicional con email y contraseña
  login: async (req, res) => {
    try {
      // Validar datos de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Datos de login inválidos',
          detalles: errors.array()
        });
      }

      const { email, password } = req.body;

      // Buscar usuario por email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          error: 'Credenciales inválidas'
        });
      }

      // Verificar contraseña
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Credenciales inválidas'
        });
      }

      // Generar token JWT
      const { token } = AuthService.generateTokens(user);

      // Responder con éxito
      res.json({
        mensaje: 'Login exitoso',
        usuario: user.toPublicData(),
        token
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        error: 'Error interno del servidor durante el login'
      });
    }
  },

  // Obtener perfil del usuario autenticado
  getProfile: async (req, res) => {
    try {
      // El usuario ya está disponible en req.user gracias al middleware
      const user = req.user;

      res.json({
        mensaje: 'Perfil obtenido exitosamente',
        usuario: user.toPublicData()
      });
    } catch (error) {
      console.error('Error al obtener perfil:', error);
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
