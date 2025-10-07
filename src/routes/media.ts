import { FastifyInstance } from 'fastify';
import mediaController from '../controllers/mediaController';
import { authenticate, authorizePropertyOwner, authorizeMediaOwner } from '../auth/middleware';

export default async function (app: FastifyInstance) {
  app.addHook('preHandler', authenticate);
  app.post('/properties/:propertyId/media/initiate', { preHandler: authorizePropertyOwner }, mediaController.initiateUpload);
  app.post('/properties/:propertyId/media/complete', { preHandler: authorizePropertyOwner }, mediaController.completeUpload);
  app.post('/properties/:propertyId/media', { preHandler: authorizePropertyOwner }, mediaController.multipartUpload);
  app.get('/properties/:propertyId/media', { preHandler: authorizePropertyOwner }, mediaController.listMedia);
  app.get('/media/:mediaId', { preHandler: authorizeMediaOwner }, mediaController.getMedia);
  app.delete('/media/:mediaId', { preHandler: authorizeMediaOwner }, mediaController.deleteMedia);
}
