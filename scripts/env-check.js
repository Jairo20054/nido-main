const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const rootDir = path.resolve(__dirname, '..');
const envFiles = [
  path.join(rootDir, '.env'),
  path.join(rootDir, 'backend', '.env'),
  path.join(rootDir, 'frontend', '.env'),
];
const placeholderPattern =
  /your-project\.supabase\.co|^your-(anon|publishable|secret|service)|^replace-with-|<[^>]+>/iu;
const sensitiveVitePattern =
  /(SERVICE_ROLE|SERVICE_KEY|SECRET|JWT|DATABASE_URL|DIRECT_URL|PRIVATE|PASSWORD|TOKEN)/iu;

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
    return JSON.parse(Buffer.from(paddedPayload, 'base64').toString('utf8'))?.role || '';
  } catch (_error) {
    return '';
  }
};

const clean = (value) => {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  return trimmed && !placeholderPattern.test(trimmed) ? trimmed : '';
};

const isPublicSupabaseKey = (value) =>
  /^sb_publishable_/iu.test(String(value || '').trim()) || decodeJwtRole(value) === 'anon';

const loadLocalEnv = () => {
  for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
      dotenv.config({ path: envFile, override: process.env.NODE_ENV !== 'production' });
    }
  }
};

const hasAny = (...names) => names.some((name) => Boolean(clean(process.env[name])));

const validateUrl = (name, issues, { allowRelative = false } = {}) => {
  const value = clean(process.env[name]);
  if (!value) {
    issues.push(name);
    return;
  }

  if (allowRelative && value.startsWith('/')) {
    return;
  }

  try {
    new URL(value);
  } catch (_error) {
    issues.push(`${name} debe ser una URL valida`);
  }
};

const validateBackend = ({ productionLike }) => {
  const issues = [];
  const clientUrls = clean(process.env.CLIENT_URLS || process.env.CLIENT_URL || process.env.CLIENT_ORIGIN);
  const serviceKey = clean(
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY
  );
  const anonKey = clean(process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY);
  const sensitiveViteNames = Object.keys(process.env).filter(
    (key) => key.startsWith('VITE_') && sensitiveVitePattern.test(key)
  );

  if (!clean(process.env.DATABASE_URL)) issues.push('DATABASE_URL');
  if (!clean(process.env.DIRECT_URL)) issues.push('DIRECT_URL');
  validateUrl('SUPABASE_URL', issues);
  if (!clientUrls) issues.push('CLIENT_URLS');
  if (!anonKey) issues.push('SUPABASE_ANON_KEY o SUPABASE_PUBLISHABLE_KEY');
  if (anonKey && !isPublicSupabaseKey(anonKey)) {
    issues.push('SUPABASE_ANON_KEY/SUPABASE_PUBLISHABLE_KEY debe ser publica');
  }
  if (!serviceKey) issues.push('SUPABASE_SERVICE_ROLE_KEY');
  if (serviceKey && isPublicSupabaseKey(serviceKey)) {
    issues.push('SUPABASE_SERVICE_ROLE_KEY no puede ser anon/publishable');
  }
  if (productionLike && !clean(process.env.JWT_SECRET)) issues.push('JWT_SECRET');
  if (clientUrls.split(',').some((origin) => origin.trim() === '*')) {
    issues.push('CLIENT_URLS no puede contener *');
  }
  if (
    productionLike &&
    clientUrls.split(',').some((origin) => /^http:\/\/(localhost|127\.0\.0\.1)/iu.test(origin.trim()))
  ) {
    issues.push('CLIENT_URLS de staging/production no debe contener localhost');
  }
  if (sensitiveViteNames.length) {
    issues.push(`variables secretas expuestas con VITE_: ${sensitiveViteNames.join(', ')}`);
  }

  return issues;
};

const validateFrontend = () => {
  const issues = [];
  const publicKey = clean(
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_ANON_KEY
  );
  const sensitiveViteNames = Object.keys(process.env).filter(
    (key) => key.startsWith('VITE_') && sensitiveVitePattern.test(key)
  );

  if (!hasAny('VITE_API_URL', 'VITE_API_BASE_URL')) issues.push('VITE_API_URL');
  validateUrl('VITE_SUPABASE_URL', issues);
  if (!publicKey) issues.push('VITE_SUPABASE_ANON_KEY o VITE_SUPABASE_PUBLISHABLE_KEY');
  if (publicKey && !isPublicSupabaseKey(publicKey)) {
    issues.push('la clave publica de Supabase no debe ser service_role/secret');
  }
  if (sensitiveViteNames.length) {
    issues.push(`variables secretas expuestas con VITE_: ${sensitiveViteNames.join(', ')}`);
  }

  return issues;
};

const main = () => {
  loadLocalEnv();

  const scopeArg = process.argv.find((arg) => arg.startsWith('--scope='));
  const scope = scopeArg ? scopeArg.split('=')[1] : 'all';
  const nodeEnv = process.env.NODE_ENV || 'development';
  const productionLike = nodeEnv === 'production' || nodeEnv === 'staging';
  const checks = [];

  if (scope === 'all' || scope === 'backend') {
    checks.push(['backend', validateBackend({ productionLike })]);
  }

  if (scope === 'all' || scope === 'frontend') {
    checks.push(['frontend', validateFrontend()]);
  }

  const failed = checks.filter(([, issues]) => issues.length);

  if (failed.length) {
    console.error('[env:check] Configuracion incompleta o insegura.');
    for (const [name, issues] of failed) {
      console.error(`- ${name}: ${issues.join(', ')}`);
    }
    console.error('No se imprimen valores para no exponer secretos. Revisa .env.example y README.md.');
    process.exit(1);
  }

  console.log(`[env:check] OK (${nodeEnv}). Variables requeridas presentes y sin secretos VITE_ detectados.`);
};

main();
