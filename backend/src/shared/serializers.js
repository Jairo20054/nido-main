const value = (object, camelKey, snakeKey, fallback = null) =>
  object?.[camelKey] ?? object?.[snakeKey] ?? fallback;

const fullName = (user) =>
  `${value(user, 'firstName', 'first_name', '')} ${value(user, 'lastName', 'last_name', '')}`.trim();

const serializeUser = (user, includePrivate = false) => {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    firstName: value(user, 'firstName', 'first_name', ''),
    lastName: value(user, 'lastName', 'last_name', ''),
    fullName: fullName(user),
    email: includePrivate ? value(user, 'email', 'email') : undefined,
    phone: includePrivate ? value(user, 'phone', 'phone') : undefined,
    bio: value(user, 'bio', 'bio'),
    avatarUrl: value(user, 'avatarUrl', 'avatar_url'),
    role: value(user, 'role', 'primary_role', 'tenant'),
    locale: value(user, 'locale', 'locale', 'es-CO'),
    countryCode: value(user, 'countryCode', 'country_code', 'CO'),
    timezone: value(user, 'timezone', 'timezone', 'America/Bogota'),
    status: value(user, 'status', 'status', 'active'),
    createdAt: value(user, 'createdAt', 'created_at'),
    updatedAt: value(user, 'updatedAt', 'updated_at'),
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
    propertyType: value(property, 'propertyType', 'property_type'),
    status: property.status,
    city: property.city,
    neighborhood: property.neighborhood,
    addressLine: value(property, 'addressLine', 'address_line'),
    monthlyRent: Number(value(property, 'monthlyRent', 'monthly_rent', 0)),
    maintenanceFee: Number(value(property, 'maintenanceFee', 'maintenance_fee', 0)),
    securityDeposit: Number(value(property, 'securityDeposit', 'deposit_amount', 0)),
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    areaM2: value(property, 'areaM2', 'area_m2', 0),
    parkingSpots: value(property, 'parkingSpots', 'parking_spots', 0),
    maxOccupants: value(property, 'maxOccupants', 'max_occupants', 0),
    furnished: property.furnished,
    petsAllowed: value(property, 'petsAllowed', 'pets_allowed', false),
    availableFrom: value(property, 'availableFrom', 'available_from'),
    minLeaseMonths: value(property, 'minLeaseMonths', 'min_lease_months', 6),
    amenities: value(property, 'amenities', 'amenities', []),
    coverImage: value(property, 'coverImage', 'cover_image_url') || images[0]?.url || null,
    images,
    latitude:
      value(property, 'latitude', 'latitude') === null || value(property, 'latitude', 'latitude') === undefined
        ? null
        : Number(value(property, 'latitude', 'latitude')),
    longitude:
      value(property, 'longitude', 'longitude') === null || value(property, 'longitude', 'longitude') === undefined
        ? null
        : Number(value(property, 'longitude', 'longitude')),
    createdAt: value(property, 'createdAt', 'created_at'),
    updatedAt: value(property, 'updatedAt', 'updated_at'),
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
  desiredMoveIn: value(request, 'desiredMoveIn', 'desired_move_in'),
  leaseMonths: value(request, 'leaseMonths', 'lease_months'),
  occupants: request.occupants,
  monthlyIncome: value(request, 'monthlyIncome', 'monthly_income'),
  hasPets: value(request, 'hasPets', 'has_pets', false),
  phone: request.phone,
  message: request.message,
  createdAt: value(request, 'createdAt', 'created_at'),
  updatedAt: value(request, 'updatedAt', 'updated_at'),
  property: serializeProperty(request.property, currentUserId),
  tenant: serializeUser(request.tenant, currentUserId === request.tenantId),
  landlord: serializeUser(request.landlord, currentUserId === request.landlordId),
});

module.exports = {
  serializeProperty,
  serializeRentalRequest,
  serializeUser,
};
