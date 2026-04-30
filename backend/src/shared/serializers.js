// Helpers de serializacion para exponer una API consistente aunque Prisma y Supabase
// usen distintos estilos de nombres de campos.
const pick = (user, camelKey, snakeKey = null) => {
  if (!user) {
    return undefined;
  }

  if (user[camelKey] !== undefined) {
    return user[camelKey];
  }

  if (snakeKey && user[snakeKey] !== undefined) {
    return user[snakeKey];
  }

  return undefined;
};

const fullName = (user) => `${pick(user, 'firstName', 'first_name') || ''} ${pick(user, 'lastName', 'last_name') || ''}`.trim();

// Serializa usuarios controlando si se deben incluir campos privados.
const serializeUser = (user, includePrivate = false) => {
  if (!user) {
    return null;
  }

  return {
    id: pick(user, 'id'),
    firstName: pick(user, 'firstName', 'first_name'),
    lastName: pick(user, 'lastName', 'last_name'),
    fullName: fullName(user),
    email: includePrivate ? pick(user, 'email') : undefined,
    phone: includePrivate ? pick(user, 'phone') : undefined,
    bio: pick(user, 'bio'),
    avatarUrl: pick(user, 'avatarUrl', 'avatar_url'),
    role: pick(user, 'role'),
    countryCode: pick(user, 'countryCode', 'country_code'),
    locale: pick(user, 'locale'),
    timezone: pick(user, 'timezone'),
    isPlatformAdmin: pick(user, 'isPlatformAdmin'),
    createdAt: pick(user, 'createdAt', 'created_at'),
    updatedAt: pick(user, 'updatedAt', 'updated_at'),
  };
};

const sortByPosition = (items = []) => items.slice().sort((a, b) => a.position - b.position);

// Normaliza medios, historial y banderas derivadas para consumo directo del frontend.
const serializePropertyMedia = (media = []) =>
  sortByPosition(media).map((item) => ({
    id: item.id,
    type: item.type,
    url: item.url,
    alt: item.alt,
    position: item.position,
    mimeType: item.mimeType,
    sizeBytes: item.sizeBytes,
  }));

const serializeApprovalHistory = (entries = []) =>
  entries.map((entry) => ({
    id: entry.id,
    fromStatus: entry.fromStatus,
    toStatus: entry.toStatus,
    note: entry.note,
    createdAt: entry.createdAt,
    actor: serializeUser(entry.actor, false),
  }));

const serializeProperty = (property, currentUserId = null) => {
  if (!property) {
    return null;
  }

  const media = serializePropertyMedia(property.media || []);
  const images = media.filter((item) => item.type === 'IMAGE');
  const video = media.find((item) => item.type === 'VIDEO') || null;

  return {
    id: property.id,
    slug: property.slug,
    title: property.title,
    summary: property.summary,
    description: property.description,
    propertyType: property.propertyType,
    rentalType: property.rentalType,
    status: property.status,
    city: property.city,
    neighborhood: property.neighborhood,
    addressLine: property.addressLine,
    zoneReference: property.zoneReference,
    monthlyRent: property.monthlyRent,
    maintenanceFee: property.maintenanceFee,
    securityDeposit: property.securityDeposit,
    availableImmediately: property.availableImmediately,
    availableFrom: property.availableFrom,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    areaM2: property.areaM2,
    floor: property.floor,
    parkingSpots: property.parkingSpots,
    strata: property.strata,
    maxOccupants: property.maxOccupants,
    furnished: property.furnished,
    petsAllowed: property.petsAllowed,
    utilitiesIncluded: property.utilitiesIncluded,
    minLeaseMonths: property.minLeaseMonths,
    amenities: property.amenities,
    rules: property.rules,
    requirements: property.requirements,
    idealTenantProfile: property.idealTenantProfile,
    specialConditions: property.specialConditions,
    contactMethod: property.contactMethod,
    verificationDetails: property.verificationDetails,
    rejectionReason: property.rejectionReason,
    coverImage: property.coverImage || images[0]?.url || null,
    images,
    video,
    media,
    latitude:
      property.latitude === null || property.latitude === undefined
        ? null
        : Number(property.latitude),
    longitude:
      property.longitude === null || property.longitude === undefined
        ? null
        : Number(property.longitude),
    approvedAt: property.approvedAt,
    publishedAt: property.publishedAt,
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
    owner: serializeUser(property.owner, false),
    isFavorite:
      currentUserId && property.favorites
        ? property.favorites.some((favorite) => favorite.userId === currentUserId)
        : false,
    requestCount: property._count?.rentalRequests ?? property.rentalRequests?.length ?? 0,
    approvalHistory: serializeApprovalHistory(property.approvalHistory || []),
  };
};

// Serializa solicitudes incluyendo propiedad y actores relacionados.
const serializeRentalRequest = (request, currentUserId = null) => ({
  id: request.id,
  status: request.status,
  desiredMoveIn: request.desiredMoveIn,
  leaseMonths: request.leaseMonths,
  occupants: request.occupants,
  monthlyIncome: request.monthlyIncome,
  hasPets: request.hasPets,
  phone: request.phone,
  message: request.message,
  createdAt: request.createdAt,
  updatedAt: request.updatedAt,
  property: serializeProperty(request.property, currentUserId),
  tenant: serializeUser(request.tenant, currentUserId === request.tenantId),
  landlord: serializeUser(request.landlord, currentUserId === request.landlordId),
});

module.exports = {
  serializeProperty,
  serializePropertyMedia,
  serializeRentalRequest,
  serializeUser,
};
