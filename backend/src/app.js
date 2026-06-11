const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const { env } = require('./shared/env');
const { buildAllowedOrigins, createCorsOptions, formatAllowedOriginsForLog } = require('./shared/cors');
const { errorHandler } = require('./shared/errorHandler');
const routes = require('./routes');

// Configura la aplicacion Express con middlewares base, health check y enrutador principal.
const app = express();

app.disable('x-powered-by');
if (env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:', 'https://*.supabase.co', 'https://api.maptiler.com'],
        connectSrc: ["'self'", 'https://*.supabase.co', 'https://api.maptiler.com'],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts:
      env.NODE_ENV === 'production'
        ? {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
          }
        : false,
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
  })
);
app.use((_req, res, next) => {
  // [SECURITY FIX] Limita permisos de navegador que la API no necesita · Audit 2026
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

const allowedOrigins = buildAllowedOrigins({
  nodeEnv: env.NODE_ENV,
  clientUrl: env.CLIENT_URL,
  clientUrls: env.CLIENT_URLS,
  clientOrigin: process.env.CLIENT_ORIGIN,
});
const corsOptions = createCorsOptions({
  allowedOrigins,
  credentials: true,
  allowRequestsWithoutOrigin: true,
});

console.log(`[CORS] Origenes permitidos (${env.NODE_ENV}): ${formatAllowedOriginsForLog(allowedOrigins)}`);

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Punto de verificacion simple para monitoreo y debugging operativo.
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Todas las rutas funcionales viven bajo /api para separar backend de frontend estatico.
app.use('/api', routes);
app.use(errorHandler);

module.exports = { app };
