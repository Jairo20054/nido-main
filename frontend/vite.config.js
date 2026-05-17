import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const isPublicSupabaseKey = (value) =>
  typeof value === 'string' &&
  (/^sb_publishable_/i.test(value.trim()) || /^eyJ/i.test(value.trim()));

dotenv.config({
  path: path.join(rootDir, '.env'),
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
