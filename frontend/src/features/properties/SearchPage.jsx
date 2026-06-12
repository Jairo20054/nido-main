import React, { useEffect, useMemo, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { useAuth } from '../../app/providers/useAuth';
import { api } from '../../lib/apiClient';
import { formatCurrency, getPropertyTypeLabel } from '../../lib/formatters';
import { ActiveFilterChips } from './ActiveFilterChips';
import { EmptyPropertiesState } from './EmptyPropertiesState';
import { FilterDropdown } from './FilterDropdown';
import { MobileFiltersDrawer } from './MobileFiltersDrawer';
import { PropertyComparisonBar } from './PropertyComparisonBar';
import { PropertyComparisonModal } from './PropertyComparisonModal';
import { PropertiesGrid } from './PropertiesGrid';
import { PropertiesResultsHeader } from './PropertiesResultsHeader';
import { PropertiesSearchBar } from './PropertiesSearchBar';
import { PropertiesTopFilters } from './PropertiesTopFilters';
import { RecommendedPropertiesPanel } from './RecommendedPropertiesPanel';
import { EXTRA_LABELS, SORT_OPTIONS } from './propertySearchConfig';
import {
  buildPropertySearchQuery,
  DEFAULT_SEARCH_FILTERS,
} from './searchFilterParams';
import { useSearchFilters } from './useSearchFilters';

const buildResultSummary = (filters, activeCount) => {
  const parts = [];
  const locationLabel =
    filters.location ||
    [filters.neighborhood, filters.city, filters.department].filter(Boolean).join(', ');

  if (locationLabel) {
    parts.push(locationLabel);
  }

  if (filters.propertyTypes.length === 1) {
    parts.push(getPropertyTypeLabel(filters.propertyTypes[0]));
  } else if (filters.propertyTypes.length > 1) {
    parts.push(`${filters.propertyTypes.length} tipos de inmueble`);
  } else {
    parts.push('Casas y apartamentos');
  }

  if (filters.maxRent !== DEFAULT_SEARCH_FILTERS.maxRent) {
    parts.push(`Hasta ${formatCurrency(filters.maxRent)}`);
  }

  if (activeCount) {
    parts.push(`${activeCount} filtros activos`);
  }

  return parts.join(' / ');
};

export function SearchPage() {
  const { isAuthenticated } = useAuth();
  const {
    filters,
    debouncedFilters,
    setFilter,
    patchFilters,
    replaceFilters,
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
  const [desktopFiltersOpen, setDesktopFiltersOpen] = useState(false);
  const [showMapPanel, setShowMapPanel] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [compareNotice, setCompareNotice] = useState('');

  const fetchProperties = async (activeFilters) => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/properties', {
        auth: isAuthenticated,
        query: buildPropertySearchQuery(activeFilters, { limit: 36 }),
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
    const locationLabel =
      filters.location ||
      [filters.neighborhood, filters.city, filters.department].filter(Boolean).join(', ');

    if (locationLabel) {
      chips.push({ key: 'location', type: 'location', label: locationLabel });
    }

    filters.propertyTypes.forEach((type) => {
      chips.push({
        key: `propertyType:${type}`,
        type: 'propertyType',
        value: type,
        label: getPropertyTypeLabel(type),
      });
    });

    if (filters.minRent !== defaultFilters.minRent || filters.maxRent !== defaultFilters.maxRent) {
      chips.push({
        key: 'rent',
        type: 'rent',
        label: `${formatCurrency(filters.minRent)} - ${
          filters.maxRent >= defaultFilters.maxRent
            ? '$ 1.000.000.000+ COP'
            : formatCurrency(filters.maxRent)
        }`,
      });
    }

    if (filters.bedrooms) {
      chips.push({
        key: 'bedrooms',
        type: 'bedrooms',
        label: filters.bedroomsExact ? `${filters.bedrooms} hab. exactas` : `${filters.bedrooms}+ hab.`,
      });
    }

    if (filters.bathrooms) {
      chips.push({
        key: 'bathrooms',
        type: 'bathrooms',
        label: filters.bathroomsExact ? `${filters.bathrooms} banos exactos` : `${filters.bathrooms}+ banos`,
      });
    }

    if (filters.parking !== defaultFilters.parking) {
      chips.push({
        key: 'parking',
        type: 'parking',
        label: String(filters.parking) === '0' ? 'Sin parqueadero' : `${filters.parking}+ parqueaderos`,
      });
    }

    if (filters.minArea || filters.maxArea) {
      chips.push({
        key: 'area',
        type: 'area',
        label: `${filters.minArea || 0} - ${filters.maxArea || '2000+'} m2`,
      });
    }

    if (filters.strata) {
      chips.push({ key: 'strata', type: 'strata', label: `Estrato ${filters.strata}` });
    }

    if (filters.administrationIncluded) {
      chips.push({
        key: 'administrationIncluded',
        type: 'administrationIncluded',
        label: 'Administracion incluida',
      });
    }

    if (filters.availableFrom) {
      chips.push({
        key: 'availableFrom',
        type: 'availableFrom',
        label: `Disponible desde ${filters.availableFrom}`,
      });
    }

    filters.extras.forEach((extra) =>
      chips.push({
        key: extra,
        type: 'extra',
        value: extra,
        label: EXTRA_LABELS[extra],
      })
    );

    return chips;
  }, [defaultFilters, filters]);

  const selectedPropertyIds = useMemo(
    () => selectedProperties.map((property) => property.id),
    [selectedProperties]
  );

  const resultSummary = useMemo(
    () => buildResultSummary(filters, activeCount),
    [activeCount, filters]
  );

  const dismissChip = (chip) => {
    if (chip.type === 'location') {
      patchFilters({
        location: '',
        city: '',
        department: '',
        neighborhood: '',
      });
      return;
    }
    if (chip.type === 'propertyType') return togglePropertyType(chip.value);
    if (chip.type === 'rent') {
      patchFilters({
        minRent: defaultFilters.minRent,
        maxRent: defaultFilters.maxRent,
      });
      return;
    }
    if (chip.type === 'bedrooms') {
      patchFilters({
        bedrooms: defaultFilters.bedrooms,
        bedroomsExact: defaultFilters.bedroomsExact,
      });
      return;
    }
    if (chip.type === 'bathrooms') {
      patchFilters({
        bathrooms: defaultFilters.bathrooms,
        bathroomsExact: defaultFilters.bathroomsExact,
      });
      return;
    }
    if (chip.type === 'parking') return setFilter('parking', defaultFilters.parking);
    if (chip.type === 'area') {
      patchFilters({ minArea: defaultFilters.minArea, maxArea: defaultFilters.maxArea });
      return;
    }
    if (chip.type === 'strata') return setFilter('strata', defaultFilters.strata);
    if (chip.type === 'administrationIncluded') {
      return setFilter('administrationIncluded', defaultFilters.administrationIncluded);
    }
    if (chip.type === 'availableFrom') return setFilter('availableFrom', defaultFilters.availableFrom);
    if (chip.type === 'extra') return toggleExtra(chip.value);
  };

  const showPopularResults = () => {
    replaceFilters({ ...DEFAULT_SEARCH_FILTERS, location: 'Medellin' });
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
    <div className="page page--search properties-page properties-page--marketplace">
      <section className="properties-page__search">
        <PropertiesSearchBar
          filters={filters}
          activeCount={activeCount}
          onChange={setFilter}
        />
      </section>

      <section className="properties-page__toolbar">
        <PropertiesTopFilters
          filters={filters}
          activeCount={activeCount}
          onChange={setFilter}
          onClear={clearFilters}
          onOpenMoreFilters={() => setDesktopFiltersOpen(true)}
        />
      </section>

      <section className="properties-mobile-toolbar" aria-label="Filtros y orden movil">
        <button
          type="button"
          className="properties-mobile-toolbar__filter"
          onClick={() => setMobileFiltersOpen(true)}
        >
          <SlidersHorizontal size={18} aria-hidden="true" />
          Filtros
          {activeCount ? <span>{activeCount}</span> : null}
        </button>
        <FilterDropdown
          className="properties-mobile-toolbar__sort"
          label="Ordenar"
          ariaLabel="Ordenar propiedades"
          value={filters.sort}
          options={SORT_OPTIONS}
          onChange={(value) => setFilter('sort', value)}
        />
        {activeCount ? (
          <div className="properties-mobile-toolbar__summary" aria-live="polite">
            <span>{activeCount} activos</span>
            <button type="button" onClick={clearFilters}>
              Limpiar
            </button>
          </div>
        ) : null}
      </section>

      <section className={`properties-layout ${showMapPanel ? 'properties-layout--map-open' : ''}`}>
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
            onClearPropertyTypes={() => patchFilters({ propertyTypes: [] })}
            onToggleMap={() => setShowMapPanel((current) => !current)}
            onViewModeChange={setViewMode}
          />
          <ActiveFilterChips
            chips={activeFilterChips}
            onDismiss={dismissChip}
            onClear={clearFilters}
          />
          {compareNotice ? <InlineMessage tone="neutral">{compareNotice}</InlineMessage> : null}

          {!loading && error ? (
            <InlineMessage tone="danger">{error}</InlineMessage>
          ) : !loading && !properties.length ? (
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
            location={filters.location || filters.city}
            properties={properties}
            onViewMap={() => setShowMapPanel(true)}
          />
        </div>
      </section>

      <MobileFiltersDrawer
        open={mobileFiltersOpen}
        filters={filters}
        activeCount={activeCount}
        resultCount={properties.length}
        onApply={(nextFilters) => {
          replaceFilters(nextFilters);
          setMobileFiltersOpen(false);
        }}
        onClear={() => replaceFilters(DEFAULT_SEARCH_FILTERS)}
        onDismiss={() => setMobileFiltersOpen(false)}
      />

      <MobileFiltersDrawer
        open={desktopFiltersOpen}
        filters={filters}
        activeCount={activeCount}
        resultCount={properties.length}
        onApply={(nextFilters) => {
          replaceFilters(nextFilters);
          setDesktopFiltersOpen(false);
        }}
        onClear={() => replaceFilters(DEFAULT_SEARCH_FILTERS)}
        onDismiss={() => setDesktopFiltersOpen(false)}
        desktop
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
