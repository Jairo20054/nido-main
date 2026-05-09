const cors = require('cors');
const express = require('express');
const { env } = require('./shared/env');
const { errorHandler } = require('./shared/errorHandler');
const routes = require('./routes');

// Configura la aplicacion Express con middlewares base, health check y enrutador principal.
const app = express();

app.disable('x-powered-by');
if (env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || env.CLIENT_URLS.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
  })
);
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
