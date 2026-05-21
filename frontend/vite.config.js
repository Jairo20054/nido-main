import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const frontendEnvPath = path.join(__dirname, '.env');
const frontendLocalEnvPath = path.join(__dirname, '.env.local');
const placeholderPattern = /your-project\.supabase\.co|^your-(anon|publishable|secret|service)|^replace-with-|<[^>]+>/iu;
const sensitiveVitePattern = /(^|_)(SERVICE_ROLE|SERVICE_KEY|SECRET|JWT|DATABASE_URL|DIRECT_URL|PRIVATE|PASSWORD|TOKEN)($|_)/iu;
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
const isPlaceholder = (value) =>
  typeof value !== 'string' || !value.trim() || placeholderPattern.test(value.trim());
const isPublicSupabaseKey = (value) =>
  typeof value === 'string' &&
  (/^sb_publishable_/i.test(value.trim()) || decodeJwtRole(value) === 'anon');

dotenv.config({
  path: path.join(rootDir, '.env'),
  override: process.env.NODE_ENV !== 'production',
});
dotenv.config({
  path: path.join(rootDir, '.env.local'),
  override: process.env.NODE_ENV !== 'production',
});
dotenv.config({
  path: frontendEnvPath,
  override: process.env.NODE_ENV !== 'production',
});
dotenv.config({
  path: frontendLocalEnvPath,
  override: process.env.NODE_ENV !== 'production',
});

if (!process.env.VITE_SUPABASE_URL && process.env.SUPABASE_URL) {
  process.env.VITE_SUPABASE_URL = process.env.SUPABASE_URL;
}

if (
  !process.env.VITE_SUPABASE_PUBLISHABLE_KEY &&
  isPublicSupabaseKey(process.env.SUPABASE_PUBLISHABLE_KEY)
) {
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
}

if (!process.env.VITE_SUPABASE_ANON_KEY && isPublicSupabaseKey(process.env.SUPABASE_ANON_KEY)) {
  process.env.VITE_SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
}

if (!process.env.VITE_API_URL && process.env.VITE_API_BASE_URL) {
  process.env.VITE_API_URL = process.env.VITE_API_BASE_URL;
}

const validatePublicEnv = () => {
  const issues = [];
  const publicKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const sensitiveNames = Object.keys(process.env).filter(
    (key) => key.startsWith('VITE_') && sensitiveVitePattern.test(key)
  );

  if (sensitiveNames.length) {
    issues.push(`variables secretas expuestas como VITE_: ${sensitiveNames.join(', ')}`);
  }

  if (isPlaceholder(process.env.VITE_API_URL)) {
    issues.push('VITE_API_URL');
  }

  if (isPlaceholder(process.env.VITE_SUPABASE_URL)) {
    issues.push('VITE_SUPABASE_URL');
  }

  if (isPlaceholder(publicKey)) {
    issues.push('VITE_SUPABASE_ANON_KEY o VITE_SUPABASE_PUBLISHABLE_KEY');
  } else if (!isPublicSupabaseKey(publicKey)) {
    issues.push('la clave publica de Supabase no debe ser service_role/secret');
  }

  if (issues.length) {
    throw new Error(
      `Configuracion frontend incompleta o insegura: ${issues.join(
        ', '
      )}. Crea .env desde frontend/.env.example o .env.example.`
    );
  }
};

validatePublicEnv();

export default defineConfig({
  root: __dirname,
  envDir: rootDir,
  publicDir: path.resolve(__dirname, 'public'),
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, '../dist'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          if (id.includes('/react') || id.includes('\\react')) {
            return 'react';
          }

          if (id.includes('@supabase')) {
            return 'supabase';
          }

          if (id.includes('lucide-react')) {
            return 'icons';
          }

          return undefined;
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.NIDO_API_PORT || process.env.PORT || 5000}`,
        changeOrigin: true,
      },
    },
  },
});
