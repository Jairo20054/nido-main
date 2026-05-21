import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'prisma/config';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootEnvPath = path.join(__dirname, '.env');
const backendEnvPath = path.join(__dirname, 'backend', '.env');

dotenv.config({ path: rootEnvPath, override: process.env.NODE_ENV !== 'production' });
dotenv.config({ path: backendEnvPath, override: process.env.NODE_ENV !== 'production' });

const databaseUrl = process.env.DATABASE_URL;
const directUrl = process.env.DIRECT_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL no esta configurada. Crea .env desde .env.example antes de ejecutar Prisma.');
}

if (!directUrl) {
  throw new Error('DIRECT_URL no esta configurada. Crea .env desde .env.example antes de ejecutar Prisma.');
}

process.env.DATABASE_URL = databaseUrl;
process.env.DIRECT_URL = directUrl;

export default defineConfig({
  schema: 'backend/prisma/schema.prisma',
  migrations: {
    seed: 'node backend/prisma/seed.js',
  },
  datasource: {
    url: databaseUrl,
  },
});
