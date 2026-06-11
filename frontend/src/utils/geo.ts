export const isValidLatitude = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= -90 && number <= 90;
};

export const isValidLongitude = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= -180 && number <= 180;
};

export const hasValidCoordinates = (latitude?: unknown, longitude?: unknown) =>
  isValidLatitude(latitude) && isValidLongitude(longitude);

export const formatDistance = (meters?: number | null) => {
  const value = Number(meters);

  if (!Number.isFinite(value)) return '';
  if (value < 1000) return `${Math.round(value)} m`;

  return `${(value / 1000).toFixed(value < 10000 ? 1 : 0)} km`;
};
