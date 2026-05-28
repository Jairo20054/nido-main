import {
  PROPERTY_STATUS_LABELS,
  PROPERTY_TYPE_OPTIONS,
  RENTAL_TYPE_OPTIONS,
  REQUEST_STATUS_LABELS,
  USER_ROLE_LABELS,
} from './constants';

// Formateadores compartidos para mantener la misma representacion de fechas, dinero
// y etiquetas de negocio en toda la interfaz.
const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export const formatCurrency = (value) => {
  const number = Number(value);

  if (value === null || value === undefined || Number.isNaN(number)) {
    return 'Precio no disponible';
  }

  return currencyFormatter.format(number);
};
export const formatDate = (value) => (value ? dateFormatter.format(new Date(value)) : '');

export const getPropertyTypeLabel = (value) => {
  const normalizedValue = typeof value === 'string' ? value.toUpperCase() : value;

  return PROPERTY_TYPE_OPTIONS.find((option) => option.value === normalizedValue)?.label || value;
};

export const getRentalTypeLabel = (value) =>
  RENTAL_TYPE_OPTIONS.find((option) => option.value === value)?.label || value;

export const getRequestStatusLabel = (value) => REQUEST_STATUS_LABELS[value] || value;
export const getPropertyStatusLabel = (value) => PROPERTY_STATUS_LABELS[value] || value;
export const getRoleLabel = (value) => USER_ROLE_LABELS[value] || value;

// Traduce estados a tonos visuales para badges y mensajes de UI.
export const getRequestStatusTone = (value) => {
  if (value === 'APPROVED') return 'success';
  if (value === 'REJECTED') return 'danger';
  if (value === 'WITHDRAWN') return 'muted';
  return 'warning';
};

export const getPropertyStatusTone = (value) => {
  if (value === 'PUBLISHED' || value === 'APPROVED') return 'success';
  if (value === 'REJECTED') return 'danger';
  if (value === 'PENDING') return 'warning';
  return 'muted';
};
