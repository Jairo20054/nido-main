import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/nido_media';

process.env.DATABASE_URL = databaseUrl;

export default defineConfig({
  schema: 'backend/prisma/schema.prisma',
  migrations: {
    seed: 'node backend/prisma/seed.js',
  },
  datasource: {
    url: databaseUrl,
  },
});
