const PRICE_FILTER_MAX = 1000000000;

export const DEFAULT_SEARCH_FILTERS = {
  location: '',
  city: '',
  department: '',
  neighborhood: '',
  propertyTypes: [],
  minRent: 0,
  maxRent: PRICE_FILTER_MAX,
  bedrooms: 0,
  bedroomsExact: false,
  bathrooms: 0,
  bathroomsExact: false,
  parking: '',
  extras: [],
  minArea: 0,
  maxArea: 0,
  strata: '',
  administrationIncluded: false,
  availableFrom: '',
  sort: 'recommended',
};

export const PRICE_FILTER_LIMIT = PRICE_FILTER_MAX;

export const SEARCH_EXTRA_KEYS = [
  'furnished',
  'petsAllowed',
  'elevator',
  'balcony',
  'gym',
  'security',
  'gatedCommunity',
];

const PROPERTY_TYPE_KEYS = ['apartment', 'house', 'studio', 'room', 'loft', 'penthouse'];

const parseNumber = (value, fallback) => {
  if (value === null || value === undefined || value === '') return fallback;

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const parseBoolean = (value, fallback = false) => {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'boolean') return value;

  const normalized = String(value).trim().toLowerCase();
  if (['true', '1', 'yes', 'si'].includes(normalized)) return true;
  if (['false', '0', 'no'].includes(normalized)) return false;

  return fallback;
};

const normalizeList = (value) =>
  [...new Set((value || []).map((item) => String(item).trim()).filter(Boolean))];

const normalizeExtras = (value) =>
  normalizeList(value).filter((item) => SEARCH_EXTRA_KEYS.includes(item));

const normalizePropertyTypes = (value) =>
  normalizeList(value)
    .map((item) => item.toLowerCase())
    .filter((item) => PROPERTY_TYPE_KEYS.includes(item));

const firstParam = (searchParams, keys) => {
  const key = keys.find((item) => {
    const value = searchParams.get(item);
    return value !== null && value !== '';
  });

  return key ? searchParams.get(key) : '';
};

export const readSearchFilters = (searchParams) => {
  const propertyTypes =
    firstParam(searchParams, ['propertyTypes', 'tipos'])
      ?.split(',')
      .filter(Boolean) ||
    [firstParam(searchParams, ['propertyType', 'tipo'])].filter(Boolean);
  const extras = firstParam(searchParams, ['extras'])?.split(',').filter(Boolean) || [];
  const location = firstParam(searchParams, ['location', 'q', 'ubicacion']);
  const city = firstParam(searchParams, ['city', 'ciudad']);
  const department = firstParam(searchParams, ['department', 'departamento']);
  const neighborhood = firstParam(searchParams, ['neighborhood', 'barrio']);

  return {
    location: location || city || department || neighborhood || DEFAULT_SEARCH_FILTERS.location,
    city: city || DEFAULT_SEARCH_FILTERS.city,
    department: department || DEFAULT_SEARCH_FILTERS.department,
    neighborhood: neighborhood || DEFAULT_SEARCH_FILTERS.neighborhood,
    propertyTypes: normalizePropertyTypes(propertyTypes),
    minRent: parseNumber(
      firstParam(searchParams, ['minRent', 'minPrice', 'min']),
      DEFAULT_SEARCH_FILTERS.minRent
    ),
    maxRent: parseNumber(
      firstParam(searchParams, ['maxRent', 'maxPrice', 'priceMax', 'max']),
      DEFAULT_SEARCH_FILTERS.maxRent
    ),
    bedrooms: parseNumber(
      firstParam(searchParams, ['bedrooms', 'rooms', 'habitaciones', 'hab']),
      DEFAULT_SEARCH_FILTERS.bedrooms
    ),
    bedroomsExact: parseBoolean(
      firstParam(searchParams, ['bedroomsExact', 'habitacionesExactas']),
      DEFAULT_SEARCH_FILTERS.bedroomsExact
    ),
    bathrooms: parseNumber(
      firstParam(searchParams, ['bathrooms', 'banos']),
      DEFAULT_SEARCH_FILTERS.bathrooms
    ),
    bathroomsExact: parseBoolean(
      firstParam(searchParams, ['bathroomsExact', 'banosExactos']),
      DEFAULT_SEARCH_FILTERS.bathroomsExact
    ),
    parking:
      firstParam(searchParams, ['parking', 'parkingSpots']) || DEFAULT_SEARCH_FILTERS.parking,
    extras: normalizeExtras(extras),
    minArea: parseNumber(
      firstParam(searchParams, ['minArea', 'areaMin']),
      DEFAULT_SEARCH_FILTERS.minArea
    ),
    maxArea: parseNumber(
      firstParam(searchParams, ['maxArea', 'areaMax']),
      DEFAULT_SEARCH_FILTERS.maxArea
    ),
    strata:
      firstParam(searchParams, ['strata', 'estrato']) || DEFAULT_SEARCH_FILTERS.strata,
    administrationIncluded: parseBoolean(
      firstParam(searchParams, ['administrationIncluded', 'administracionIncluida']),
      DEFAULT_SEARCH_FILTERS.administrationIncluded
    ),
    availableFrom:
      firstParam(searchParams, ['availableFrom', 'disponible']) ||
      DEFAULT_SEARCH_FILTERS.availableFrom,
    sort: firstParam(searchParams, ['sort', 'orden']) || DEFAULT_SEARCH_FILTERS.sort,
  };
};

export const serializeSearchFilters = (filters) => {
  const params = new URLSearchParams();

  if (filters.location) params.set('location', filters.location);
  if (filters.city) params.set('city', filters.city);
  if (filters.department) params.set('department', filters.department);
  if (filters.neighborhood) params.set('neighborhood', filters.neighborhood);

  if (filters.propertyTypes.length === 1) {
    params.set('propertyType', filters.propertyTypes[0]);
  } else if (filters.propertyTypes.length > 1) {
    params.set('propertyTypes', filters.propertyTypes.join(','));
  }

  if (filters.minRent !== DEFAULT_SEARCH_FILTERS.minRent) {
    params.set('minRent', String(filters.minRent));
  }

  if (filters.maxRent !== DEFAULT_SEARCH_FILTERS.maxRent) {
    params.set('maxRent', String(filters.maxRent));
  }

  if (filters.bedrooms !== DEFAULT_SEARCH_FILTERS.bedrooms) {
    params.set('bedrooms', String(filters.bedrooms));
  }

  if (filters.bedroomsExact) {
    params.set('bedroomsExact', 'true');
  }

  if (filters.bathrooms !== DEFAULT_SEARCH_FILTERS.bathrooms) {
    params.set('bathrooms', String(filters.bathrooms));
  }

  if (filters.bathroomsExact) {
    params.set('bathroomsExact', 'true');
  }

  if (filters.parking !== DEFAULT_SEARCH_FILTERS.parking) {
    params.set('parking', String(filters.parking));
  }

  if (filters.extras.length) {
    params.set('extras', filters.extras.join(','));
  }

  if (filters.minArea !== DEFAULT_SEARCH_FILTERS.minArea) {
    params.set('minArea', String(filters.minArea));
  }

  if (filters.maxArea !== DEFAULT_SEARCH_FILTERS.maxArea) {
    params.set('maxArea', String(filters.maxArea));
  }

  if (filters.strata) {
    params.set('strata', String(filters.strata));
  }

  if (filters.administrationIncluded) {
    params.set('administrationIncluded', 'true');
  }

  if (filters.availableFrom) {
    params.set('availableFrom', filters.availableFrom);
  }

  if (filters.sort !== DEFAULT_SEARCH_FILTERS.sort) {
    params.set('sort', filters.sort);
  }

  return params;
};

export const buildPropertySearchQuery = (filters, options = {}) => {
  const parkingValue =
    filters.parking === '' || filters.parking === null || filters.parking === undefined
      ? undefined
      : Number(filters.parking);

  return {
    q: filters.location || undefined,
    city: filters.city || undefined,
    department: filters.department || undefined,
    neighborhood: filters.neighborhood || undefined,
    propertyTypes: filters.propertyTypes.length ? filters.propertyTypes.join(',') : undefined,
    minRent: filters.minRent || undefined,
    maxRent:
      filters.maxRent !== DEFAULT_SEARCH_FILTERS.maxRent ? filters.maxRent : undefined,
    bedrooms: filters.bedrooms || undefined,
    bedroomsExact: filters.bedrooms ? filters.bedroomsExact : undefined,
    bathrooms: filters.bathrooms || undefined,
    bathroomsExact: filters.bathrooms ? filters.bathroomsExact : undefined,
    parking: Number.isFinite(parkingValue) ? parkingValue : undefined,
    areaMin: filters.minArea || undefined,
    areaMax: filters.maxArea || undefined,
    strata: filters.strata || undefined,
    administrationIncluded: filters.administrationIncluded ? true : undefined,
    availableFrom: filters.availableFrom || undefined,
    sort: filters.sort || DEFAULT_SEARCH_FILTERS.sort,
    limit: options.limit || 24,
    ...SEARCH_EXTRA_KEYS.reduce((query, key) => {
      if (filters.extras.includes(key)) {
        query[key] = true;
      }

      return query;
    }, {}),
  };
};

export const countActiveSearchFilters = (filters) => {
  let count = 0;

  if (filters.location) count += 1;
  if (filters.city) count += 1;
  if (filters.department) count += 1;
  if (filters.neighborhood) count += 1;
  if (filters.propertyTypes.length) count += 1;
  if (
    filters.minRent !== DEFAULT_SEARCH_FILTERS.minRent ||
    filters.maxRent !== DEFAULT_SEARCH_FILTERS.maxRent
  ) {
    count += 1;
  }
  if (filters.bedrooms) count += 1;
  if (filters.bathrooms) count += 1;
  if (filters.parking !== DEFAULT_SEARCH_FILTERS.parking) count += 1;
  if (filters.minArea !== DEFAULT_SEARCH_FILTERS.minArea || filters.maxArea !== DEFAULT_SEARCH_FILTERS.maxArea) {
    count += 1;
  }
  if (filters.strata) count += 1;
  if (filters.administrationIncluded) count += 1;
  if (filters.availableFrom) count += 1;
  if (filters.sort !== DEFAULT_SEARCH_FILTERS.sort) count += 1;

  return count + filters.extras.length;
};

export const areSearchFiltersEqual = (left, right) => JSON.stringify(left) === JSON.stringify(right);
