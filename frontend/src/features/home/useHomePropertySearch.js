import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../app/providers/useAuth';
import { api } from '../../lib/apiClient';

const DEFAULT_FILTERS = {
  location: '',
  minRent: 0,
  maxRent: 9000000,
  propertyType: '',
  rooms: 0,
  bathrooms: 0,
  extras: [],
  sort: 'recommended',
  area: 0,
  availableFrom: '',
};

const BACKEND_SORTS = ['recommended', 'latest', 'rent-asc', 'rent-desc'];
const EXTRA_KEYS = ['furnished', 'petsAllowed', 'parking', 'elevator', 'balcony', 'security'];

const parseNumber = (value, fallback) => {
  if (value === null || value === undefined || value === '') return fallback;

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const normalizeExtras = (extras) =>
  [...new Set((extras || []).filter((extra) => EXTRA_KEYS.includes(extra)))];

const readFiltersFromParams = (searchParams) => ({
  location: searchParams.get('ciudad') || '',
  minRent: parseNumber(searchParams.get('min'), DEFAULT_FILTERS.minRent),
  maxRent: parseNumber(searchParams.get('max'), DEFAULT_FILTERS.maxRent),
  propertyType: searchParams.get('tipo') || '',
  rooms: parseNumber(searchParams.get('hab'), DEFAULT_FILTERS.rooms),
  bathrooms: parseNumber(searchParams.get('banos'), DEFAULT_FILTERS.bathrooms),
  extras: normalizeExtras(searchParams.get('extras')?.split(',').filter(Boolean)),
  sort: searchParams.get('orden') || DEFAULT_FILTERS.sort,
  area: parseNumber(searchParams.get('area'), DEFAULT_FILTERS.area),
  availableFrom: searchParams.get('disponible') || '',
});

const serializeFilters = (filters) => {
  const params = new URLSearchParams();

  if (filters.location) params.set('ciudad', filters.location);
  if (filters.minRent !== DEFAULT_FILTERS.minRent) params.set('min', String(filters.minRent));
  if (filters.maxRent !== DEFAULT_FILTERS.maxRent) params.set('max', String(filters.maxRent));
  if (filters.propertyType) params.set('tipo', filters.propertyType);
  if (filters.rooms !== DEFAULT_FILTERS.rooms) params.set('hab', String(filters.rooms));
  if (filters.bathrooms !== DEFAULT_FILTERS.bathrooms) params.set('banos', String(filters.bathrooms));
  if (filters.extras.length) params.set('extras', filters.extras.join(','));
  if (filters.sort !== DEFAULT_FILTERS.sort) params.set('orden', filters.sort);
  if (filters.area !== DEFAULT_FILTERS.area) params.set('area', String(filters.area));
  if (filters.availableFrom) params.set('disponible', filters.availableFrom);

  return params;
};

const isSameFilters = (left, right) => JSON.stringify(left) === JSON.stringify(right);

const getAmenityText = (property) => (property.amenities || []).join(' ').toLowerCase();

const includesAny = (text, words) => words.some((word) => text.includes(word));

const matchesExtra = (property, extra) => {
  const amenityText = getAmenityText(property);

  if (extra === 'furnished') return Boolean(property.furnished);
  if (extra === 'petsAllowed') return Boolean(property.petsAllowed);
  if (extra === 'parking') return Number(property.parkingSpots || 0) > 0;
  if (extra === 'elevator') return Boolean(property.elevator) || includesAny(amenityText, ['ascensor']);
  if (extra === 'balcony') return Boolean(property.balcony) || includesAny(amenityText, ['balcon', 'balcón']);
  if (extra === 'security') return Boolean(property.security) || includesAny(amenityText, ['vigil', 'seguridad']);

  return true;
};

const sortProperties = (properties, sort) => {
  const sorted = [...properties];

  if (sort === 'rent-asc') return sorted.sort((a, b) => (a.monthlyRent || 0) - (b.monthlyRent || 0));
  if (sort === 'rent-desc') return sorted.sort((a, b) => (b.monthlyRent || 0) - (a.monthlyRent || 0));
  if (sort === 'area-desc') return sorted.sort((a, b) => (b.areaM2 || b.area || 0) - (a.areaM2 || a.area || 0));
  if (sort === 'latest') {
    return sorted.sort((a, b) => new Date(b.publishedAt || b.createdAt || 0) - new Date(a.publishedAt || a.createdAt || 0));
  }

  return sorted;
};

const buildPropertyQuery = (filters) => ({
  q: filters.location || undefined,
  propertyType: filters.propertyType ? filters.propertyType.toUpperCase() : undefined,
  minRent: filters.minRent || undefined,
  maxRent: filters.maxRent !== DEFAULT_FILTERS.maxRent ? filters.maxRent : undefined,
  bedrooms: filters.rooms || undefined,
  bathrooms: filters.bathrooms || undefined,
  furnished: filters.extras.includes('furnished') || undefined,
  petsAllowed: filters.extras.includes('petsAllowed') || undefined,
  sort: BACKEND_SORTS.includes(filters.sort) ? filters.sort : 'recommended',
  limit: 24,
});

const refineProperties = (properties, filters) =>
  properties.filter((property) => {
    if (filters.propertyType && String(property.propertyType || '').toLowerCase() !== filters.propertyType) {
      return false;
    }

    if (filters.area && Number(property.areaM2 || property.area || 0) < filters.area) {
      return false;
    }

    if (filters.availableFrom && !property.availableImmediately) {
      const requestedDate = new Date(filters.availableFrom);
      const propertyDate = new Date(property.availableFrom || '');

      if (!Number.isFinite(propertyDate.getTime()) || propertyDate > requestedDate) {
        return false;
      }
    }

    return filters.extras.every((extra) => matchesExtra(property, extra));
  });

export function useHomePropertySearch() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => readFiltersFromParams(searchParams));
  const [appliedFilters, setAppliedFilters] = useState(() => readFiltersFromParams(searchParams));
  const [results, setResults] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingFavorite, setSavingFavorite] = useState('');

  useEffect(() => {
    const nextFilters = readFiltersFromParams(searchParams);
    setFilters((current) => (isSameFilters(current, nextFilters) ? current : nextFilters));
    setAppliedFilters((current) => (isSameFilters(current, nextFilters) ? current : nextFilters));
  }, [searchParams]);

  const runSearch = useCallback(
    async (nextFilters = filters) => {
      setAppliedFilters(nextFilters);
      setSearchParams(serializeFilters(nextFilters), { replace: true });
      setLoading(true);
      setError('');

      try {
        const response = await api.get('/properties', {
          auth: isAuthenticated,
          query: buildPropertyQuery(nextFilters),
        });
        const refined = refineProperties(response.data || [], nextFilters);
        const sorted = sortProperties(refined, nextFilters.sort);

        setResults(sorted);
        setTotalCount(response.meta?.total || sorted.length);
      } catch (requestError) {
        setResults([]);
        setTotalCount(0);
        setError(requestError.message || 'No pudimos cargar propiedades en este momento.');
      } finally {
        setLoading(false);
      }
    },
    [filters, isAuthenticated, setSearchParams]
  );

  useEffect(() => {
    runSearch(appliedFilters);
  }, [isAuthenticated]);

  const setFilter = (field, value) => {
    setFilters((current) => {
      if (['minRent', 'maxRent', 'rooms', 'bathrooms', 'area'].includes(field)) {
        return { ...current, [field]: parseNumber(value, current[field]) };
      }

      return { ...current, [field]: value };
    });
  };

  const patchFilters = (patch, shouldRunSearch = false) => {
    const nextFilters = { ...filters, ...patch };
    setFilters(nextFilters);

    if (shouldRunSearch) {
      runSearch(nextFilters);
    }
  };

  const toggleExtra = (extra) => {
    setFilters((current) => ({
      ...current,
      extras: current.extras.includes(extra)
        ? current.extras.filter((item) => item !== extra)
        : [...current.extras, extra],
    }));
  };

  const clearFilters = (shouldRunSearch = false) => {
    setFilters(DEFAULT_FILTERS);
    if (shouldRunSearch) {
      runSearch(DEFAULT_FILTERS);
    }
  };

  const toggleFavorite = async (property) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `${location.pathname}${location.search}` } });
      return;
    }

    setSavingFavorite(property.id);

    try {
      if (property.isFavorite) {
        await api.delete(`/favorites/${property.id}`);
      } else {
        await api.post(`/favorites/${property.id}`, {});
      }

      setResults((current) =>
        current.map((item) =>
          item.id === property.id ? { ...item, isFavorite: !item.isFavorite } : item
        )
      );
    } catch (requestError) {
      setError(requestError.message || 'No pudimos actualizar tus guardados.');
    } finally {
      setSavingFavorite('');
    }
  };

  const activeCount = useMemo(() => {
    let count = 0;

    if (appliedFilters.location) count += 1;
    if (appliedFilters.propertyType) count += 1;
    if (
      appliedFilters.minRent !== DEFAULT_FILTERS.minRent ||
      appliedFilters.maxRent !== DEFAULT_FILTERS.maxRent
    ) {
      count += 1;
    }
    if (appliedFilters.rooms !== DEFAULT_FILTERS.rooms) count += 1;
    if (appliedFilters.bathrooms !== DEFAULT_FILTERS.bathrooms) count += 1;
    if (appliedFilters.sort !== DEFAULT_FILTERS.sort) count += 1;
    if (appliedFilters.area !== DEFAULT_FILTERS.area) count += 1;
    if (appliedFilters.availableFrom) count += 1;

    return count + appliedFilters.extras.length;
  }, [appliedFilters]);

  const hasActiveSearch = activeCount > 0;

  return {
    filters,
    appliedFilters,
    results,
    totalCount,
    loading,
    error,
    savingFavorite,
    activeCount,
    hasActiveSearch,
    defaultFilters: DEFAULT_FILTERS,
    setFilter,
    patchFilters,
    toggleExtra,
    clearFilters,
    runSearch,
    toggleFavorite,
  };
}
