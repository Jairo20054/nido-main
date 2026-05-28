const toFiniteNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const getLocationFilterText = (activeFilters = {}) =>
  activeFilters.city || activeFilters.location || activeFilters.neighborhood || '';

const hasValue = (value) => normalizeLocationText(value).length > 0;

const sameLocation = (left, right) => {
  const normalizedLeft = normalizeLocationText(left);
  const normalizedRight = normalizeLocationText(right);

  return Boolean(normalizedLeft && normalizedRight && normalizedLeft === normalizedRight);
};

const containsLocation = (left, right) => {
  const normalizedLeft = normalizeLocationText(left);
  const normalizedRight = normalizeLocationText(right);

  return Boolean(
    normalizedLeft &&
      normalizedRight &&
      (normalizedLeft.includes(normalizedRight) || normalizedRight.includes(normalizedLeft))
  );
};

const getRecencyScore = (property) => {
  const date = new Date(property.publishedAt || property.createdAt || property.updatedAt || 0);

  if (!Number.isFinite(date.getTime())) {
    return 0;
  }

  const ageInDays = (Date.now() - date.getTime()) / 86400000;

  if (ageInDays <= 14) return 5;
  if (ageInDays <= 45) return 3;
  return 0;
};

export function normalizeLocationText(value = '') {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const fromLat = toFiniteNumber(lat1);
  const fromLon = toFiniteNumber(lon1);
  const toLat = toFiniteNumber(lat2);
  const toLon = toFiniteNumber(lon2);

  if ([fromLat, fromLon, toLat, toLon].some((value) => value === null)) {
    return null;
  }

  const earthRadiusKm = 6371;
  const degreesToRadians = (degrees) => (degrees * Math.PI) / 180;
  const deltaLat = degreesToRadians(toLat - fromLat);
  const deltaLon = degreesToRadians(toLon - fromLon);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(degreesToRadians(fromLat)) *
      Math.cos(degreesToRadians(toLat)) *
      Math.sin(deltaLon / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calculateLocationScore(property, userLocation = {}, activeFilters = {}) {
  let score = 0;
  const manualLocation = getLocationFilterText(activeFilters);
  const preferredNeighborhood = manualLocation || userLocation.neighborhood;
  const preferredCity = manualLocation || userLocation.city;
  const preferredDepartment = userLocation.department;

  if (preferredNeighborhood) {
    if (sameLocation(property.neighborhood, preferredNeighborhood)) score += 50;
    else if (containsLocation(property.neighborhood, preferredNeighborhood)) score += 38;
    else if (containsLocation(property.zoneReference, preferredNeighborhood)) score += 22;
    else if (containsLocation(property.addressLine, preferredNeighborhood)) score += 16;
  }

  if (preferredCity) {
    if (sameLocation(property.city, preferredCity)) score += 35;
    else if (containsLocation(property.city, preferredCity)) score += 24;
  }

  if (preferredDepartment) {
    if (sameLocation(property.department, preferredDepartment)) score += 20;
    else if (containsLocation(property.department, preferredDepartment)) score += 12;
  }

  const distanceKm = calculateDistanceKm(
    userLocation.latitude,
    userLocation.longitude,
    property.latitude,
    property.longitude
  );

  if (distanceKm !== null) {
    if (distanceKm < 3) score += 30;
    else if (distanceKm <= 10) score += 15;
    else if (distanceKm <= 25) score += 6;
  }

  if (property.verificationDetails || property.status === 'PUBLISHED') score += 10;
  if (property.availableImmediately || property.status === 'PUBLISHED') score += 10;
  if (property.featured || property.isFeatured || property.requestCount >= 3) score += 8;

  if (activeFilters.propertyType || activeFilters.propertyTypes?.length) score += 5;
  if (activeFilters.extras?.length) score += Math.min(10, activeFilters.extras.length * 2);
  if (hasValue(manualLocation)) score += 5;

  return score + getRecencyScore(property);
}

export function sortPropertiesByLocationRelevance(properties, userLocation = {}, activeFilters = {}) {
  return [...(properties || [])]
    .map((property) => ({
      ...property,
      locationScore: calculateLocationScore(property, userLocation, activeFilters),
    }))
    .sort((left, right) => {
      if (right.locationScore !== left.locationScore) {
        return right.locationScore - left.locationScore;
      }

      return (
        new Date(right.publishedAt || right.createdAt || 0) -
        new Date(left.publishedAt || left.createdAt || 0)
      );
    });
}
