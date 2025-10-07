import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import mediaController from '../controllers/mediaController';
import { prisma } from '../db/prisma';
import { storageService } from '../services/storageService';
import { virusScanner } from '../services/virusScanner';
import { mediaQueue } from '../queue';

// Mock dependencies
jest.mock('../db/prisma', () => ({
  prisma: {
    media: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

jest.mock('../services/storageService', () => ({
  storageService: {
    getPresignedPutUrl: jest.fn(),
    exists: jest.fn(),
    uploadStream: jest.fn(),
    getPresignedGetUrl: jest.fn(),
  },
}));

jest.mock('../services/virusScanner', () => ({
  virusScanner: {
    scanS3Key: jest.fn(),
  },
}));

jest.mock('../queue', () => ({
  mediaQueue: {
    add: jest.fn(),
  },
}));

describe('mediaController', () => {
  let mockReq: any;
  let mockReply: any;

  beforeEach(() => {
    mockReq = {
      params: {},
      body: {},
      user: { id: 'user1' },
      file: jest.fn(),
    };
    mockReply = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('initiateUpload', () => {
    it('should create media record and return presigned URL', async () => {
      mockReq.params.propertyId = 'prop1';
      mockReq.body = { filename: 'test.jpg', mimeType: 'image/jpeg', size: 1000, kind: 'image' };
      (storageService.getPresignedPutUrl as jest.Mock).mockResolvedValue('http://presigned.url');
      (prisma.media.create as jest.Mock).mockResolvedValue({ id: 'temp1' });

      await mediaController.initiateUpload(mockReq, mockReply);

      expect(prisma.media.create).toHaveBeenCalledWith({
        data: {
          id: expect.any(String),
          propertyId: 'prop1',
          userId: 'user1',
          storageKey: expect.stringContaining('prop1/'),
          originalName: 'test.jpg',
          mimeType: 'image/jpeg',
          kind: 'image',
          size: 1000,
          status: 'uploading',
        },
      });
      expect(mockReply.send).toHaveBeenCalledWith({
        uploadUrl: 'http://presigned.url',
        uploadKey: expect.any(String),
        uploadMethod: 'presigned',
        tempId: expect.any(String),
      });
    });

    it('should reject invalid image type', async () => {
      mockReq.body = { filename: 'test.txt', mimeType: 'text/plain', size: 1000, kind: 'image' };

      await mediaController.initiateUpload(mockReq, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Invalid image type' });
    });
  });

  describe('completeUpload', () => {
    it('should enqueue processing job if upload is valid and clean', async () => {
      mockReq.params.propertyId = 'prop1';
      mockReq.body = { tempId: 'temp1', uploadKey: 'key1' };
      (storageService.exists as jest.Mock).mockResolvedValue(true);
      (virusScanner.scanS3Key as jest.Mock).mockResolvedValue(true);
      (prisma.media.update as jest.Mock).mockResolvedValue({});

      await mediaController.completeUpload(mockReq, mockReply);

      expect(mediaQueue.add).toHaveBeenCalledWith('process-media', { mediaId: 'temp1' });
      expect(mockReply.send).toHaveBeenCalledWith({ mediaId: 'temp1', status: 'processing' });
    });

    it('should reject if file not found in storage', async () => {
      (storageService.exists as jest.Mock).mockResolvedValue(false);

      await mediaController.completeUpload(mockReq, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'File not found in storage' });
    });
  });

  describe('listMedia', () => {
    it('should return list of media with signed URLs', async () => {
      mockReq.params.propertyId = 'prop1';
      const mediaList = [{ id: '1', storageKey: 'key1' }];
      (prisma.media.findMany as jest.Mock).mockResolvedValue(mediaList);
      (storageService.getPresignedGetUrl as jest.Mock).mockResolvedValue('http://signed.url');

      await mediaController.listMedia(mockReq, mockReply);

      expect(mockReply.send).toHaveBeenCalledWith([
        { id: '1', storageKey: 'key1', urls: { original: 'http://signed.url' } },
      ]);
    });
  });

  describe('getMedia', () => {
    it('should return media details with signed URLs for variants', async () => {
      mockReq.params.mediaId = 'media1';
      const media = { id: 'media1', variants: { thumb: { key: 'thumbkey' } } };
      (prisma.media.findUnique as jest.Mock).mockResolvedValue(media);
      (storageService.getPresignedGetUrl as jest.Mock).mockResolvedValue('http://signed.url');

      await mediaController.getMedia(mockReq, mockReply);

      expect(mockReply.send).toHaveBeenCalledWith({
        id: 'media1',
        variants: { thumb: { key: 'thumbkey', url: 'http://signed.url' } },
      });
    });
  });

  describe('deleteMedia', () => {
    it('should mark media as deleted', async () => {
      mockReq.params.mediaId = 'media1';
      (prisma.media.findUnique as jest.Mock).mockResolvedValue({ id: 'media1', userId: 'user1' });

      await mediaController.deleteMedia(mockReq, mockReply);

      expect(prisma.media.update).toHaveBeenCalledWith({
        where: { id: 'media1' },
        data: { status: 'deleted' },
      });
      expect(mockReply.send).toHaveBeenCalledWith({ ok: true });
    });
  });
});
