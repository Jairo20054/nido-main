const AuthService = require('../services/authService');

// Middleware para verificar token JWT en rutas protegidas
const verifyToken = async (req, res, next) => {
  try {
    // Obtener el token del encabezado Authorization
    let token = req.headers['authorization'];

    // Verificar si el token existe
    if (!token) {
      return res.status(401).json({
        error: 'Token de acceso requerido'
      });
    }

    // Remover prefijo "Bearer " si existe
    if (token.startsWith('Bearer ')) {
      token = token.slice(7);
    }

    // Verificar token usando AuthService
    const decoded = AuthService.verifyToken(token);

    // Obtener usuario completo desde la base de datos
    const user = await AuthService.getUserFromToken(token);

    // Adjuntar usuario a la solicitud
    req.user = user;
    req.tokenData = decoded;

    next();
  } catch (error) {
    console.error('Error al verificar token:', error);

    // Manejar errores específicos
    if (error.message === 'Token expirado') {
      return res.status(401).json({
        error: 'Token expirado'
      });
    } else if (error.message === 'Token inválido') {
      return res.status(401).json({
        error: 'Token inválido'
      });
    } else if (error.message === 'Usuario no encontrado') {
      return res.status(401).json({
        error: 'Usuario no encontrado'
      });
    }

    // Error genérico
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

module.exports = {
  verifyToken
};
