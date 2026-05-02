import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

dotenv.config({
  path: path.join(rootDir, '.env'),
  override: process.env.NODE_ENV !== 'production',
});

export default defineConfig({
  root: __dirname,
  envDir: rootDir,
  publicDir: path.resolve(__dirname, 'public'),
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, '../dist'),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
