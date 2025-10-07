import { Queue, Worker, QueueEvents } from 'bullmq';
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
const queueEvents = new QueueEvents(mediaQueueName, { connection });

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
  const inputBuffer = await storageService.getBuffer(media.storageKey);
  const tempInput = `/tmp/${media.id}-input`;
  const tempOutput = `/tmp/${media.id}-output`;
  fs.writeFileSync(tempInput, inputBuffer);

  const variants: any = {};

  // Get metadata
  const metadata = await new Promise<any>((resolve, reject) => {
    ffmpeg.ffprobe(tempInput, (err: any, data: any) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
  const duration = metadata.format.duration;
  const width = metadata.streams[0].width;
  const height = metadata.streams[0].height;

  // Update DB with metadata
  await prisma.media.update({ where: { id: media.id }, data: { duration, width, height } });

  // Generate poster frame (thumbnail)
  const posterKey = `${media.storageKey}-poster.jpg`;
  await new Promise<void>((resolve, reject) => {
    ffmpeg(tempInput)
      .screenshots({
        count: 1,
        folder: '/tmp',
        filename: `${media.id}-poster.jpg`,
        timemarks: ['1%']
      })
      .on('end', () => {
        const posterBuffer = fs.readFileSync(`/tmp/${media.id}-poster.jpg`);
        storageService.uploadBuffer(posterKey, posterBuffer, 'image/jpeg').then(() => resolve());
      })
      .on('error', reject);
  });
  variants.poster = { key: posterKey };

  // Transcode to 360p MP4
  const mp4_360_key = `${media.storageKey}-360.mp4`;
  await new Promise<void>((resolve, reject) => {
    ffmpeg(tempInput)
      .videoCodec('libx264')
      .size('640x360')
      .audioCodec('aac')
      .audioChannels(2)
      .audioFrequency(44100)
      .outputOptions(['-preset fast', '-crf 28'])
      .output(tempOutput + '-360.mp4')
      .on('end', () => {
        const buffer = fs.readFileSync(tempOutput + '-360.mp4');
        storageService.uploadBuffer(mp4_360_key, buffer, 'video/mp4').then(() => resolve());
      })
      .on('error', reject)
      .run();
  });
  variants.mp4_360 = { key: mp4_360_key, width: 640, height: 360 };

  // Transcode to 720p MP4
  const mp4_720_key = `${media.storageKey}-720.mp4`;
  await new Promise<void>((resolve, reject) => {
    ffmpeg(tempInput)
      .videoCodec('libx264')
      .size('1280x720')
      .audioCodec('aac')
      .audioChannels(2)
      .audioFrequency(44100)
      .outputOptions(['-preset fast', '-crf 28'])
      .output(tempOutput + '-720.mp4')
      .on('end', () => {
        const buffer = fs.readFileSync(tempOutput + '-720.mp4');
        storageService.uploadBuffer(mp4_720_key, buffer, 'video/mp4').then(() => resolve());
      })
      .on('error', reject)
      .run();
  });
  variants.mp4_720 = { key: mp4_720_key, width: 1280, height: 720 };

  // Transcode to WebM
  const webm_key = `${media.storageKey}.webm`;
  await new Promise<void>((resolve, reject) => {
    ffmpeg(tempInput)
      .videoCodec('libvpx-vp9')
      .audioCodec('libopus')
      .outputOptions(['-b:v 1M', '-b:a 128k'])
      .output(tempOutput + '.webm')
      .on('end', () => {
        const buffer = fs.readFileSync(tempOutput + '.webm');
        storageService.uploadBuffer(webm_key, buffer, 'video/webm').then(() => resolve());
      })
      .on('error', reject)
      .run();
  });
  variants.webm = { key: webm_key };

  // Cleanup temp files
  fs.unlinkSync(tempInput);
  fs.unlinkSync(tempOutput + '-360.mp4');
  fs.unlinkSync(tempOutput + '-720.mp4');
  fs.unlinkSync(tempOutput + '.webm');
  fs.unlinkSync(`/tmp/${media.id}-poster.jpg`);

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
