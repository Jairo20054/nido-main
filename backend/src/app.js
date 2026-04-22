// ============================================================================
// CONFIGURACIÓN DE LA APLICACIÓN EXPRESS CON SUPABASE
// ============================================================================
// Este archivo configura la aplicación Express con:
// - CORS para comunicación con el frontend
// - Parseo de JSON
// - Rutas de la API
// - Manejo de errores global

const cors = require('cors');
const express = require('express');
const routes = require('./routes');
const { env } = require('./shared/env');
const { errorHandler } = require('./shared/errorHandler');

const app = express();

// ============================================================================
// CONFIGURACIÓN DE CORS
// ============================================================================
// Permitir peticiones desde el cliente frontend
// Se requiere para comunicación entre el backend y frontend durante desarrollo
app.use(
  cors({
    origin: env.CLIENT_URL,      // Solo permitir origen del cliente
    credentials: true,            // Permitir cookies si es necesario
  })
);

// ============================================================================
// PARSEO DE PETICIONES
// ============================================================================
// Parsear JSON en las peticiones (limit 1MB para proteger contra DDoS)
app.use(express.json({ limit: '1mb' }));

// Parsear datos de formularios URL-encoded
app.use(express.urlencoded({ extended: true }));

// ============================================================================
// RUTAS DE SALUD
// ============================================================================
// Endpoint simple para verificar que el servidor está funcionando
// No requiere autenticación
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// RUTAS DE LA API
// ============================================================================
// Todas las rutas de la API están prefijadas con /api
// 
// Rutas disponibles:
//   - /api/auth        -> Autenticación (registro, login, etc.)
//   - /api/properties  -> Propiedades (CRUD, búsqueda, etc.)
//   - /api/users       -> Usuarios (perfiles, datos, etc.)
//   - /api/favorites   -> Favoritos del usuario
//   - /api/requests    -> Solicitudes de arrendamiento
//
// Middleware de Supabase se aplica en cada ruta que lo requiera:
//   - requireAuth          -> Requiere usuario autenticado
//   - requireAuthOptional  -> Autenticación opcional
//   - requireRole          -> Validar rol del usuario
//   - requireOwnership     -> Validar propiedad del recurso
app.use('/api', routes);

// ============================================================================
// MANEJO DE ERRORES GLOBAL
// ============================================================================
// Interceptar y formatear todos los errores de la aplicación
// Debe estar DESPUÉS de las rutas
app.use(errorHandler);

module.exports = { app };

