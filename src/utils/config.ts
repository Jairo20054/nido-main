import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: Number(process.env.PORT || 4000),
  JWT_SECRET: process.env.JWT_SECRET || 'changeme',
  DATABASE_URL: process.env.DATABASE_URL || '',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  S3_ENDPOINT: process.env.S3_ENDPOINT || 'http://localhost:9000',
  S3_REGION: process.env.S3_REGION || 'us-east-1',
  S3_BUCKET: process.env.S3_BUCKET || 'nido-media',
  S3_ACCESS_KEY: process.env.S3_ACCESS_KEY || 'minioadmin',
  S3_SECRET_KEY: process.env.S3_SECRET_KEY || 'minioadmin',
  SIGNED_URL_EXPIRATION_SECONDS: Number(process.env.SIGNED_URL_EXPIRATION_SECONDS || 86400),
  MAX_IMAGE_SIZE_BYTES: Number(process.env.MAX_IMAGE_SIZE_BYTES || 10485760),
  MAX_VIDEO_SIZE_BYTES: Number(process.env.MAX_VIDEO_SIZE_BYTES || 524288000),
  MAX_VIDEO_DURATION_SECONDS: Number(process.env.MAX_VIDEO_DURATION_SECONDS || 600),
  CLAMAV_HOST: process.env.CLAMAV_HOST || 'localhost',
  CLAMAV_PORT: Number(process.env.CLAMAV_PORT || 3310),
};
