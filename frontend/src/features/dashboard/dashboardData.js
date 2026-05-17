export const mockProperties = [
  {
    id: 'mock-cedritos-apt',
    title: 'Apartamento luminoso en Cedritos',
    summary: 'Dos habitaciones, estudio independiente y zonas comunes tranquilas.',
    city: 'Bogotá',
    neighborhood: 'Cedritos',
    monthlyRent: 2350000,
    maintenanceFee: 240000,
    propertyType: 'APARTMENT',
    bedrooms: 2,
    bathrooms: 2,
    areaM2: 68,
    furnished: false,
    petsAllowed: true,
    parkingSpots: 1,
    utilitiesIncluded: false,
    availableImmediately: true,
    status: 'PUBLISHED',
    isFavorite: true,
    requestCount: 4,
  },
  {
    id: 'mock-laureles-loft',
    title: 'Loft amoblado cerca a Laureles',
    summary: 'Ideal para profesionales, con balcon y conexion rapida.',
    city: 'Medellín',
    neighborhood: 'Laureles',
    monthlyRent: 1980000,
    maintenanceFee: 180000,
    propertyType: 'LOFT',
    bedrooms: 1,
    bathrooms: 1,
    areaM2: 44,
    furnished: true,
    petsAllowed: false,
    parkingSpots: 0,
    utilitiesIncluded: true,
    availableImmediately: false,
    availableFrom: '2026-06-01',
    status: 'PUBLISHED',
    isFavorite: true,
    requestCount: 2,
  },
  {
    id: 'mock-teusaquillo-studio',
    title: 'Estudio moderno en Teusaquillo',
    summary: 'Compacto, bien ubicado y con porteria 24 horas.',
    city: 'Bogotá',
    neighborhood: 'Teusaquillo',
    monthlyRent: 1650000,
    maintenanceFee: 120000,
    propertyType: 'STUDIO',
    bedrooms: 1,
    bathrooms: 1,
    areaM2: 36,
    furnished: true,
    petsAllowed: true,
    parkingSpots: 0,
    utilitiesIncluded: false,
    availableImmediately: true,
    status: 'PUBLISHED',
    isFavorite: true,
    requestCount: 1,
  },
];

export const mockTenantRequests = [
  {
    id: 'request-1',
    status: 'PENDING',
    desiredMoveIn: '2026-06-10',
    leaseMonths: 12,
    property: mockProperties[0],
  },
  {
    id: 'request-2',
    status: 'APPROVED',
    desiredMoveIn: '2026-06-01',
    leaseMonths: 10,
    property: mockProperties[1],
  },
];

export const mockLandlordProperties = [
  {
    ...mockProperties[0],
    id: 'owner-property-1',
    status: 'PUBLISHED',
    views: 284,
    conversion: '12%',
  },
  {
    ...mockProperties[2],
    id: 'owner-property-2',
    title: 'Estudio para estrenar en Chapinero',
    neighborhood: 'Chapinero',
    status: 'PENDING',
    views: 96,
    conversion: '8%',
  },
];

export const mockReceivedRequests = [
  {
    id: 'received-1',
    status: 'PENDING',
    message: 'Busca mudarse en junio y ya tiene documentos listos.',
    desiredMoveIn: '2026-06-08',
    leaseMonths: 12,
    property: mockLandlordProperties[0],
    tenant: { fullName: 'Laura Mendez' },
  },
  {
    id: 'received-2',
    status: 'APPROVED',
    message: 'Perfil aprobado para visita esta semana.',
    desiredMoveIn: '2026-06-15',
    leaseMonths: 12,
    property: mockLandlordProperties[1],
    tenant: { fullName: 'Mateo Rojas' },
  },
];

export const mockAdminStats = {
  totals: {
    properties: 128,
    requests: 342,
    favorites: 910,
    users: 1240,
  },
  propertiesByStatus: [
    { status: 'PUBLISHED', total: 86 },
    { status: 'PENDING', total: 18 },
    { status: 'RENTED', total: 14 },
    { status: 'REJECTED', total: 10 },
  ],
};

export const mockLandlords = [
  { id: 'landlord-1', fullName: 'Camila Torres', email: 'camila@nido.co', role: 'LANDLORD', propertyCount: 12 },
  { id: 'landlord-2', fullName: 'Daniel Perez', email: 'daniel@nido.co', role: 'LANDLORD', propertyCount: 8 },
  { id: 'landlord-3', fullName: 'Habitar SAS', email: 'operaciones@habitar.co', role: 'LANDLORD', propertyCount: 21 },
];

export const isRecoverableDashboardError = (error) =>
  !error?.status || error.status >= 500 || error.status === 404;
