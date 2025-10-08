import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import pino from 'pino';
import { config } from './utils/config';
import mediaRoutes from './routes/media';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const app = Fastify({ logger });

app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || config.JWT_SECRET
});

app.register(multipart, { limits: { fileSize: Number(process.env.MAX_IMAGE_SIZE_BYTES || 10485760) } });

app.get('/health', async () => ({ status: 'ok' }));

app.register(mediaRoutes, { prefix: '/api' });

const port = Number(process.env.PORT || config.PORT || 4000);
app.listen({ port, host: '0.0.0.0' }).then(() => {
  logger.info(`Server listening on ${port}`);
}).catch(err => {
  logger.error(err);
  process.exit(1);
});
