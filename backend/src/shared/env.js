const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const backendDir = path.resolve(__dirname, '..', '..');
const rootDir = path.resolve(backendDir, '..');
const rootEnvPath = path.join(rootDir, '.env');
const rootLocalEnvPath = path.join(rootDir, '.env.local');
const backendEnvPath = path.join(backendDir, '.env');
const backendLocalEnvPath = path.join(backendDir, '.env.local');

const isProduction = process.env.NODE_ENV === 'production';
const isStaging = process.env.NODE_ENV === 'staging';

// Carga el entorno desde la raiz del proyecto para evitar depender del cwd
// con el que se levante el backend o se ejecuten scripts auxiliares.
// En desarrollo, el .env local debe ganar sobre variables viejas del sistema.
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath, override: !isProduction });
} else {
  dotenv.config();
}

if (fs.existsSync(rootLocalEnvPath)) {
  dotenv.config({ path: rootLocalEnvPath, override: !isProduction });
}

if (fs.existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath, override: !isProduction });
}

if (fs.existsSync(backendLocalEnvPath)) {
  dotenv.config({ path: backendLocalEnvPath, override: !isProduction });
}

const isPlaceholder = (value) =>
  typeof value === 'string' &&
  (/your-project\.supabase\.co/i.test(value) ||
    /^your-(anon|publishable|secret|service)/i.test(value.trim()) ||
    /^replace-with-/i.test(value.trim()) ||
    /<[^>]+>/u.test(value.trim()));

const clean = (value) => (isPlaceholder(value) ? '' : value);
const decodeJwtRole = (value) => {
  if (typeof value !== 'string' || !value.startsWith('eyJ')) {
    return '';
  }

  try {
    const [, payload] = value.trim().split('.');
    if (!payload) {
      return '';
    }

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      '='
    );
    const decoded = JSON.parse(Buffer.from(paddedPayload, 'base64').toString('utf8'));
    return decoded?.role || '';
  } catch (_error) {
    return '';
  }
};
const isPublicSupabaseKey = (value) =>
  typeof value === 'string' &&
  (/^sb_publishable_/i.test(value.trim()) || decodeJwtRole(value) === 'anon');
const splitOrigins = (value) =>
  String(value || '')
    .split(',')
    .map((origin) => origin.trim())
    .map((origin) => origin.replace(/\/$/, ''))
    .filter(Boolean);

const defaultDevClientUrls = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];
const rawConfiguredClientOrigins = [
  ...splitOrigins(process.env.CLIENT_URL),
  ...splitOrigins(process.env.CLIENT_URLS),
  ...splitOrigins(process.env.CLIENT_ORIGIN),
];
const configuredClientOrigins = rawConfiguredClientOrigins.filter((origin) => origin !== '*');
const clientUrls = [
  ...new Set(isProduction ? configuredClientOrigins : [...defaultDevClientUrls, ...configuredClientOrigins]),
];

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 5000),
  DATABASE_URL: process.env.DATABASE_URL || '',
  DIRECT_URL: process.env.DIRECT_URL || '',
  JWT_SECRET: clean(process.env.JWT_SECRET) || '',
  CLIENT_URL: clientUrls[0] || defaultDevClientUrls[0],
  CLIENT_URLS: clientUrls.length ? clientUrls : [...defaultDevClientUrls],
  SUPABASE_URL: clean(process.env.SUPABASE_URL) || clean(process.env.VITE_SUPABASE_URL) || '',
  SUPABASE_ANON_KEY:
    (isPublicSupabaseKey(clean(process.env.SUPABASE_PUBLISHABLE_KEY)) &&
      clean(process.env.SUPABASE_PUBLISHABLE_KEY)) ||
    (isPublicSupabaseKey(clean(process.env.SUPABASE_ANON_KEY)) && clean(process.env.SUPABASE_ANON_KEY)) ||
    (isPublicSupabaseKey(clean(process.env.VITE_SUPABASE_PUBLISHABLE_KEY)) &&
      clean(process.env.VITE_SUPABASE_PUBLISHABLE_KEY)) ||
    (isPublicSupabaseKey(clean(process.env.VITE_SUPABASE_ANON_KEY)) &&
      clean(process.env.VITE_SUPABASE_ANON_KEY)) ||
    '',
  SUPABASE_SERVICE_ROLE_KEY:
    clean(process.env.SUPABASE_SECRET_KEY) ||
    clean(process.env.SUPABASE_SERVICE_ROLE_KEY) ||
    clean(process.env.SUPABASE_SERVICE_KEY) ||
    '',
  SUPABASE_PROPERTY_MEDIA_BUCKET:
    process.env.SUPABASE_PROPERTY_MEDIA_BUCKET ||
    process.env.VITE_SUPABASE_PROPERTY_MEDIA_BUCKET ||
    'property-media-public',
  DEEPSEK_API_KEY: process.env.DEEPSEK_API_KEY || '',
  DEEPSEK_API_BASE: process.env.DEEPSEK_API_BASE || 'https://api.deepsek.ai',
};

const validateBackendEnv = () => {
  const missing = [];
  const allowedPublicKeys = new Set(['VITE_SUPABASE_ANON_KEY', 'VITE_SUPABASE_PUBLISHABLE_KEY']);
  const publicSecretEnvNames = Object.keys(process.env).filter(
    (key) =>
      key.startsWith('VITE_') &&
      (/(SERVICE|SECRET|PRIVATE|JWT|PASSWORD|TOKEN)/i.test(key) ||
        (/KEY/i.test(key) && !allowedPublicKeys.has(key)))
  );
  const productionLike = isProduction || isStaging;

  if (!process.env.DATABASE_URL) missing.push('DATABASE_URL');
  if (!process.env.DIRECT_URL) missing.push('DIRECT_URL');
  if (!process.env.CLIENT_URL && !process.env.CLIENT_URLS && !process.env.CLIENT_ORIGIN) {
    missing.push('CLIENT_URLS');
  }
  if (!env.SUPABASE_URL) missing.push('SUPABASE_URL');
  if (!env.SUPABASE_ANON_KEY) missing.push('SUPABASE_ANON_KEY');
  if (!env.SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (productionLike && !env.JWT_SECRET) missing.push('JWT_SECRET');

  if (rawConfiguredClientOrigins.includes('*')) {
    missing.push('CLIENT_URLS no puede contener *');
  }

  if (publicSecretEnvNames.length) {
    missing.push(`Variables sensibles no pueden usar prefijo VITE_: ${publicSecretEnvNames.join(', ')}`);
  }

  if (env.SUPABASE_SERVICE_ROLE_KEY && isPublicSupabaseKey(env.SUPABASE_SERVICE_ROLE_KEY)) {
    missing.push('SUPABASE_SERVICE_ROLE_KEY no puede ser una anon/publishable key');
  }

  if (env.SUPABASE_ANON_KEY && decodeJwtRole(env.SUPABASE_ANON_KEY) === 'service_role') {
    missing.push('SUPABASE_ANON_KEY no puede ser service_role');
  }

  if (productionLike && env.CLIENT_URLS.some((origin) => /^http:\/\/(localhost|127\.0\.0\.1)/i.test(origin))) {
    missing.push('CLIENT_URLS de staging/production no debe contener localhost');
  }

  if (missing.length) {
    throw new Error(
      `Configuracion de entorno incompleta o insegura: ${missing.join(
        ', '
      )}. Revisa .env, .env.example y la seccion "Configuracion local de NIDO" del README.`
    );
  }
};

validateBackendEnv();

module.exports = { env, validateBackendEnv };
