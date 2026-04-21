import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const DEFAULT_FILTERS = {
  city: '',
  propertyType: '',
  minRent: 1800000,
  maxRent: 4500000,
  bedrooms: 1,
  bathrooms: 1,
  extras: [],
  sort: 'recommended',
};

const EXTRA_KEYS = ['furnished', 'petsAllowed', 'parking', 'security', 'gatedCommunity'];

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const uniqueExtras = (value) =>
  [...new Set((value || []).filter((item) => EXTRA_KEYS.includes(item)))];

export const readSearchFilters = (searchParams) => {
  const extras = searchParams.get('extras')?.split(',').filter(Boolean) || [];

  return {
    city: searchParams.get('ciudad') || searchParams.get('city') || DEFAULT_FILTERS.city,
    propertyType:
      searchParams.get('tipo') || searchParams.get('propertyType') || DEFAULT_FILTERS.propertyType,
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
  };
};

const serializeFilters = (filters) => {
  const params = new URLSearchParams();

  if (filters.city) {
    params.set('ciudad', filters.city);
  }

  if (filters.propertyType) {
    params.set('tipo', filters.propertyType.toLowerCase());
  }

  params.set('min', String(filters.minRent));
  params.set('max', String(filters.maxRent));
  params.set('hab', String(filters.bedrooms));
  params.set('banos', String(filters.bathrooms));

  if (filters.extras.length) {
    params.set('extras', filters.extras.join(','));
  }

  if (filters.sort !== DEFAULT_FILTERS.sort) {
    params.set('orden', filters.sort);
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

      return { ...current, [field]: value };
    });
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
    if (filters.propertyType) count += 1;
    if (filters.minRent !== DEFAULT_FILTERS.minRent || filters.maxRent !== DEFAULT_FILTERS.maxRent) {
      count += 1;
    }
    if (filters.bedrooms !== DEFAULT_FILTERS.bedrooms) count += 1;
    if (filters.bathrooms !== DEFAULT_FILTERS.bathrooms) count += 1;
    if (filters.sort !== DEFAULT_FILTERS.sort) count += 1;

    return count + filters.extras.length;
  }, [filters]);

  return {
    filters,
    debouncedFilters,
    setFilter,
    toggleExtra,
    clearFilters,
    activeCount,
    defaultFilters: DEFAULT_FILTERS,
  };
}
