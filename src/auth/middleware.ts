import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../db/prisma';

export const authenticate = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    await req.jwtVerify();
  } catch (err) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
};

export const authorizePropertyOwner = async (req: FastifyRequest, reply: FastifyReply) => {
  const userId = (req as any).user.id;
  const { propertyId } = req.params as any;
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property || property.ownerId !== userId) {
    return reply.status(403).send({ error: 'Forbidden' });
  }
};

export const authorizeMediaOwner = async (req: FastifyRequest, reply: FastifyReply) => {
  const userId = (req as any).user.id;
  const { mediaId } = req.params as any;
  const media = await prisma.media.findUnique({ where: { id: mediaId } });
  if (!media) return reply.status(404).send({ error: 'Not found' });
  const property = await prisma.property.findUnique({ where: { id: media.propertyId } });
  if (!property || property.ownerId !== userId) {
    return reply.status(403).send({ error: 'Forbidden' });
  }
};
