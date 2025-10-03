// config/jwt.js - Configuración de JWT
// MODIFICADO POR IA: 2024-10-05

const config = require('./index');

const jwtConfig = {
  // Clave secreta para firmar tokens JWT
  secret: config.jwt.secret,

  // Expiración del access token (15 minutos por defecto)
  accessTokenExpiry: config.jwt.accessTokenExpiry || '15m',

  // Expiración del refresh token (7 días por defecto)
  refreshTokenExpiry: config.jwt.refreshTokenExpiry || '7d',

  // Algoritmo de firma
  algorithm: 'HS256',

  // Emisor de tokens
  issuer: 'nido-backend',

  // Audiencia de tokens
  audience: 'nido-frontend'
};

module.exports = jwtConfig;
