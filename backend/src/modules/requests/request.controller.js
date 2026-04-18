const { RequestStatus, PropertyStatus } = require('@prisma/client');
const { prisma } = require('../../shared/prisma');
const { badRequest, forbidden, notFound } = require('../../shared/errors');
const { serializeRentalRequest } = require('../../shared/serializers');

const requestInclude = (currentUserId) => ({
  property: {
    include: {
      owner: true,
      images: true,
      favorites: currentUserId
        ? {
            where: {
              userId: currentUserId,
            },
          }
        : false,
      _count: {
        select: {
          rentalRequests: true,
        },
      },
    },
  },
  tenant: true,
  landlord: true,
});

const getRequestOrThrow = async (id, currentUserId) => {
  const request = await prisma.rentalRequest.findUnique({
    where: { id },
    include: requestInclude(currentUserId),
  });

  if (!request) {
    throw notFound('La solicitud no existe');
  }

  return request;
};

const createRequest = async (req, res) => {
  const property = await prisma.property.findUnique({
    where: { id: req.body.propertyId },
  });

  if (!property || property.status !== PropertyStatus.PUBLISHED) {
    throw notFound('La propiedad no esta disponible');
  }

  if (property.ownerId === req.user.id) {
    throw badRequest('No puedes solicitar tu propia propiedad');
  }

  const existingRequest = await prisma.rentalRequest.findFirst({
    where: {
      propertyId: property.id,
      tenantId: req.user.id,
      status: {
        in: [RequestStatus.PENDING, RequestStatus.APPROVED],
      },
    },
  });

  if (existingRequest) {
    throw badRequest('Ya tienes una solicitud activa para esta propiedad');
  }

  const request = await prisma.rentalRequest.create({
    data: {
      propertyId: property.id,
      tenantId: req.user.id,
      landlordId: property.ownerId,
      desiredMoveIn: req.body.desiredMoveIn,
      leaseMonths: req.body.leaseMonths,
      occupants: req.body.occupants,
      monthlyIncome: req.body.monthlyIncome || null,
      hasPets: req.body.hasPets,
      phone: req.body.phone,
      message: req.body.message,
    },
    include: requestInclude(req.user.id),
  });

  res.status(201).json({
    success: true,
    message: 'Solicitud enviada',
    data: serializeRentalRequest(request, req.user.id),
  });
};

const getMyRequests = async (req, res) => {
  const requests = await prisma.rentalRequest.findMany({
    where: {
      tenantId: req.user.id,
    },
    include: requestInclude(req.user.id),
    orderBy: [{ createdAt: 'desc' }],
  });

  res.json({
    success: true,
    data: requests.map((request) => serializeRentalRequest(request, req.user.id)),
  });
};

const getReceivedRequests = async (req, res) => {
  const requests = await prisma.rentalRequest.findMany({
    where: {
      landlordId: req.user.id,
    },
    include: requestInclude(req.user.id),
    orderBy: [{ createdAt: 'desc' }],
  });

  res.json({
    success: true,
    data: requests.map((request) => serializeRentalRequest(request, req.user.id)),
  });
};

const getRequestById = async (req, res) => {
  const request = await getRequestOrThrow(req.params.id, req.user.id);

  if (request.tenantId !== req.user.id && request.landlordId !== req.user.id) {
    throw forbidden();
  }

  res.json({
    success: true,
    data: serializeRentalRequest(request, req.user.id),
  });
};

const updateRequest = async (req, res) => {
  const request = await getRequestOrThrow(req.params.id, req.user.id);

  if (request.tenantId !== req.user.id) {
    throw forbidden();
  }

  if (request.status !== RequestStatus.PENDING) {
    throw badRequest('Solo puedes editar solicitudes pendientes');
  }

  const updated = await prisma.rentalRequest.update({
    where: { id: req.params.id },
    data: req.body,
    include: requestInclude(req.user.id),
  });

  res.json({
    success: true,
    message: 'Solicitud actualizada',
    data: serializeRentalRequest(updated, req.user.id),
  });
};

const reviewRequest = async (req, res) => {
  const request = await getRequestOrThrow(req.params.id, req.user.id);

  if (request.landlordId !== req.user.id) {
    throw forbidden();
  }

  const updated = await prisma.rentalRequest.update({
    where: { id: req.params.id },
    data: { status: req.body.status },
    include: requestInclude(req.user.id),
  });

  res.json({
    success: true,
    message: 'Estado actualizado',
    data: serializeRentalRequest(updated, req.user.id),
  });
};

const deleteRequest = async (req, res) => {
  const request = await prisma.rentalRequest.findUnique({
    where: { id: req.params.id },
  });

  if (!request) {
    throw notFound('La solicitud no existe');
  }

  if (request.tenantId !== req.user.id) {
    throw forbidden();
  }

  if (request.status === RequestStatus.APPROVED) {
    throw badRequest('No puedes eliminar una solicitud aprobada');
  }

  await prisma.rentalRequest.delete({
    where: { id: req.params.id },
  });

  res.json({
    success: true,
    message: 'Solicitud eliminada',
  });
};

module.exports = {
  createRequest,
  deleteRequest,
  getMyRequests,
  getReceivedRequests,
  getRequestById,
  reviewRequest,
  updateRequest,
};
