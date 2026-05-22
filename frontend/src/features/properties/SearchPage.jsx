import React, { useEffect, useMemo, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { useAuth } from '../../app/providers/useAuth';
import { api } from '../../lib/apiClient';
import { formatCurrency, getPropertyTypeLabel } from '../../lib/formatters';
import { ActiveFilterChips } from './ActiveFilterChips';
import { EmptyPropertiesState } from './EmptyPropertiesState';
import { MobileFiltersDrawer } from './MobileFiltersDrawer';
import { PropertiesGrid } from './PropertiesGrid';
import { PropertiesResultsHeader } from './PropertiesResultsHeader';
import { PropertiesSearchBar } from './PropertiesSearchBar';
import { PropertyFilters } from './PropertyFilters';
import { RecommendedPropertiesPanel } from './RecommendedPropertiesPanel';
import { EXTRA_LABELS } from './propertySearchConfig';
import { useSearchFilters } from './useSearchFilters';

const BACKEND_SORTS = ['recommended', 'latest', 'rent-asc', 'rent-desc'];

const getAmenityText = (property) => (property.amenities || []).join(' ').toLowerCase();

const includesAny = (text, words) => words.some((word) => text.includes(word));

const matchesExtra = (property, extra) => {
  const amenityText = getAmenityText(property);

  if (extra === 'furnished') return Boolean(property.furnished);
  if (extra === 'petsAllowed') return Boolean(property.petsAllowed);
  if (extra === 'parking') return Number(property.parkingSpots || 0) > 0;
  if (extra === 'elevator') return Boolean(property.elevator) || includesAny(amenityText, ['ascensor']);
  if (extra === 'balcony') return Boolean(property.balcony) || includesAny(amenityText, ['balcon', 'balcón']);
  if (extra === 'gym') return includesAny(amenityText, ['gimnasio', 'gym']);
  if (extra === 'security') return Boolean(property.security) || includesAny(amenityText, ['vigil', 'seguridad']);
  if (extra === 'gatedCommunity') return includesAny(amenityText, ['conjunto cerrado', 'unidad cerrada']);

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

  const fetchProperties = async (activeFilters) => {
    setLoading(true);
    setError('');

    try {
      const backendSort = BACKEND_SORTS.includes(activeFilters.sort) ? activeFilters.sort : 'recommended';
      const singlePropertyType =
        activeFilters.propertyTypes.length === 1 ? activeFilters.propertyTypes[0].toUpperCase() : undefined;
      const response = await api.get('/properties', {
        auth: isAuthenticated,
        query: {
          q: activeFilters.city || undefined,
          propertyType: singlePropertyType,
          minRent: activeFilters.minRent || undefined,
          maxRent: activeFilters.maxRent !== defaultFilters.maxRent ? activeFilters.maxRent : undefined,
          bedrooms: activeFilters.bedrooms || undefined,
          bathrooms: activeFilters.bathrooms || undefined,
          furnished: activeFilters.extras.includes('furnished') || undefined,
          petsAllowed: activeFilters.extras.includes('petsAllowed') || undefined,
          sort: backendSort,
          limit: 50,
        },
      });

      const refinedProperties = (response.data || []).filter((property) => {
        if (
          activeFilters.propertyTypes.length > 0 &&
          !activeFilters.propertyTypes.includes(String(property.propertyType || '').toLowerCase())
        ) {
          return false;
        }

        return activeFilters.extras.every((extra) => matchesExtra(property, extra));
      });

      setProperties(sortProperties(refinedProperties, activeFilters.sort));
      setTotalCount(response.meta?.total || refinedProperties.length);
    } catch (requestError) {
      setError(requestError.message);
      setProperties([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties(debouncedFilters);
  }, [debouncedFilters, isAuthenticated]);

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
          filters.maxRent >= defaultFilters.maxRent ? '$9.000.000+' : formatCurrency(filters.maxRent)
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

      <section className="properties-layout">
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
            onSortChange={(value) => setFilter('sort', value)}
            onToggleMap={() => setShowMapPanel((current) => !current)}
            onViewModeChange={setViewMode}
          />
          <ActiveFilterChips chips={activeFilterChips} onDismiss={dismissChip} onClear={clearFilters} />
          <InlineMessage tone="danger">{error}</InlineMessage>

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
    </div>
  );
}
