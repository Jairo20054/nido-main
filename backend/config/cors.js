const corsConfig = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'https://nido.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With'
  ],
  exposedHeaders: ['Content-Range', 'X-Total-Count'],
  maxAge: 600
};

module.exports = corsConfig;