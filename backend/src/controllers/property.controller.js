const prisma = require('../lib/prisma');
const HttpError = require('../utils/http-error');
const slugify = require('../utils/slugify');

const sanitizeStringArray = (values = []) =>
  [...new Set((Array.isArray(values) ? values : []).map((value) => String(value).trim()).filter(Boolean))];

const propertyInclude = {
  owner: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      city: true
    }
  },
  _count: {
    select: {
      favorites: true,
      rentalRequests: true
    }
  }
};

const normalizePropertyPayload = (payload) => {
  const gallery = sanitizeStringArray(payload.gallery || []);
  const amenities = sanitizeStringArray(payload.amenities || []);
  const coverImage = payload.coverImage || gallery[0];
  const mergedGallery = sanitizeStringArray([coverImage, ...gallery]);

  return {
    title: payload.title,
    description: payload.description,
    propertyType: payload.propertyType,
    status: payload.status || 'ACTIVE',
    city: payload.city,
    neighborhood: payload.neighborhood,
    address: payload.address,
    monthlyRent: payload.monthlyRent,
    adminFee: payload.adminFee ?? 0,
    deposit: payload.deposit ?? 0,
    areaM2: payload.areaM2,
    bedrooms: payload.bedrooms,
    bathrooms: payload.bathrooms,
    parkingSpots: payload.parkingSpots ?? 0,
    furnished: payload.furnished ?? false,
    petFriendly: payload.petFriendly ?? false,
    utilitiesIncluded: payload.utilitiesIncluded ?? false,
    featured: payload.featured ?? false,
    availableFrom: new Date(payload.availableFrom),
    leaseTermMonths: payload.leaseTermMonths ?? 12,
    coverImage,
    gallery: mergedGallery,
    amenities
  };
};

const buildSort = (sort) => {
  switch (sort) {
    case 'rent-asc':
      return { monthlyRent: 'asc' };
    case 'rent-desc':
      return { monthlyRent: 'desc' };
    case 'size-desc':
      return { areaM2: 'desc' };
    default:
      return { createdAt: 'desc' };
  }
};

const buildQueryWhere = (query, enforceActive = true) => {
  const filters = [];

  if (enforceActive) {
    filters.push({ status: 'ACTIVE' });
  } else if (query.status) {
    filters.push({ status: query.status });
  }

  if (query.search) {
    filters.push({
      OR: [
        { title: { contains: query.search } },
        { city: { contains: query.search } },
        { neighborhood: { contains: query.search } },
        { description: { contains: query.search } }
      ]
    });
  }

  if (query.city) {
    filters.push({ city: { contains: query.city } });
  }

  if (query.neighborhood) {
    filters.push({ neighborhood: { contains: query.neighborhood } });
  }

  if (query.propertyType) {
    filters.push({ propertyType: query.propertyType });
  }

  if (typeof query.minRent === 'number' || typeof query.maxRent === 'number') {
    filters.push({
      monthlyRent: {
        gte: query.minRent,
        lte: query.maxRent
      }
    });
  }

  if (typeof query.bedrooms === 'number') {
    filters.push({ bedrooms: { gte: query.bedrooms } });
  }

  if (typeof query.bathrooms === 'number') {
    filters.push({ bathrooms: { gte: query.bathrooms } });
  }

  if (typeof query.furnished === 'boolean') {
    filters.push({ furnished: query.furnished });
  }

  if (typeof query.petFriendly === 'boolean') {
    filters.push({ petFriendly: query.petFriendly });
  }

  if (typeof query.featured === 'boolean') {
    filters.push({ featured: query.featured });
  }

  return filters.length ? { AND: filters } : {};
};

const ensureUniqueSlug = async (title, city, propertyId) => {
  const baseSlug = slugify(`${title}-${city}`);
  const similar = await prisma.property.findMany({
    where: {
      slug: {
        startsWith: baseSlug
      }
    },
    select: {
      id: true,
      slug: true
    }
  });

  const taken = similar.filter((item) => item.id !== propertyId).map((item) => item.slug);

  if (!taken.includes(baseSlug)) {
    return baseSlug;
  }

  return `${baseSlug}-${taken.length + 1}`;
};

const listProperties = async (req, res, next) => {
  try {
    const { page, limit, sort } = req.query;
    const skip = (page - 1) * limit;
    const where = buildQueryWhere(req.query, true);

    const [items, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: buildSort(sort),
        include: propertyInclude
      }),
      prisma.property.count({ where })
    ]);

    res.json({
      data: items,
      meta: {
        total,
        page,
        limit,
        pages: Math.max(1, Math.ceil(total / limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

const getPropertyById = async (req, res, next) => {
  try {
    const property = await prisma.property.findFirst({
      where: {
        OR: [{ id: req.params.id }, { slug: req.params.id }],
        status: 'ACTIVE'
      },
      include: {
        ...propertyInclude,
        rentalRequests: {
          where: {
            status: {
              in: ['PENDING', 'CONTACTED', 'APPROVED']
            }
          },
          select: {
            id: true,
            status: true,
            moveInDate: true,
            leaseMonths: true,
            createdAt: true
          }
        }
      }
    });

    if (!property) {
      throw new HttpError(404, 'No encontramos esa propiedad.');
    }

    res.json({
      data: property
    });
  } catch (error) {
    next(error);
  }
};

const listMyProperties = async (req, res, next) => {
  try {
    const where = {
      ownerId: req.user.id,
      ...buildQueryWhere(req.query, false)
    };

    const items = await prisma.property.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: propertyInclude
    });

    res.json({
      data: items
    });
  } catch (error) {
    next(error);
  }
};

const createProperty = async (req, res, next) => {
  try {
    const data = normalizePropertyPayload(req.body);
    const slug = await ensureUniqueSlug(data.title, data.city);

    const property = await prisma.property.create({
      data: {
        ...data,
        slug,
        ownerId: req.user.id
      },
      include: propertyInclude
    });

    res.status(201).json({
      data: property
    });
  } catch (error) {
    next(error);
  }
};

const updateProperty = async (req, res, next) => {
  try {
    const existing = await prisma.property.findUnique({
      where: { id: req.params.id }
    });

    if (!existing) {
      throw new HttpError(404, 'La propiedad no existe.');
    }

    if (existing.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      throw new HttpError(403, 'No puedes modificar esta propiedad.');
    }

    const nextPayload = normalizePropertyPayload({
      ...existing,
      ...req.body
    });

    const slug =
      req.body.title || req.body.city
        ? await ensureUniqueSlug(nextPayload.title, nextPayload.city, existing.id)
        : existing.slug;

    const property = await prisma.property.update({
      where: { id: existing.id },
      data: {
        ...nextPayload,
        slug
      },
      include: propertyInclude
    });

    res.json({
      data: property
    });
  } catch (error) {
    next(error);
  }
};

const deleteProperty = async (req, res, next) => {
  try {
    const existing = await prisma.property.findUnique({
      where: { id: req.params.id }
    });

    if (!existing) {
      throw new HttpError(404, 'La propiedad no existe.');
    }

    if (existing.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      throw new HttpError(403, 'No puedes eliminar esta propiedad.');
    }

    await prisma.property.delete({
      where: { id: existing.id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listProperties,
  getPropertyById,
  listMyProperties,
  createProperty,
  updateProperty,
  deleteProperty
};
