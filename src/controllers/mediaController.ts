import { FastifyReply, FastifyRequest } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { storageService } from '../services/storageService';
import { prisma } from '../db/prisma';
import { virusScanner } from '../services/virusScanner';
import { mediaQueue } from '../queue';
import { config } from '../utils/config';


const initiateUpload = async (req: FastifyRequest, reply: FastifyReply) => {
  const { propertyId } = req.params as any;
  const body = req.body as any;
  const { filename, mimeType, size, kind } = body;
  const userId = (req as any).user.id;

  // Validations
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/avif'];
  const allowedVideoTypes = ['video/mp4', 'video/mov', 'video/mkv', 'video/webm'];
  const maxImageSize = config.MAX_IMAGE_SIZE_BYTES;
  const maxVideoSize = config.MAX_VIDEO_SIZE_BYTES;

  if (kind === 'image' && !allowedImageTypes.includes(mimeType)) {
    return reply.status(400).send({ error: 'Invalid image type' });
  }
  if (kind === 'video' && !allowedVideoTypes.includes(mimeType)) {
    return reply.status(400).send({ error: 'Invalid video type' });
  }
  if (kind === 'image' && size > maxImageSize) {
    return reply.status(400).send({ error: `Image too large, max ${maxImageSize} bytes` });
  }
  if (kind === 'video' && size > maxVideoSize) {
    return reply.status(400).send({ error: `Video too large, max ${maxVideoSize} bytes` });
  }

  const tempId = uuidv4();
  const uploadKey = `${propertyId}/${tempId}/${filename}`;
  const uploadUrl = await storageService.getPresignedPutUrl(uploadKey, mimeType);

  // Create DB record with status uploading
  await prisma.media.create({ data: {
    id: tempId,
    propertyId,
    userId,
    storageKey: uploadKey,
    originalName: filename,
    mimeType,
    kind,
    size,
    status: 'uploading'
  }});

  return reply.send({ uploadUrl, uploadKey, uploadMethod: 'presigned', tempId });
};

const completeUpload = async (req: FastifyRequest, reply: FastifyReply) => {
  const { propertyId } = req.params as any;
  const { tempId, uploadKey } = req.body as any;
  const userId = (req as any).user.id;
  // Validate file exists in storage
  const exists = await storageService.exists(uploadKey);
  if (!exists) return reply.status(400).send({ error: 'File not found in storage' });

  // Scan for viruses
  const clean = await virusScanner.scanS3Key(uploadKey);
  if (!clean) {
    await prisma.media.update({ where: { id: tempId }, data: { status: 'failed' } });
    return reply.status(400).send({ error: 'Virus detected' });
  }

  // Enqueue processing job
  await mediaQueue.add('process-media', { mediaId: tempId });

  await prisma.media.update({ where: { id: tempId }, data: { status: 'processing' } });
  return reply.send({ mediaId: tempId, status: 'processing' });
};

const multipartUpload = async (req: FastifyRequest, reply: FastifyReply) => {
  const { propertyId } = req.params as any;
  const data = await (req as any).file();
  const filename = data.filename;
  const userId = (req as any).user.id;
  const tempId = uuidv4();
  const uploadKey = `${propertyId}/${tempId}/${filename}`;

  // Stream to storage
  await storageService.uploadStream(uploadKey, data.file, data.mimetype);

  // Create DB record
  await prisma.media.create({ data: {
    id: tempId,
    propertyId,
    userId,
    storageKey: uploadKey,
    originalName: filename,
    mimeType: data.mimetype,
    kind: data.mimetype.startsWith('image') ? 'image' : 'video',
    size: data.file.byteLength || 0,
    status: 'processing'
  }});

  // Enqueue processing job
  await mediaQueue.add('process-media', { mediaId: tempId });

  return reply.send({ mediaId: tempId, status: 'processing' });
};

const listMedia = async (req: FastifyRequest, reply: FastifyReply) => {
  const { propertyId } = req.params as any;
  const items = await prisma.media.findMany({ where: { propertyId } });
  // map to include signed urls
  const results = await Promise.all(items.map(async (m: any) => {
    const urls = {
      original: await storageService.getPresignedGetUrl(m.storageKey)
    };
    return { ...m, urls };
  }));
  return reply.send(results);
};

const getMedia = async (req: FastifyRequest, reply: FastifyReply) => {
  const { mediaId } = req.params as any;
  const m = await prisma.media.findUnique({ where: { id: mediaId } });
  if (!m) return reply.status(404).send({ error: 'Not found' });
  // attach signed urls for variants
  const variants = m.variants || {};
  for (const k in variants) {
    if (variants[k].key) {
      variants[k].url = await storageService.getPresignedGetUrl(variants[k].key);
    }
  }
  return reply.send({ ...m, variants });
};

const deleteMedia = async (req: FastifyRequest, reply: FastifyReply) => {
  const { mediaId } = req.params as any;
  const userId = (req as any).user.id;
  const m = await prisma.media.findUnique({ where: { id: mediaId } });
  if (!m) return reply.status(404).send({ error: 'Not found' });
  if (m.userId !== userId) return reply.status(403).send({ error: 'Forbidden' });
  await prisma.media.update({ where: { id: mediaId }, data: { status: 'deleted' } });
  // enqueue hard delete job
  return reply.send({ ok: true });
};

const reprocesarMedia = async (req: FastifyRequest, reply: FastifyReply) => {
  const { mediaId } = req.params as any;
  const m = await prisma.media.findUnique({ where: { id: mediaId } });
  if (!m) return reply.status(404).send({ error: 'Not found' });
  await prisma.media.update({ where: { id: mediaId }, data: { status: 'processing' } });
  await mediaQueue.add('process-media', { mediaId });
  return reply.send({ ok: true });
};

const getQueueStatus = async (req: FastifyRequest, reply: FastifyReply) => {
  // Simple status, in real app use Bull Board or API
  return reply.send({ active: 0, waiting: 0, failed: 0 }); // placeholder
};

export default { initiateUpload, completeUpload, multipartUpload, listMedia, getMedia, deleteMedia, reprocesarMedia, getQueueStatus };
