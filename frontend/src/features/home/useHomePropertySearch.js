import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../app/providers/useAuth';
import { api } from '../../lib/apiClient';

const DEFAULT_FILTERS = {
  location: '',
  city: '',
  department: '',
  neighborhood: '',
  minRent: 0,
  maxRent: 1000000000,
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

const firstParam = (searchParams, keys) => {
  const key = keys.find((item) => searchParams.get(item));
  return key ? searchParams.get(key) : '';
};

const readFiltersFromParams = (searchParams) => {
  const city = firstParam(searchParams, ['ciudad', 'city']);
  const department = firstParam(searchParams, ['departamento', 'department']);
  const neighborhood = firstParam(searchParams, ['barrio', 'neighborhood']);
  const location = firstParam(searchParams, ['q', 'location']) || city || department || neighborhood;

  return {
    location,
    city,
    department,
    neighborhood,
    minRent: parseNumber(firstParam(searchParams, ['min', 'minPrice', 'minRent']), DEFAULT_FILTERS.minRent),
    maxRent: parseNumber(firstParam(searchParams, ['max', 'maxPrice', 'maxRent']), DEFAULT_FILTERS.maxRent),
    propertyType: firstParam(searchParams, ['tipo', 'propertyType']),
    rooms: parseNumber(firstParam(searchParams, ['hab', 'habitaciones', 'rooms', 'bedrooms']), DEFAULT_FILTERS.rooms),
    bathrooms: parseNumber(firstParam(searchParams, ['banos', 'bathrooms']), DEFAULT_FILTERS.bathrooms),
    extras: normalizeExtras(searchParams.get('extras')?.split(',').filter(Boolean)),
    sort: firstParam(searchParams, ['orden', 'sort']) || DEFAULT_FILTERS.sort,
    area: parseNumber(firstParam(searchParams, ['area', 'areaMin']), DEFAULT_FILTERS.area),
    availableFrom: firstParam(searchParams, ['disponible', 'availableFrom']),
  };
};

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

const buildPropertyQuery = (filters) => ({
  q: filters.location || undefined,
  city: filters.city || undefined,
  department: filters.department || undefined,
  neighborhood: filters.neighborhood || undefined,
  propertyTypes: filters.propertyType || undefined,
  minRent: filters.minRent || undefined,
  maxRent: filters.maxRent !== DEFAULT_FILTERS.maxRent ? filters.maxRent : undefined,
  bedrooms: filters.rooms || undefined,
  bathrooms: filters.bathrooms || undefined,
  areaMin: filters.area || undefined,
  availableFrom: filters.availableFrom || undefined,
  furnished: filters.extras.includes('furnished') ? true : undefined,
  petsAllowed: filters.extras.includes('petsAllowed') ? true : undefined,
  parking: filters.extras.includes('parking') ? true : undefined,
  elevator: filters.extras.includes('elevator') ? true : undefined,
  balcony: filters.extras.includes('balcony') ? true : undefined,
  security: filters.extras.includes('security') ? true : undefined,
  sort: filters.sort === 'area-desc' || BACKEND_SORTS.includes(filters.sort) ? filters.sort : 'recommended',
  limit: 24,
});

export function useHomePropertySearch() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => readFiltersFromParams(searchParams));
  const [appliedFilters, setAppliedFilters] = useState(() => readFiltersFromParams(searchParams));
  const [savingFavorite, setSavingFavorite] = useState('');
  const queryFilters = useMemo(() => buildPropertyQuery(appliedFilters), [appliedFilters]);
  const queryKey = useMemo(
    () => ['properties', 'home', queryFilters, isAuthenticated],
    [isAuthenticated, queryFilters]
  );

  const propertiesQuery = useQuery({
    queryKey,
    queryFn: () =>
      api.get('/properties', {
        auth: isAuthenticated,
        query: queryFilters,
      }),
    staleTime: 15000,
  });

  const results = propertiesQuery.data?.data || [];
  const totalCount = propertiesQuery.data?.meta?.total || results.length;
  const loading = propertiesQuery.isLoading || propertiesQuery.isFetching;
  const error = propertiesQuery.isError
    ? propertiesQuery.error?.message || 'No pudimos cargar las propiedades.'
    : '';

  useEffect(() => {
    const nextFilters = readFiltersFromParams(searchParams);
    setFilters((current) => (isSameFilters(current, nextFilters) ? current : nextFilters));
    setAppliedFilters((current) => (isSameFilters(current, nextFilters) ? current : nextFilters));
  }, [searchParams]);

  const runSearch = useCallback(
    (nextFilters = filters) => {
      setAppliedFilters(nextFilters);
      setSearchParams(serializeFilters(nextFilters), { replace: true });
    },
    [filters, setSearchParams]
  );

  const setFilter = (field, value) => {
    setFilters((current) => {
      if (['minRent', 'maxRent', 'rooms', 'bathrooms', 'area'].includes(field)) {
        return { ...current, [field]: parseNumber(value, current[field]) };
      }

      if (field === 'location') {
        return { ...current, location: value, city: '', department: '', neighborhood: '' };
      }

      return { ...current, [field]: value };
    });
  };

  const patchFilters = (patch, shouldRunSearch = false) => {
    const explicitLocationReset =
      Object.prototype.hasOwnProperty.call(patch, 'location') &&
      patch.location !== filters.location
        ? { city: '', department: '', neighborhood: '' }
        : {};
    const nextFilters = { ...filters, ...patch, ...explicitLocationReset };
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

      queryClient.setQueryData(queryKey, (current) => {
        if (!current?.data) return current;

        return {
          ...current,
          data: current.data.map((item) =>
            item.id === property.id ? { ...item, isFavorite: !item.isFavorite } : item
          ),
        };
      });
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
    retrySearch: propertiesQuery.refetch,
    toggleFavorite,
  };
}
