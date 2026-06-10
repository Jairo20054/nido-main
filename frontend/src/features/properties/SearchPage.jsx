import React, { useEffect, useMemo, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { useAuth } from '../../app/providers/useAuth';
import { api } from '../../lib/apiClient';
import { formatCurrency, getPropertyTypeLabel } from '../../lib/formatters';
import { ActiveFilterChips } from './ActiveFilterChips';
import { EmptyPropertiesState } from './EmptyPropertiesState';
import { MobileFiltersDrawer } from './MobileFiltersDrawer';
import { PropertyComparisonBar } from './PropertyComparisonBar';
import { PropertyComparisonModal } from './PropertyComparisonModal';
import { PropertiesGrid } from './PropertiesGrid';
import { PropertiesResultsHeader } from './PropertiesResultsHeader';
import { PropertiesSearchBar } from './PropertiesSearchBar';
import { PropertyFilters } from './PropertyFilters';
import { RecommendedPropertiesPanel } from './RecommendedPropertiesPanel';
import { EXTRA_LABELS } from './propertySearchConfig';
import { useSearchFilters } from './useSearchFilters';

const BACKEND_SORTS = ['recommended', 'latest', 'rent-asc', 'rent-desc'];
const EXTRA_QUERY_KEYS = ['furnished', 'petsAllowed', 'parking', 'elevator', 'balcony', 'gym', 'security', 'gatedCommunity'];

const extrasToQuery = (extras) =>
  EXTRA_QUERY_KEYS.reduce((query, key) => {
    if (extras.includes(key)) {
      query[key] = true;
    }

    return query;
  }, {});

export function SearchPage() {
  const { isAuthenticated } = useAuth();
  const {
    filters,
    debouncedFilters,
    setFilter,
    togglePropertyType,
    toggleExtra,
    clearFilters,
    activeCount,
    defaultFilters,
  } = useSearchFilters();
  const [properties, setProperties] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingFavorite, setSavingFavorite] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [showMapPanel, setShowMapPanel] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [compareNotice, setCompareNotice] = useState('');

  const fetchProperties = async (activeFilters) => {
    setLoading(true);
    setError('');

    try {
      const backendSort = BACKEND_SORTS.includes(activeFilters.sort) ? activeFilters.sort : 'recommended';
      const response = await api.get('/properties', {
        auth: isAuthenticated,
        query: {
          q: activeFilters.city || undefined,
          propertyTypes: activeFilters.propertyTypes.length ? activeFilters.propertyTypes.join(',') : undefined,
          minRent: activeFilters.minRent || undefined,
          maxRent: activeFilters.maxRent !== defaultFilters.maxRent ? activeFilters.maxRent : undefined,
          bedrooms: activeFilters.bedrooms || undefined,
          bathrooms: activeFilters.bathrooms || undefined,
          sort: activeFilters.sort === 'area-desc' ? 'area-desc' : backendSort,
          ...extrasToQuery(activeFilters.extras),
          limit: 50,
        },
      });

      const backendProperties = response.data || [];
      setProperties(backendProperties);
      setTotalCount(response.meta?.total || backendProperties.length);
    } catch (requestError) {
      setProperties([]);
      setTotalCount(0);
      setError(requestError.message || 'No pudimos cargar propiedades en este momento.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties(debouncedFilters);
  }, [debouncedFilters, isAuthenticated]);

  useEffect(() => {
    setSelectedProperties((current) =>
      current.filter((selected) => properties.some((property) => property.id === selected.id))
    );
  }, [properties]);

  useEffect(() => {
    if (!compareNotice) return undefined;

    const timeoutId = window.setTimeout(() => setCompareNotice(''), 3600);
    return () => window.clearTimeout(timeoutId);
  }, [compareNotice]);

  const toggleFavorite = async (property) => {
    if (!isAuthenticated) {
      setError('Puedes explorar sin cuenta. Inicia sesion solo si quieres guardar propiedades.');
      return;
    }

    setSavingFavorite(property.id);

    try {
      if (property.isFavorite) {
        await api.delete(`/favorites/${property.id}`);
      } else {
        await api.post(`/favorites/${property.id}`, {});
      }

      setProperties((current) =>
        current.map((item) =>
          item.id === property.id ? { ...item, isFavorite: !item.isFavorite } : item
        )
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingFavorite('');
    }
  };

  const activeFilterChips = useMemo(() => {
    const chips = [];

    filters.propertyTypes.forEach((type) => {
      chips.push({
        key: `propertyType:${type}`,
        type: 'propertyType',
        value: type,
        label: getPropertyTypeLabel(type.toUpperCase()),
      });
    });

    if (filters.city) chips.push({ key: 'city', type: 'city', label: filters.city });
    if (filters.minRent !== defaultFilters.minRent || filters.maxRent !== defaultFilters.maxRent) {
      chips.push({
        key: 'rent',
        type: 'rent',
        label: `${formatCurrency(filters.minRent)} - ${
          filters.maxRent >= defaultFilters.maxRent ? '$1.000.000.000+' : formatCurrency(filters.maxRent)
        }`,
      });
    }
    if (filters.bedrooms) chips.push({ key: 'bedrooms', type: 'bedrooms', label: `${filters.bedrooms}+ hab.` });
    if (filters.bathrooms) chips.push({ key: 'bathrooms', type: 'bathrooms', label: `${filters.bathrooms}+ banos` });
    if (filters.radius !== defaultFilters.radius) {
      chips.push({
        key: 'radius',
        type: 'radius',
        label: filters.radius === 0.5 ? '500 m' : `${filters.radius} km`,
      });
    }
    filters.extras.forEach((extra) => chips.push({ key: extra, type: 'extra', value: extra, label: EXTRA_LABELS[extra] }));

    return chips;
  }, [filters, defaultFilters]);

  const selectedPropertyIds = useMemo(
    () => selectedProperties.map((property) => property.id),
    [selectedProperties]
  );

  const resultSummary = useMemo(() => {
    const parts = [];
    parts.push(filters.city || 'Colombia');

    if (filters.maxRent !== defaultFilters.maxRent) {
      parts.push(`Presupuesto hasta ${formatCurrency(filters.maxRent)}`);
    }

    if (filters.propertyTypes.length === 1) {
      parts.push(getPropertyTypeLabel(filters.propertyTypes[0]));
    } else if (filters.propertyTypes.length > 1) {
      parts.push(`${filters.propertyTypes.length} tipos de vivienda`);
    } else {
      parts.push('Cualquier tipo');
    }

    if (activeCount) parts.push(`${activeCount} filtros activos`);

    return parts.join(' / ');
  }, [activeCount, defaultFilters.maxRent, filters]);

  const dismissChip = (chip) => {
    if (chip.type === 'propertyType') return togglePropertyType(chip.value);
    if (chip.type === 'city') return setFilter('city', '');
    if (chip.type === 'rent') {
      setFilter('minRent', defaultFilters.minRent);
      setFilter('maxRent', defaultFilters.maxRent);
      return undefined;
    }
    if (chip.type === 'bedrooms') return setFilter('bedrooms', defaultFilters.bedrooms);
    if (chip.type === 'bathrooms') return setFilter('bathrooms', defaultFilters.bathrooms);
    if (chip.type === 'radius') return setFilter('radius', defaultFilters.radius);
    if (chip.type === 'extra') return toggleExtra(chip.value);
    return undefined;
  };

  const showPopularResults = () => {
    clearFilters();
    setFilter('city', 'Medellin');
  };

  const toggleCompare = (property) => {
    setCompareNotice('');
    setSelectedProperties((current) => {
      const isSelected = current.some((item) => item.id === property.id);

      if (isSelected) {
        return current.filter((item) => item.id !== property.id);
      }

      if (current.length >= 4) {
        setCompareNotice('Puedes comparar hasta 4 propiedades al mismo tiempo.');
        return current;
      }

      return [...current, property];
    });
  };

  const openComparison = () => {
    if (selectedProperties.length < 2) {
      setCompareNotice('Selecciona al menos 2 propiedades para comparar.');
      return;
    }

    setComparisonOpen(true);
  };

  return (
    <div className="page page--search properties-page">
      <section className="properties-page__search">
        <PropertiesSearchBar
          filters={filters}
          activeCount={activeCount}
          onChange={setFilter}
          onToggleExtra={toggleExtra}
          onTogglePropertyType={togglePropertyType}
        />
      </section>

      <section className={`properties-layout ${showMapPanel ? 'properties-layout--map-open' : ''}`}>
        <aside className="properties-layout__filters">
          <PropertyFilters
            filters={filters}
            activeCount={activeCount}
            onChange={setFilter}
            onToggleExtra={toggleExtra}
            onTogglePropertyType={togglePropertyType}
            onClear={clearFilters}
            resultCount={properties.length}
          />
        </aside>

        <main className="properties-layout__results">
          <PropertiesResultsHeader
            count={properties.length}
            totalCount={totalCount}
            filters={filters}
            viewMode={viewMode}
            activeCount={activeCount}
            resultSummary={resultSummary}
            mapOpen={showMapPanel}
            onSortChange={(value) => setFilter('sort', value)}
            onClear={clearFilters}
            onToggleMap={() => setShowMapPanel((current) => !current)}
            onViewModeChange={setViewMode}
          />
          <ActiveFilterChips chips={activeFilterChips} onDismiss={dismissChip} onClear={clearFilters} />
          <InlineMessage tone="danger">{error}</InlineMessage>
          <InlineMessage tone="neutral">{compareNotice}</InlineMessage>

          {!loading && !properties.length ? (
            <EmptyPropertiesState
              hasFilters={activeCount > 0}
              onClear={clearFilters}
              onPopular={showPopularResults}
            />
          ) : (
            <PropertiesGrid
              loading={loading}
              properties={properties}
              viewMode={viewMode}
              onToggleFavorite={toggleFavorite}
              savingFavorite={savingFavorite}
              selectedPropertyIds={selectedPropertyIds}
              onToggleCompare={toggleCompare}
            />
          )}
        </main>

        <div className={`properties-layout__panel ${showMapPanel ? 'is-open' : ''}`}>
          <RecommendedPropertiesPanel
            location={filters.city}
            properties={properties}
            onViewMap={() => setShowMapPanel(true)}
          />
        </div>
      </section>

      <button
        type="button"
        className="mobile-filter-trigger"
        onClick={() => setMobileFiltersOpen(true)}
      >
        <SlidersHorizontal size={18} aria-hidden="true" />
        Filtros
        {activeCount ? <span>{activeCount}</span> : null}
      </button>

      <MobileFiltersDrawer
        open={mobileFiltersOpen}
        filters={filters}
        activeCount={activeCount}
        resultCount={properties.length}
        onChange={setFilter}
        onToggleExtra={toggleExtra}
        onTogglePropertyType={togglePropertyType}
        onClear={clearFilters}
        onDismiss={() => setMobileFiltersOpen(false)}
      />

      <PropertyComparisonBar
        count={selectedProperties.length}
        onClear={() => {
          setSelectedProperties([]);
          setCompareNotice('');
        }}
        onCompare={openComparison}
      />

      <PropertyComparisonModal
        open={comparisonOpen}
        properties={selectedProperties}
        onClose={() => setComparisonOpen(false)}
      />
    </div>
  );
}
