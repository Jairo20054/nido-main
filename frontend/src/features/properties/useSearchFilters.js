import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  areSearchFiltersEqual,
  countActiveSearchFilters,
  DEFAULT_SEARCH_FILTERS,
  readSearchFilters,
  serializeSearchFilters,
} from './searchFilterParams';

export function useSearchFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => readSearchFilters(searchParams));
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  useEffect(() => {
    const nextFilters = readSearchFilters(searchParams);
    setFilters((current) => (areSearchFiltersEqual(current, nextFilters) ? current : nextFilters));
  }, [searchParams]);

  useEffect(() => {
    const nextParams = serializeSearchFilters(filters).toString();
    const currentParams = searchParams.toString();

    if (nextParams !== currentParams) {
      setSearchParams(serializeSearchFilters(filters), { replace: true });
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
      if (
        ['minRent', 'maxRent', 'bedrooms', 'bathrooms', 'minArea', 'maxArea'].includes(field)
      ) {
        const nextValue = Number(value);
        return { ...current, [field]: Number.isFinite(nextValue) ? nextValue : current[field] };
      }

      if (field === 'parking' || field === 'strata') {
        return { ...current, [field]: value === '' ? '' : String(value) };
      }

      if (field === 'location') {
        return {
          ...current,
          location: value,
          city: '',
          department: '',
          neighborhood: '',
        };
      }

      return { ...current, [field]: value };
    });
  };

  const patchFilters = (patch) => {
    setFilters((current) => ({
      ...current,
      ...patch,
      ...(Object.prototype.hasOwnProperty.call(patch, 'location')
        ? { city: '', department: '', neighborhood: '' }
        : {}),
    }));
  };

  const replaceFilters = (nextFilters) => {
    setFilters({ ...DEFAULT_SEARCH_FILTERS, ...nextFilters });
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
    setFilters(DEFAULT_SEARCH_FILTERS);
  };

  const activeCount = useMemo(() => countActiveSearchFilters(filters), [filters]);

  return {
    filters,
    debouncedFilters,
    setFilter,
    patchFilters,
    replaceFilters,
    togglePropertyType,
    toggleExtra,
    clearFilters,
    activeCount,
    defaultFilters: DEFAULT_SEARCH_FILTERS,
  };
}
