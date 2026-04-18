const { PropertyStatus } = require('@prisma/client');
const { prisma } = require('../../shared/prisma');
const { badRequest, forbidden, notFound } = require('../../shared/errors');
const { slugify } = require('../../shared/slugify');
const { serializeProperty } = require('../../shared/serializers');

const propertyInclude = (currentUserId) => ({
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
});

const buildWhere = (query) => {
  const where = {
    status: PropertyStatus.PUBLISHED,
  };

  if (query.q) {
    where.OR = [
      { title: { contains: query.q, mode: 'insensitive' } },
      { summary: { contains: query.q, mode: 'insensitive' } },
      { neighborhood: { contains: query.q, mode: 'insensitive' } },
      { city: { contains: query.q, mode: 'insensitive' } },
    ];
  }

  if (query.city) {
    where.city = {
      contains: query.city,
      mode: 'insensitive',
    };
  }

  if (query.propertyType) {
    where.propertyType = query.propertyType;
  }

  if (query.minRent || query.maxRent) {
    where.monthlyRent = {};
    if (query.minRent) {
      where.monthlyRent.gte = query.minRent;
    }
    if (query.maxRent) {
      where.monthlyRent.lte = query.maxRent;
    }
  }

  if (query.bedrooms !== undefined) {
    where.bedrooms = { gte: query.bedrooms };
  }

  if (query.bathrooms !== undefined) {
    where.bathrooms = { gte: query.bathrooms };
  }

  if (query.furnished !== undefined) {
    where.furnished = query.furnished;
  }

  if (query.petsAllowed !== undefined) {
    where.petsAllowed = query.petsAllowed;
  }

  if (query.minLeaseMonths) {
    where.minLeaseMonths = { lte: query.minLeaseMonths };
  }

  if (query.availableFrom) {
    where.availableFrom = { lte: query.availableFrom };
  }

  return where;
};

const buildOrderBy = (sort) => {
  switch (sort) {
    case 'rent-asc':
      return [{ monthlyRent: 'asc' }, { createdAt: 'desc' }];
    case 'rent-desc':
      return [{ monthlyRent: 'desc' }, { createdAt: 'desc' }];
    case 'latest':
      return [{ createdAt: 'desc' }];
    default:
      return [{ createdAt: 'desc' }];
  }
};

const normalizePropertyInput = (payload) => ({
  ...payload,
  neighborhood: payload.neighborhood || null,
  coverImage: payload.images?.[0] || null,
  latitude: payload.latitude ?? null,
  longitude: payload.longitude ?? null,
});

const generateSlug = async (title, city, propertyId = '') => {
  const base = slugify(`${title}-${city}`);
  const shortId = propertyId ? propertyId.slice(-6) : Date.now().toString(36);
  return `${base}-${shortId}`;
};

const listProperties = async (req, res) => {
  const { page, limit, sort, ...filters } = req.query;
  const skip = (page - 1) * limit;
  const currentUserId = req.user?.id || null;

  const where = buildWhere(filters);
  const [items, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: propertyInclude(currentUserId),
      orderBy: buildOrderBy(sort),
      skip,
      take: limit,
    }),
    prisma.property.count({ where }),
  ]);

  res.json({
    success: true,
    data: items.map((property) => serializeProperty(property, currentUserId)),
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
};

const getFeaturedProperties = async (req, res) => {
  const currentUserId = req.user?.id || null;
  const items = await prisma.property.findMany({
    where: {
      status: PropertyStatus.PUBLISHED,
    },
    include: propertyInclude(currentUserId),
    orderBy: [{ createdAt: 'desc' }],
    take: 4,
  });

  res.json({
    success: true,
    data: items.map((property) => serializeProperty(property, currentUserId)),
  });
};

const getMyProperties = async (req, res) => {
  const items = await prisma.property.findMany({
    where: {
      ownerId: req.user.id,
    },
    include: propertyInclude(req.user.id),
    orderBy: [{ updatedAt: 'desc' }],
  });

  res.json({
    success: true,
    data: items.map((property) => serializeProperty(property, req.user.id)),
  });
};

const getPropertyById = async (req, res) => {
  const property = await prisma.property.findUnique({
    where: { id: req.params.id },
    include: propertyInclude(req.user?.id || null),
  });

  if (!property) {
    throw notFound('La propiedad no existe');
  }

  const isOwner = req.user?.id === property.ownerId;

  if (!isOwner && property.status !== PropertyStatus.PUBLISHED) {
    throw notFound('La propiedad no esta disponible');
  }

  res.json({
    success: true,
    data: serializeProperty(property, req.user?.id || null),
  });
};

const createProperty = async (req, res) => {
  const payload = normalizePropertyInput(req.body);
  const slug = await generateSlug(payload.title, payload.city);

  const property = await prisma.property.create({
    data: {
      slug,
      ownerId: req.user.id,
      title: payload.title,
      summary: payload.summary,
      description: payload.description,
      propertyType: payload.propertyType,
      status: payload.status,
      city: payload.city,
      neighborhood: payload.neighborhood,
      addressLine: payload.addressLine,
      monthlyRent: payload.monthlyRent,
      maintenanceFee: payload.maintenanceFee,
      securityDeposit: payload.securityDeposit,
      bedrooms: payload.bedrooms,
      bathrooms: payload.bathrooms,
      areaM2: payload.areaM2,
      parkingSpots: payload.parkingSpots,
      maxOccupants: payload.maxOccupants,
      furnished: payload.furnished,
      petsAllowed: payload.petsAllowed,
      availableFrom: payload.availableFrom,
      minLeaseMonths: payload.minLeaseMonths,
      amenities: payload.amenities,
      coverImage: payload.coverImage,
      latitude: payload.latitude,
      longitude: payload.longitude,
      images: {
        create: (payload.images || []).map((url, index) => ({
          url,
          position: index,
          alt: payload.title,
        })),
      },
    },
    include: propertyInclude(req.user.id),
  });

  if (req.user.role === 'TENANT') {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { role: 'LANDLORD' },
    });
  }

  res.status(201).json({
    success: true,
    message: 'Propiedad creada',
    data: serializeProperty(property, req.user.id),
  });
};

const updateProperty = async (req, res) => {
  const existing = await prisma.property.findUnique({
    where: { id: req.params.id },
  });

  if (!existing) {
    throw notFound('La propiedad no existe');
  }

  if (existing.ownerId !== req.user.id) {
    throw forbidden();
  }

  const payload = normalizePropertyInput({
    ...existing,
    ...req.body,
    images: req.body.images || null,
  });

  const imageMutation = req.body.images
    ? {
        deleteMany: {},
        create: req.body.images.map((url, index) => ({
          url,
          position: index,
          alt: payload.title,
        })),
      }
    : undefined;

  const property = await prisma.property.update({
    where: { id: req.params.id },
    data: {
      title: payload.title,
      summary: payload.summary,
      description: payload.description,
      propertyType: payload.propertyType,
      status: payload.status,
      city: payload.city,
      neighborhood: payload.neighborhood,
      addressLine: payload.addressLine,
      monthlyRent: payload.monthlyRent,
      maintenanceFee: payload.maintenanceFee,
      securityDeposit: payload.securityDeposit,
      bedrooms: payload.bedrooms,
      bathrooms: payload.bathrooms,
      areaM2: payload.areaM2,
      parkingSpots: payload.parkingSpots,
      maxOccupants: payload.maxOccupants,
      furnished: payload.furnished,
      petsAllowed: payload.petsAllowed,
      availableFrom: payload.availableFrom,
      minLeaseMonths: payload.minLeaseMonths,
      amenities: payload.amenities,
      coverImage: req.body.images ? req.body.images[0] || null : existing.coverImage,
      latitude: payload.latitude,
      longitude: payload.longitude,
      images: imageMutation,
    },
    include: propertyInclude(req.user.id),
  });

  res.json({
    success: true,
    message: 'Propiedad actualizada',
    data: serializeProperty(property, req.user.id),
  });
};

const deleteProperty = async (req, res) => {
  const property = await prisma.property.findUnique({
    where: { id: req.params.id },
  });

  if (!property) {
    throw notFound('La propiedad no existe');
  }

  if (property.ownerId !== req.user.id) {
    throw forbidden();
  }

  const activeRequests = await prisma.rentalRequest.count({
    where: {
      propertyId: property.id,
      status: {
        in: ['PENDING', 'APPROVED'],
      },
    },
  });

  if (activeRequests > 0) {
    throw badRequest('No puedes eliminar una propiedad con solicitudes activas');
  }

  await prisma.property.delete({
    where: { id: req.params.id },
  });

  res.json({
    success: true,
    message: 'Propiedad eliminada',
  });
};

module.exports = {
  createProperty,
  deleteProperty,
  getFeaturedProperties,
  getMyProperties,
  getPropertyById,
  listProperties,
  updateProperty,
};
