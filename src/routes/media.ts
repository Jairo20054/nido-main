import { FastifyInstance } from 'fastify';
import mediaController from '../controllers/mediaController';

export default async function (app: FastifyInstance) {
  app.post('/properties/:propertyId/media/initiate', mediaController.initiateUpload);
  app.post('/properties/:propertyId/media/complete', mediaController.completeUpload);
  app.post('/properties/:propertyId/media', mediaController.multipartUpload);
  app.get('/properties/:propertyId/media', mediaController.listMedia);
  app.get('/media/:mediaId', mediaController.getMedia);
  app.delete('/media/:mediaId', mediaController.deleteMedia);
}
