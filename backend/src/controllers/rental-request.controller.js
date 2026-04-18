const prisma = require('../lib/prisma');
const HttpError = require('../utils/http-error');

const requestInclude = {
  property: {
    select: {
      id: true,
      slug: true,
      title: true,
      city: true,
      neighborhood: true,
      monthlyRent: true,
      coverImage: true,
      ownerId: true
    }
  },
  applicant: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      city: true,
      role: true
    }
  }
};

const getScopedWhere = async (user) => {
  if (user.role === 'ADMIN') {
    return {};
  }

  if (user.role === 'HOST') {
    const properties = await prisma.property.findMany({
      where: { ownerId: user.id },
      select: { id: true }
    });

    return {
      propertyId: {
        in: properties.map((property) => property.id)
      }
    };
  }

  return { applicantId: user.id };
};

const listRentalRequests = async (req, res, next) => {
  try {
    const scope = await getScopedWhere(req.user);
    const where = {
      ...scope,
      ...(req.query.status ? { status: req.query.status } : {})
    };

    const items = await prisma.rentalRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: requestInclude
    });

    res.json({
      data: items
    });
  } catch (error) {
    next(error);
  }
};

const getRentalRequestById = async (req, res, next) => {
  try {
    const rentalRequest = await prisma.rentalRequest.findUnique({
      where: { id: req.params.id },
      include: requestInclude
    });

    if (!rentalRequest) {
      throw new HttpError(404, 'La solicitud no existe.');
    }

    const isApplicant = rentalRequest.applicantId === req.user.id;
    const isHost = rentalRequest.property.ownerId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isApplicant && !isHost && !isAdmin) {
      throw new HttpError(403, 'No puedes ver esta solicitud.');
    }

    res.json({
      data: rentalRequest
    });
  } catch (error) {
    next(error);
  }
};

const createRentalRequest = async (req, res, next) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.body.propertyId }
    });

    if (!property || property.status !== 'ACTIVE') {
      throw new HttpError(404, 'La propiedad ya no esta disponible.');
    }

    if (property.ownerId === req.user.id) {
      throw new HttpError(400, 'No puedes postularte a una propiedad propia.');
    }

    const existingActiveRequest = await prisma.rentalRequest.findFirst({
      where: {
        propertyId: req.body.propertyId,
        applicantId: req.user.id,
        status: {
          in: ['PENDING', 'CONTACTED']
        }
      }
    });

    if (existingActiveRequest) {
      throw new HttpError(409, 'Ya tienes una solicitud activa para esta propiedad.');
    }

    const rentalRequest = await prisma.rentalRequest.create({
      data: {
        propertyId: req.body.propertyId,
        applicantId: req.user.id,
        applicantName: req.user.name,
        applicantEmail: req.body.applicantEmail || req.user.email,
        applicantPhone: req.body.applicantPhone || req.user.phone || '',
        moveInDate: new Date(req.body.moveInDate),
        leaseMonths: req.body.leaseMonths,
        householdSize: req.body.householdSize,
        monthlyIncome: req.body.monthlyIncome ?? null,
        message: req.body.message
      },
      include: requestInclude
    });

    res.status(201).json({
      data: rentalRequest
    });
  } catch (error) {
    next(error);
  }
};

const updateRentalRequest = async (req, res, next) => {
  try {
    const rentalRequest = await prisma.rentalRequest.findUnique({
      where: { id: req.params.id },
      include: requestInclude
    });

    if (!rentalRequest) {
      throw new HttpError(404, 'La solicitud no existe.');
    }

    const isApplicant = rentalRequest.applicantId === req.user.id;
    const isHost = rentalRequest.property.ownerId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isApplicant && !isHost && !isAdmin) {
      throw new HttpError(403, 'No puedes editar esta solicitud.');
    }

    const nextData = {};

    if (isApplicant) {
      if (rentalRequest.status !== 'PENDING') {
        throw new HttpError(400, 'Solo puedes editar solicitudes pendientes.');
      }

      ['moveInDate', 'leaseMonths', 'householdSize', 'monthlyIncome', 'message', 'applicantPhone', 'applicantEmail'].forEach((field) => {
        if (req.body[field] !== undefined) {
          nextData[field] = req.body[field];
        }
      });

      if (nextData.moveInDate) {
        nextData.moveInDate = new Date(nextData.moveInDate);
      }
    }

    if ((isHost || isAdmin) && req.body.status) {
      nextData.status = req.body.status;
    }

    if (!Object.keys(nextData).length) {
      throw new HttpError(400, 'No hay cambios aplicables para esta solicitud.');
    }

    const updated = await prisma.rentalRequest.update({
      where: { id: req.params.id },
      data: nextData,
      include: requestInclude
    });

    res.json({
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

const deleteRentalRequest = async (req, res, next) => {
  try {
    const rentalRequest = await prisma.rentalRequest.findUnique({
      where: { id: req.params.id },
      include: requestInclude
    });

    if (!rentalRequest) {
      throw new HttpError(404, 'La solicitud no existe.');
    }

    const isApplicant = rentalRequest.applicantId === req.user.id;
    const isHost = rentalRequest.property.ownerId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isApplicant && !isHost && !isAdmin) {
      throw new HttpError(403, 'No puedes eliminar esta solicitud.');
    }

    if (isApplicant && rentalRequest.status === 'APPROVED') {
      throw new HttpError(400, 'No puedes retirar una solicitud ya aprobada.');
    }

    if (isApplicant) {
      await prisma.rentalRequest.update({
        where: { id: req.params.id },
        data: { status: 'WITHDRAWN' }
      });
    } else {
      await prisma.rentalRequest.delete({
        where: { id: req.params.id }
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listRentalRequests,
  getRentalRequestById,
  createRentalRequest,
  updateRentalRequest,
  deleteRentalRequest
};
