import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/useAuth';
import { api } from '../../lib/apiClient';
import {
  buildPropertySearchQuery,
  countActiveSearchFilters,
  DEFAULT_SEARCH_FILTERS,
  serializeSearchFilters,
} from '../properties/searchFilterParams';

export function useHomePropertySearch() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [filters, setFilters] = useState(DEFAULT_SEARCH_FILTERS);
  const [savingFavorite, setSavingFavorite] = useState('');
  const featuredQueryKey = ['properties', 'home', 'featured', isAuthenticated, filters.sort];

  const featuredQuery = useQuery({
    queryKey: featuredQueryKey,
    queryFn: () =>
      api.get('/properties', {
        auth: isAuthenticated,
        query: buildPropertySearchQuery({ ...DEFAULT_SEARCH_FILTERS, sort: filters.sort }, { limit: 8 }),
      }),
    staleTime: 15000,
  });

  const results = featuredQuery.data?.data || [];
  const totalCount = featuredQuery.data?.meta?.total || results.length;
  const loading = featuredQuery.isLoading || featuredQuery.isFetching;
  const error = featuredQuery.isError
    ? featuredQuery.error?.message || 'No pudimos cargar las propiedades.'
    : '';

  const runSearch = (nextFilters = filters) => {
    const params = serializeSearchFilters(nextFilters).toString();
    navigate(params ? `/properties?${params}` : '/properties');
  };

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

      if (field === 'propertyTypes') {
        return { ...current, propertyTypes: value };
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

  const patchFilters = (patch, shouldRunSearch = false) => {
    const nextFilters = {
      ...filters,
      ...patch,
      ...(Object.prototype.hasOwnProperty.call(patch, 'location')
        ? { city: '', department: '', neighborhood: '' }
        : {}),
    };
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

  const clearFilters = () => {
    setFilters(DEFAULT_SEARCH_FILTERS);
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

      queryClient.setQueryData(featuredQueryKey, (current) => {
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

  const activeCount = useMemo(() => countActiveSearchFilters(filters), [filters]);

  return {
    filters,
    results,
    totalCount,
    loading,
    error,
    savingFavorite,
    activeCount,
    defaultFilters: DEFAULT_SEARCH_FILTERS,
    setFilter,
    patchFilters,
    toggleExtra,
    clearFilters,
    runSearch,
    retrySearch: featuredQuery.refetch,
    toggleFavorite,
  };
}
