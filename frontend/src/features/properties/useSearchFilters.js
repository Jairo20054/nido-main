import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const DEFAULT_FILTERS = {
  city: '',
  propertyTypes: [],
  minRent: 0,
  maxRent: 9000000,
  bedrooms: 0,
  bathrooms: 0,
  extras: [],
  sort: 'recommended',
  radius: 2,
};

const EXTRA_KEYS = [
  'furnished',
  'petsAllowed',
  'parking',
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

const uniqueExtras = (value) =>
  [...new Set((value || []).filter((item) => EXTRA_KEYS.includes(item)))];

const uniquePropertyTypes = (value) =>
  [...new Set((value || []).map((item) => item.toLowerCase()).filter((item) => PROPERTY_TYPE_KEYS.includes(item)))];

export const readSearchFilters = (searchParams) => {
  const extras = searchParams.get('extras')?.split(',').filter(Boolean) || [];
  const propertyTypes =
    searchParams.get('tipos')?.split(',').filter(Boolean) ||
    [searchParams.get('tipo') || searchParams.get('propertyType')].filter(Boolean);

  return {
    city: searchParams.get('ciudad') || searchParams.get('city') || DEFAULT_FILTERS.city,
    propertyTypes: uniquePropertyTypes(propertyTypes),
    minRent: parseNumber(
      searchParams.get('min') || searchParams.get('minRent'),
      DEFAULT_FILTERS.minRent
    ),
    maxRent: parseNumber(
      searchParams.get('max') || searchParams.get('maxRent'),
      DEFAULT_FILTERS.maxRent
    ),
    bedrooms: parseNumber(
      searchParams.get('hab') || searchParams.get('bedrooms'),
      DEFAULT_FILTERS.bedrooms
    ),
    bathrooms: parseNumber(
      searchParams.get('banos') || searchParams.get('bathrooms'),
      DEFAULT_FILTERS.bathrooms
    ),
    extras: uniqueExtras(extras),
    sort: searchParams.get('orden') || searchParams.get('sort') || DEFAULT_FILTERS.sort,
    radius: parseNumber(searchParams.get('radio') || searchParams.get('radius'), DEFAULT_FILTERS.radius),
  };
};

const serializeFilters = (filters) => {
  const params = new URLSearchParams();

  if (filters.city) {
    params.set('ciudad', filters.city);
  }

  if (filters.propertyTypes.length === 1) {
    params.set('tipo', filters.propertyTypes[0]);
  } else if (filters.propertyTypes.length > 1) {
    params.set('tipos', filters.propertyTypes.join(','));
  }

  if (filters.minRent !== DEFAULT_FILTERS.minRent) {
    params.set('min', String(filters.minRent));
  }

  if (filters.maxRent !== DEFAULT_FILTERS.maxRent) {
    params.set('max', String(filters.maxRent));
  }

  if (filters.bedrooms !== DEFAULT_FILTERS.bedrooms) {
    params.set('hab', String(filters.bedrooms));
  }

  if (filters.bathrooms !== DEFAULT_FILTERS.bathrooms) {
    params.set('banos', String(filters.bathrooms));
  }

  if (filters.extras.length) {
    params.set('extras', filters.extras.join(','));
  }

  if (filters.sort !== DEFAULT_FILTERS.sort) {
    params.set('orden', filters.sort);
  }

  if (filters.radius !== DEFAULT_FILTERS.radius) {
    params.set('radio', String(filters.radius));
  }

  return params;
};

const areFiltersEqual = (left, right) => JSON.stringify(left) === JSON.stringify(right);

export function useSearchFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => readSearchFilters(searchParams));
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  useEffect(() => {
    const nextFilters = readSearchFilters(searchParams);
    setFilters((current) => (areFiltersEqual(current, nextFilters) ? current : nextFilters));
  }, [searchParams]);

  useEffect(() => {
    const nextParams = serializeFilters(filters).toString();
    const currentParams = searchParams.toString();

    if (nextParams !== currentParams) {
      setSearchParams(serializeFilters(filters), { replace: true });
    }
  }, [filters, searchParams, setSearchParams]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedFilters(filters);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [filters]);

  const setFilter = (field, value) => {
    setFilters((current) => {
      if (field === 'minRent' || field === 'maxRent') {
        const nextValue = Number(value);
        return { ...current, [field]: Number.isFinite(nextValue) ? nextValue : current[field] };
      }

      if (field === 'radius' || field === 'bedrooms' || field === 'bathrooms') {
        const nextValue = Number(value);
        return { ...current, [field]: Number.isFinite(nextValue) ? nextValue : current[field] };
      }

      return { ...current, [field]: value };
    });
  };

  const togglePropertyType = (propertyType) => {
    setFilters((current) => ({
      ...current,
      propertyTypes: current.propertyTypes.includes(propertyType)
        ? current.propertyTypes.filter((item) => item !== propertyType)
        : [...current.propertyTypes, propertyType],
    }));
  };

  const toggleExtra = (extra) => {
    setFilters((current) => ({
      ...current,
      extras: current.extras.includes(extra)
        ? current.extras.filter((item) => item !== extra)
        : [...current.extras, extra],
    }));
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const activeCount = useMemo(() => {
    let count = 0;

    if (filters.city) count += 1;
    if (filters.propertyTypes.length) count += filters.propertyTypes.length;
    if (filters.minRent !== DEFAULT_FILTERS.minRent || filters.maxRent !== DEFAULT_FILTERS.maxRent) {
      count += 1;
    }
    if (filters.bedrooms !== DEFAULT_FILTERS.bedrooms) count += 1;
    if (filters.bathrooms !== DEFAULT_FILTERS.bathrooms) count += 1;
    if (filters.sort !== DEFAULT_FILTERS.sort) count += 1;
    if (filters.radius !== DEFAULT_FILTERS.radius) count += 1;

    return count + filters.extras.length;
  }, [filters]);

  return {
    filters,
    debouncedFilters,
    setFilter,
    togglePropertyType,
    toggleExtra,
    clearFilters,
    activeCount,
    defaultFilters: DEFAULT_FILTERS,
  };
}
