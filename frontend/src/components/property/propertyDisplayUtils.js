import { formatCurrency, formatDate, getPropertyTypeLabel } from '../../lib/formatters';

export const isPresent = (value) => {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'number') return Number.isFinite(value);
  return value !== null && value !== undefined && String(value).trim() !== '';
};

export const safeText = (value, fallback = '') => {
  if (!isPresent(value)) return fallback;

  const text = String(value).trim();
  return text && text !== '[object Object]' ? text : fallback;
};

export const formatBoolean = (value, yes = 'Si', no = 'No') => (value ? yes : no);

export const splitListText = (value) =>
  safeText(value)
    .split(/[,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);

export const getApproximateAddress = (property) => {
  if (property.hideExactAddress) {
    return property.zoneReference || property.neighborhood || property.city || 'Se comparte durante el proceso';
  }

  return property.addressLine || property.zoneReference || property.neighborhood || 'Se comparte durante el proceso';
};

export const getLocationParts = (property) =>
  [property.neighborhood, property.city, property.department].filter(Boolean);

export const getLocationLabel = (property) => getLocationParts(property).join(', ') || 'Colombia';

export const getMonthlyTotal = (property) =>
  Number(property.monthlyRent || 0) + Number(property.maintenanceFee || 0);

export const getPropertyType = (property) =>
  getPropertyTypeLabel(property.propertyType) || property.tipo || 'Vivienda';

export const getAvailabilityLabel = (property) =>
  property.availableImmediately
    ? 'Inmediata'
    : formatDate(property.availableFrom) || property.disponibilidad || 'Por confirmar';

export const getCurrency = (value) => (isPresent(value) ? formatCurrency(value) : 'No registrado');

export const getUniqueList = (items) => [...new Set(items.filter(Boolean).map((item) => String(item).trim()))];
