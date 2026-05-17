const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const rootDir = path.resolve(__dirname, '..', '..', '..');
const envPath = path.join(rootDir, '.env');
const examplePath = path.join(rootDir, '.env.example');

const isProduction = process.env.NODE_ENV === 'production';

// Carga el entorno desde la raiz del proyecto para evitar depender del cwd
// con el que se levante el backend o se ejecuten scripts auxiliares.
// En desarrollo, el .env local debe ganar sobre variables viejas del sistema.
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath, override: !isProduction });
} else {
  dotenv.config();
}

if (process.env.NODE_ENV !== 'production' && !process.env.DATABASE_URL && fs.existsSync(examplePath)) {
  dotenv.config({ path: examplePath, override: false });
}

const isPlaceholder = (value) =>
  typeof value === 'string' &&
  (/your-project\.supabase\.co/i.test(value) ||
    /^your-(anon|publishable|secret|service)/i.test(value.trim()));

const clean = (value) => (isPlaceholder(value) ? '' : value);
const isPublicSupabaseKey = (value) =>
  typeof value === 'string' &&
  (/^sb_publishable_/i.test(value.trim()) || /^eyJ/i.test(value.trim()));
const splitOrigins = (value) =>
  String(value || '')
    .split(',')
    .map((origin) => origin.trim())
    .map((origin) => origin.replace(/\/$/, ''))
    .filter(Boolean);

const configuredClientOrigins =
  process.env.CLIENT_URLS || process.env.CLIENT_URL || process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const clientUrls = splitOrigins(configuredClientOrigins);

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 5000),
  DATABASE_URL: process.env.DATABASE_URL || '',
  DIRECT_URL: process.env.DIRECT_URL || '',
  CLIENT_URL: clientUrls[0] || 'http://localhost:5173',
  CLIENT_URLS: clientUrls.length ? clientUrls : ['http://localhost:5173'],
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
  DEEPSEK_API_KEY: process.env.DEEPSEK_API_KEY || process.env.VITE_DEEPSEK_API_KEY || '',
  DEEPSEK_API_BASE: process.env.DEEPSEK_API_BASE || 'https://api.deepsek.ai',
};

if (isProduction) {
  const missing = [];

  if (!process.env.DATABASE_URL) missing.push('DATABASE_URL');
  if (!process.env.CLIENT_URL && !process.env.CLIENT_URLS && !process.env.CLIENT_ORIGIN) {
    missing.push('CLIENT_URL');
  }
  if (!env.SUPABASE_URL) missing.push('SUPABASE_URL');
  if (!env.SUPABASE_ANON_KEY) missing.push('SUPABASE_ANON_KEY');
  if (!env.SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');

  if (env.CLIENT_URLS.includes('*')) {
    missing.push('CLIENT_URLS no puede contener *');
  }

  if (missing.length) {
    throw new Error(`Configuracion de entorno incompleta: ${missing.join(', ')}`);
  }
}

module.exports = { env };
