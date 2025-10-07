import AWS from 'aws-sdk';
import { config } from '../utils/config';

const s3 = new AWS.S3({
  endpoint: config.S3_ENDPOINT,
  accessKeyId: config.S3_ACCESS_KEY,
  secretAccessKey: config.S3_SECRET_KEY,
  region: config.S3_REGION,
  s3ForcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true' || true,
  signatureVersion: 'v4'
});

export const storageService = {
  getPresignedPutUrl: async (key: string, contentType: string) => {
    const params = {
      Bucket: config.S3_BUCKET,
      Key: key,
      Expires: config.SIGNED_URL_EXPIRATION_SECONDS,
      ContentType: contentType
    } as any;
    return s3.getSignedUrlPromise('putObject', params);
  },
  getPresignedGetUrl: async (key: string) => {
    const params = { Bucket: config.S3_BUCKET, Key: key, Expires: config.SIGNED_URL_EXPIRATION_SECONDS } as any;
    return s3.getSignedUrlPromise('getObject', params);
  },
  exists: async (key: string) => {
    try {
      await s3.headObject({ Bucket: config.S3_BUCKET, Key: key }).promise();
      return true;
    } catch (e) {
      return false;
    }
  },
  uploadStream: async (key: string, stream: NodeJS.ReadableStream, contentType: string) => {
    const params = { Bucket: config.S3_BUCKET, Key: key, Body: stream, ContentType: contentType } as any;
    await s3.upload(params).promise();
  },
  delete: async (key: string) => {
    await s3.deleteObject({ Bucket: config.S3_BUCKET, Key: key }).promise();
  }
};
