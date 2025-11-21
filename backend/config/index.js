// config/index.js
require('dotenv').config({ encoding: 'utf16le' });
const Joi = require('joi');

// 📌 Definir el esquema de validación de las variables de entorno
const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test', 'staging').default('development'),

  PORT: Joi.number().default(5000),
  HOST: Joi.string().default('0.0.0.0'),

  DB_TYPE: Joi.string().valid('mongodb').default('mongodb'),
  MONGODB_URI: Joi.string().uri().required(),
  POSTGRES_URI: Joi.string().uri().default('postgresql://postgres:postgres@localhost:5432/nido'),

  JWT_SECRET: Joi.string().min(12).required(),
  JWT_ACCESS_EXPIRY: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRY: Joi.string().default('7d'),

  CORS_ORIGIN: Joi.string().default('http://localhost:3000,https://super-yodel-4jg6pgx4pqwwh554v-3000.app.github.dev'),
  CORS_CREDENTIALS: Joi.boolean().truthy('true').falsy('false').default(true),

  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  LOG_PRETTY: Joi.boolean().truthy('true').falsy('false').default(false),

  GEOLOCATION_API_KEY: Joi.string().allow(''),

  STRIPE_SECRET_KEY: Joi.string().allow(''),
  STRIPE_PUBLISHABLE_KEY: Joi.string().allow(''),

  RATE_LIMIT_MAX: Joi.number().default(100),
  RATE_LIMIT_WINDOW: Joi.string().default('15m'),

  // Email SMTP
  SMTP_HOST: Joi.string().allow(''),
  SMTP_PORT: Joi.number().default(587),
  SMTP_SECURE: Joi.boolean().truthy('true').falsy('false').default(false),
  SMTP_USER: Joi.string().allow(''),
  SMTP_PASS: Joi.string().allow(''),

  // URLs
  CLIENT_URL: Joi.string().default('http://localhost:3000'),

  // Cookies
  COOKIE_SECRET: Joi.string().min(12).default('default_cookie_secret_change_in_production'),

  // Features
  REQUIRE_EMAIL_VERIFICATION: Joi.boolean().truthy('true').falsy('false').default(false),

  // Rate limiting específico para auth
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(5),
}).unknown(); // permite otras variables que no estén en el schema

// 📌 Validar el archivo .env
const { value: env, error } = envSchema.validate(process.env, { abortEarly: false });
if (error) {
  throw new Error(`❌ Config validation error: ${error.message}`);
}

// 📌 Configuración centralizada
const config = Object.freeze({
  env: env.NODE_ENV,

  // 🌐 Servidor
  server: {
    port: env.PORT,
    host: env.HOST,
  },

  // 🗄️ Base de datos
  database: {
    type: env.DB_TYPE,
    mongodb: {
      uri: env.MONGODB_URI,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    },
    postgres: {
      uri: env.POSTGRES_URI,
    },
  },

  // 🔐 Autenticación
  auth: {
    jwtSecret: env.JWT_SECRET,
    jwtExpiration: env.JWT_EXPIRATION,
  },

  // 🔐 JWT
  jwt: {
    secret: env.JWT_SECRET,
    accessTokenExpiry: env.JWT_ACCESS_EXPIRY,
    refreshTokenExpiry: env.JWT_REFRESH_EXPIRY,
  },

  // 🔓 CORS
  cors: {
    origin: env.CORS_ORIGIN.split(','),
    credentials: env.CORS_CREDENTIALS,
  },

  // 📝 Logging
  logging: {
    level: env.LOG_LEVEL,
    pretty: env.LOG_PRETTY,
  },

  // 🌍 APIs externas
  api: {
    geolocation: {
      apiKey: env.GEOLOCATION_API_KEY,
    },
    payment: {
      stripe: {
        secretKey: env.STRIPE_SECRET_KEY,
        publishableKey: env.STRIPE_PUBLISHABLE_KEY,
      },
    },
  },

  // 🚦 Rate limiting (ejemplo para Express)
  rateLimit: {
    max: env.RATE_LIMIT_MAX,
    window: env.RATE_LIMIT_WINDOW,
  },

  // 📧 Email SMTP
  email: {
    smtp: {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  },

  // 🌐 URLs
  urls: {
    client: env.CLIENT_URL,
  },

  // 🍪 Cookies
  cookies: {
    secret: env.COOKIE_SECRET,
  },

  // ⚙️ Flags de características
  features: {
    enableNewUI: env.NODE_ENV !== 'production',
    requireEmailVerification: env.REQUIRE_EMAIL_VERIFICATION,
  },

  // 🚦 Rate limiting para auth
  authRateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
  },
});

module.exports = config;
