const FALLBACK_IMAGES = {
  APARTMENT: '/images/properties/apartment-a.svg',
  HOUSE: '/images/properties/house-a.svg',
  STUDIO: '/images/properties/studio-a.svg',
  LOFT: '/images/properties/loft-a.svg',
  PENTHOUSE: '/images/properties/apartment-b.svg',
  ROOM: '/images/properties/room-a.svg',
};

export const getFallbackPropertyImage = (propertyType) =>
  FALLBACK_IMAGES[propertyType] || FALLBACK_IMAGES.APARTMENT;

export const getPropertyPrimaryImage = (property) =>
  property?.coverImage ||
  property?.images?.[0]?.url ||
  property?.media?.find((item) => item.type === 'IMAGE')?.url ||
  getFallbackPropertyImage(property?.propertyType);

export const getPropertyLocationLabel = (property) => {
  if (!property) {
    return '';
  }

  return [property.neighborhood, property.city, property.department].filter(Boolean).join(', ') || 'Colombia';
};

export const getPropertyTrustLabel = (property) => {
  if (property?.status === 'PUBLISHED' || property?.verificationDetails) {
    return 'Verificada';
  }

  if (property?.availableImmediately) {
    return 'Lista para mudarte';
  }

  return 'Publicación activa';
};

export const getPropertyReputationLabel = (property) => {
  if ((property?.requestCount || 0) >= 3) {
    return 'Alta demanda';
  }

  if ((property?.requestCount || 0) > 0) {
    return 'Con interés';
  }

  if (property?.furnished || property?.utilitiesIncluded) {
    return 'Buena propuesta';
  }

  return 'Nueva en Nido';
};
