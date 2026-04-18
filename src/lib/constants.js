export const TOKEN_STORAGE_KEY = 'nido_access_token';

export const PROPERTY_TYPE_OPTIONS = [
  { value: 'APARTMENT', label: 'Apartamento' },
  { value: 'HOUSE', label: 'Casa' },
  { value: 'STUDIO', label: 'Estudio' },
  { value: 'LOFT', label: 'Loft' },
  { value: 'PENTHOUSE', label: 'Penthouse' },
  { value: 'ROOM', label: 'Habitacion' },
];

export const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recomendados' },
  { value: 'latest', label: 'Mas recientes' },
  { value: 'rent-asc', label: 'Canon mas bajo' },
  { value: 'rent-desc', label: 'Canon mas alto' },
];

export const REQUEST_STATUS_LABELS = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
  WITHDRAWN: 'Retirada',
};
