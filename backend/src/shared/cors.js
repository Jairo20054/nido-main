const { forbidden } = require('./errors');

const defaultDevOrigins = Object.freeze([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

const normalizeOrigin = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().replace(/\/+$/u, '');
};

const parseOriginList = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeOrigin).filter(Boolean);
  }

  if (typeof value !== 'string') {
    return [];
  }

  return value
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);
};

const buildAllowedOrigins = ({
  nodeEnv = 'development',
  clientUrl,
  clientUrls,
  clientOrigin,
} = {}) => {
  const configuredOrigins = [
    ...parseOriginList(clientUrl),
    ...parseOriginList(clientUrls),
    ...parseOriginList(clientOrigin),
  ].filter((origin) => origin !== '*');

  const baseOrigins = nodeEnv === 'production' ? configuredOrigins : [...defaultDevOrigins, ...configuredOrigins];

  return [...new Set(baseOrigins)];
};

const formatAllowedOriginsForLog = (origins) =>
  origins.length ? origins.join(', ') : '(sin origenes configurados)';

const createCorsOptions = ({
  allowedOrigins = [],
  credentials = true,
  logger = console,
  allowRequestsWithoutOrigin = true,
} = {}) => {
  const normalizedOrigins = parseOriginList(allowedOrigins);
  const allowedOriginSet = new Set(normalizedOrigins);
  const warn = typeof logger?.warn === 'function' ? logger.warn.bind(logger) : console.warn.bind(console);

  return {
    credentials,
    origin(origin, callback) {
      if (!origin) {
        return callback(null, allowRequestsWithoutOrigin);
      }

      const normalizedOrigin = normalizeOrigin(origin);

      if (!normalizedOrigin) {
        return callback(null, allowRequestsWithoutOrigin);
      }

      if (allowedOriginSet.has(normalizedOrigin)) {
        return callback(null, true);
      }

      warn(`[CORS] Origen bloqueado: ${origin}. Permitidos: ${formatAllowedOriginsForLog(normalizedOrigins)}`);

      return callback(forbidden(`Origen no permitido por CORS: ${origin}`));
    },
  };
};

module.exports = {
  buildAllowedOrigins,
  createCorsOptions,
  defaultDevOrigins,
  formatAllowedOriginsForLog,
  normalizeOrigin,
  parseOriginList,
};
