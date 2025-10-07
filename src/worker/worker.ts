import { Queue, Worker, QueueScheduler } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../utils/config';
import pino from 'pino';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { storageService } from '../services/storageService';
import { prisma } from '../db/prisma';
import fs from 'fs';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const connection = new IORedis(config.REDIS_URL);

const mediaQueueName = 'media-processing';
const queue = new Queue(mediaQueueName, { connection });
new QueueScheduler(mediaQueueName, { connection });

const worker = new Worker(mediaQueueName, async job => {
  logger.info({ job: job.id, name: job.name }, 'Processing job');
  const { mediaId } = job.data;
  const media = await prisma.media.findUnique({ where: { id: mediaId } });
  if (!media) throw new Error('Media not found');

  try {
    if (media.kind === 'image') {
      await processImage(media);
    } else if (media.kind === 'video') {
      await processVideo(media);
    }
    await prisma.media.update({ where: { id: mediaId }, data: { status: 'ready' } });
  } catch (err) {
    logger.error({ err, mediaId }, 'Processing failed');
    await prisma.media.update({ where: { id: mediaId }, data: { status: 'failed' } });
    throw err;
  }
  return { ok: true };
}, { connection, concurrency: Number(process.env.WORKER_CONCURRENCY || 2) });

async function processImage(media: any) {
  const inputBuffer = await storageService.getBuffer(media.storageKey);
  const variants: any = {};

  // Thumbnail
  const thumbBuffer = await sharp(inputBuffer).resize(300, 300, { fit: 'cover' }).jpeg().toBuffer();
  const thumbKey = `${media.storageKey}-thumb.jpg`;
  await storageService.uploadBuffer(thumbKey, thumbBuffer, 'image/jpeg');
  variants.thumb = { key: thumbKey };

  // Medium
  const medBuffer = await sharp(inputBuffer).resize(800, 600, { fit: 'inside' }).jpeg().toBuffer();
  const medKey = `${media.storageKey}-medium.jpg`;
  await storageService.uploadBuffer(medKey, medBuffer, 'image/jpeg');
  variants.medium = { key: medKey };

  await prisma.media.update({ where: { id: media.id }, data: { variants } });
}

async function processVideo(media: any) {
  // For simplicity, skip video processing for now
  const variants: any = {};
  await prisma.media.update({ where: { id: media.id }, data: { variants } });
}

worker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err: err.message }, 'Job failed');
});

worker.on('completed', job => {
  logger.info({ jobId: job.id }, 'Job completed');
});

process.on('SIGINT', async () => {
  await worker.close();
  await queue.close();
  process.exit(0);
});
