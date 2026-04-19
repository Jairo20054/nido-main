const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

if (process.env.NODE_ENV !== 'production' && !process.env.DATABASE_URL) {
  const examplePath = path.resolve(process.cwd(), '.env.example');

  if (fs.existsSync(examplePath)) {
    dotenv.config({ path: examplePath, override: false });
  }
}

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 5000),
  CLIENT_URL: process.env.CLIENT_URL || process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  JWT_SECRET: process.env.JWT_SECRET || 'nido-local-secret-change-me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
};

module.exports = { env };
