import { FastifyReply, FastifyRequest } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { storageService } from '../services/storageService';
import { prisma } from '../db/prisma';
import { virusScanner } from '../services/virusScanner';

const initiateUpload = async (req: FastifyRequest, reply: FastifyReply) => {
  const { propertyId } = req.params as any;
  const body = req.body as any;
  const { filename, mimeType, size, kind } = body;
  // TODO: auth & permissions
  const tempId = uuidv4();
  const uploadKey = `${propertyId}/${tempId}/${filename}`;
  const uploadUrl = await storageService.getPresignedPutUrl(uploadKey, mimeType);

  // Create DB record with status uploading
  await prisma.media.create({ data: {
    id: tempId,
    propertyId,
    userId: 'unknown',
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
  // TODO: enqueue

  await prisma.media.update({ where: { id: tempId }, data: { status: 'processing' } });
  return reply.send({ mediaId: tempId, status: 'processing' });
};

const multipartUpload = async (req: FastifyRequest, reply: FastifyReply) => {
  const { propertyId } = req.params as any;
  const data = await (req as any).file();
  const filename = data.filename;
  const tempId = uuidv4();
  const uploadKey = `${propertyId}/${tempId}/${filename}`;

  // Stream to storage
  await storageService.uploadStream(uploadKey, data.file, data.mimetype);

  // Create DB record
  await prisma.media.create({ data: {
    id: tempId,
    propertyId,
    userId: 'unknown',
    storageKey: uploadKey,
    originalName: filename,
    mimeType: data.mimetype,
    kind: data.mimetype.startsWith('image') ? 'image' : 'video',
    size: data.file.byteLength || 0,
    status: 'processing'
  }});

  // TODO: enqueue

  return reply.send({ mediaId: tempId, status: 'processing' });
};

const listMedia = async (req: FastifyRequest, reply: FastifyReply) => {
  const { propertyId } = req.params as any;
  const items = await prisma.media.findMany({ where: { propertyId } });
  // map to include signed urls
  const results = await Promise.all(items.map(async m => {
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
  // TODO: permissions
  const m = await prisma.media.findUnique({ where: { id: mediaId } });
  if (!m) return reply.status(404).send({ error: 'Not found' });
  await prisma.media.update({ where: { id: mediaId }, data: { status: 'deleted' } });
  // enqueue hard delete job
  return reply.send({ ok: true });
};

export default { initiateUpload, completeUpload, multipartUpload, listMedia, getMedia, deleteMedia };
