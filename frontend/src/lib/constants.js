// Catalogos y constantes reutilizables para mantener consistente la UI y la traduccion
// de enums compartidos entre frontend y backend.
export const PROPERTY_DRAFT_STORAGE_KEY = 'nido_property_draft';

export const USER_ROLE_LABELS = {
  ADMIN: 'Administrador',
  LANDLORD: 'Arrendador',
  TENANT: 'Arrendatario',
};

export const PROPERTY_TYPE_OPTIONS = [
  { value: 'APARTMENT', label: 'Apartamento' },
  { value: 'HOUSE', label: 'Casa' },
  { value: 'STUDIO', label: 'Estudio' },
  { value: 'LOFT', label: 'Loft' },
  { value: 'PENTHOUSE', label: 'Penthouse' },
  { value: 'ROOM', label: 'Habitacion' },
];

export const RENTAL_TYPE_OPTIONS = [
  { value: 'FULL_HOME', label: 'Vivienda completa' },
  { value: 'ROOM_ONLY', label: 'Habitacion' },
  { value: 'SHARED_HOME', label: 'Vivienda compartida' },
];

export const PROPERTY_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'APPROVED', label: 'Aprobada' },
  { value: 'REJECTED', label: 'Rechazada' },
  { value: 'PUBLISHED', label: 'Publicada' },
  { value: 'RENTED', label: 'Arrendada' },
  { value: 'ARCHIVED', label: 'Archivada' },
];

export const PUBLIC_PROPERTY_STATUS_OPTIONS = PROPERTY_STATUS_OPTIONS.filter((item) =>
  ['PUBLISHED', 'RENTED'].includes(item.value)
);

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

export const PROPERTY_STATUS_LABELS = Object.fromEntries(
  PROPERTY_STATUS_OPTIONS.map((item) => [item.value, item.label])
);
