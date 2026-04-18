const fullName = (user) => `${user.firstName} ${user.lastName}`.trim();

const serializeUser = (user, includePrivate = false) => {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: fullName(user),
    email: includePrivate ? user.email : undefined,
    phone: includePrivate ? user.phone : undefined,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const serializeProperty = (property, currentUserId = null) => {
  if (!property) {
    return null;
  }

  const images = (property.images || [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.alt,
      position: image.position,
    }));

  return {
    id: property.id,
    slug: property.slug,
    title: property.title,
    summary: property.summary,
    description: property.description,
    propertyType: property.propertyType,
    status: property.status,
    city: property.city,
    neighborhood: property.neighborhood,
    addressLine: property.addressLine,
    monthlyRent: property.monthlyRent,
    maintenanceFee: property.maintenanceFee,
    securityDeposit: property.securityDeposit,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    areaM2: property.areaM2,
    parkingSpots: property.parkingSpots,
    maxOccupants: property.maxOccupants,
    furnished: property.furnished,
    petsAllowed: property.petsAllowed,
    availableFrom: property.availableFrom,
    minLeaseMonths: property.minLeaseMonths,
    amenities: property.amenities,
    coverImage: property.coverImage || images[0]?.url || null,
    images,
    latitude:
      property.latitude === null || property.latitude === undefined
        ? null
        : Number(property.latitude),
    longitude:
      property.longitude === null || property.longitude === undefined
        ? null
        : Number(property.longitude),
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
    owner: serializeUser(property.owner, false),
    isFavorite:
      currentUserId && property.favorites
        ? property.favorites.some((favorite) => favorite.userId === currentUserId)
        : false,
    requestCount:
      property._count?.rentalRequests ??
      property.rentalRequests?.length ??
      0,
  };
};

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
  serializeRentalRequest,
  serializeUser,
};
