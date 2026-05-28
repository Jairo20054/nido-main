const FALLBACK_IMAGES = {
  APARTMENT: '/images/properties/apartment-a.svg',
  HOUSE: '/images/properties/house-a.svg',
  STUDIO: '/images/properties/studio-a.svg',
  LOFT: '/images/properties/loft-a.svg',
  PENTHOUSE: '/images/properties/apartment-b.svg',
  ROOM: '/images/properties/room-a.svg',
};

export const getFallbackPropertyImage = (propertyType) => {
  const normalizedType = typeof propertyType === 'string' ? propertyType.toUpperCase() : propertyType;

  return FALLBACK_IMAGES[normalizedType] || FALLBACK_IMAGES.APARTMENT;
};

const getImageUrl = (item) => {
  if (!item) return '';
  if (typeof item === 'string') return item;
  return item.url || item.src || '';
};

export const getPropertyImageUrls = (property) => {
  const imageUrls = [
    property?.coverImage,
    ...(property?.images || []).map(getImageUrl),
    ...(property?.media || [])
      .filter((item) => !item.type || item.type === 'IMAGE')
      .map(getImageUrl),
  ].filter(Boolean);

  return [...new Set(imageUrls)];
};

export const getPropertyPrimaryImage = (property) =>
  getPropertyImageUrls(property)[0] || getFallbackPropertyImage(property?.propertyType);

export const getPropertyLocationLabel = (property) => {
  if (!property) {
    return '';
  }

  return [property.neighborhood, property.city, property.department].filter(Boolean).join(', ') || 'Colombia';
};

export const getPropertyTrustLabel = (property) => {
  if (property?.status === 'PUBLISHED' || property?.verificationDetails || property?.owner?.verified) {
    return 'Verificada';
  }

  if (property?.availableImmediately) {
    return 'Lista para mudarte';
  }

  return 'Publicacion activa';
};

export const getPropertyReputationLabel = (property) => {
  if ((property?.requestCount || 0) >= 3) {
    return 'Alta demanda';
  }

  if ((property?.requestCount || 0) > 0) {
    return 'Con interes';
  }

  if (property?.furnished || property?.utilitiesIncluded) {
    return 'Buena propuesta';
  }

  return 'Nueva en NIDO';
};
