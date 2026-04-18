const cors = require('cors');
const express = require('express');
const routes = require('./routes');
const { env } = require('./shared/env');
const { errorHandler } = require('./shared/errorHandler');

const app = express();

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', routes);
app.use(errorHandler);

module.exports = { app };
