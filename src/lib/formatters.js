import { PROPERTY_TYPE_OPTIONS, REQUEST_STATUS_LABELS } from './constants';

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

export const formatCurrency = (value) => currencyFormatter.format(value || 0);
export const formatDate = (value) => (value ? dateFormatter.format(new Date(value)) : '');

export const getPropertyTypeLabel = (value) =>
  PROPERTY_TYPE_OPTIONS.find((option) => option.value === value)?.label || value;

export const getRequestStatusLabel = (value) => REQUEST_STATUS_LABELS[value] || value;

export const getRequestStatusTone = (value) => {
  if (value === 'APPROVED') return 'success';
  if (value === 'REJECTED') return 'danger';
  if (value === 'WITHDRAWN') return 'muted';
  return 'warning';
};
