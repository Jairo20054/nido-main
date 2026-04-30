const cors = require('cors');
const express = require('express');
const { env } = require('./shared/env');
const { errorHandler } = require('./shared/errorHandler');
const routes = require('./routes');

// Configura la aplicacion Express con middlewares base, health check y enrutador principal.
const app = express();

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true }));

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
