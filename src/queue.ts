import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { config } from './utils/config';

const connection = new IORedis(config.REDIS_URL);

export const mediaQueue = new Queue('media-processing', { connection });
