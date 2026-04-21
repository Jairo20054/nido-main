import React, { useEffect, useMemo, useState } from 'react';
import { Map, SlidersHorizontal, X } from 'lucide-react';
import { EmptyState } from '../../components/ui/EmptyState';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { LoadingState } from '../../components/ui/LoadingState';
import { useAuth } from '../../app/providers/AuthProvider';
import { api } from '../../lib/apiClient';
import { formatCurrency, getPropertyTypeLabel } from '../../lib/formatters';
import { PropertyCard } from './PropertyCard';
import { PropertyFilters } from './PropertyFilters';
import { useSearchFilters } from './useSearchFilters';

const EXTRA_LABELS = {
  furnished: 'Amoblado',
  petsAllowed: 'Mascotas OK',
  parking: 'Parqueadero',
  security: 'Vigilancia',
  gatedCommunity: 'Conjunto cerrado',
};

const getAmenityText = (property) => (property.amenities || []).join(' ').toLowerCase();

export function SearchPage() {
  const { isAuthenticated } = useAuth();
  const { filters, debouncedFilters, setFilter, toggleExtra, clearFilters, activeCount } =
    useSearchFilters();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingFavorite, setSavingFavorite] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mapView, setMapView] = useState(false);

  const fetchProperties = async (activeFilters) => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/properties', {
        auth: isAuthenticated,
        query: {
          city: activeFilters.city || undefined,
          propertyType: activeFilters.propertyType ? activeFilters.propertyType.toUpperCase() : undefined,
          minRent: activeFilters.minRent,
          maxRent: activeFilters.maxRent,
          bedrooms: activeFilters.bedrooms,
          bathrooms: activeFilters.bathrooms,
          furnished: activeFilters.extras.includes('furnished') || undefined,
          petsAllowed: activeFilters.extras.includes('petsAllowed') || undefined,
          sort: activeFilters.sort,
        },
      });
      const refinedProperties = (response.data || []).filter((property) => {
        const amenityText = getAmenityText(property);

        if (activeFilters.extras.includes('parking') && !property.parkingSpots) return false;
        if (activeFilters.extras.includes('security') && !amenityText.includes('vigil')) return false;
        if (
          activeFilters.extras.includes('gatedCommunity') &&
          !amenityText.includes('conjunto cerrado')
        ) {
          return false;
        }

        return true;
      });

      setProperties(refinedProperties);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties(debouncedFilters);
  }, [debouncedFilters, isAuthenticated]);

  const toggleFavorite = async (property) => {
    if (!isAuthenticated) {
      setError('Inicia sesión para guardar propiedades.');
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

    if (filters.propertyType) chips.push({ key: 'propertyType', label: getPropertyTypeLabel(filters.propertyType.toUpperCase()) });
    if (filters.city) chips.push({ key: 'city', label: filters.city });
    if (filters.minRent !== 1800000 || filters.maxRent !== 4500000) {
      chips.push({
        key: 'rent',
        label: `${formatCurrency(filters.minRent)} - ${formatCurrency(filters.maxRent)}`,
      });
    }
    if (filters.bedrooms !== 1) chips.push({ key: 'bedrooms', label: `${filters.bedrooms} hab.` });
    if (filters.bathrooms !== 1) chips.push({ key: 'bathrooms', label: `${filters.bathrooms} baños` });
    filters.extras.forEach((extra) => chips.push({ key: extra, label: EXTRA_LABELS[extra] }));

    return chips;
  }, [filters]);

  const dismissChip = (key) => {
    if (key === 'propertyType') return setFilter('propertyType', '');
    if (key === 'city') return setFilter('city', '');
    if (key === 'rent') {
      setFilter('minRent', 1800000);
      setFilter('maxRent', 4500000);
      return;
    }
    if (key === 'bedrooms') return setFilter('bedrooms', 1);
    if (key === 'bathrooms') return setFilter('bathrooms', 1);
    toggleExtra(key);
  };

  return (
    <div className="page page--search search-page">
      <section className="section section--compact">
        <div className="search-layout">
          <aside className="search-layout__sidebar search-layout__sidebar--desktop">
            <PropertyFilters
              filters={filters}
              activeCount={activeCount}
              onChange={setFilter}
              onToggleExtra={toggleExtra}
              onClear={clearFilters}
              resultCount={properties.length}
            />
          </aside>

          <div className="search-layout__results">
            <div className="search-results__topbar">
              <div>
                <h1>{properties.length} propiedades en {filters.city || 'Colombia'}</h1>
                <p>Explora opciones pensadas para renta residencial, con filtros visibles y rápidos.</p>
              </div>
              <div className="search-results__actions">
                <label className="sort-select">
                  <span>Ordenar</span>
                  <select value={filters.sort} onChange={(event) => setFilter('sort', event.target.value)}>
                    <option value="recommended">Recomendados</option>
                    <option value="rent-asc">Precio menor</option>
                    <option value="latest">Más recientes</option>
                    <option value="rent-desc">Precio mayor</option>
                  </select>
                </label>
                <button type="button" className="map-toggle" onClick={() => setMapView((current) => !current)}>
                  <Map size={16} />
                  {mapView ? 'Ocultar mapa' : 'Ver mapa'}
                </button>
              </div>
            </div>

            {activeFilterChips.length ? (
              <div className="active-filter-row">
                {activeFilterChips.map((chip) => (
                  <button key={chip.key} type="button" className="active-filter-chip" onClick={() => dismissChip(chip.key)}>
                    {chip.label} <X size={14} />
                  </button>
                ))}
              </div>
            ) : null}

            <InlineMessage tone="danger">{error}</InlineMessage>
            {mapView ? (
              <div className="map-placeholder">
                <Map size={20} />
                <span>Vista de mapa próximamente</span>
              </div>
            ) : null}
            {loading ? (
              <LoadingState label="Buscando propiedades..." />
            ) : properties.length ? (
              <div className="property-grid">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onToggleFavorite={toggleFavorite}
                    disabledFavorite={savingFavorite === property.id}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No encontramos resultados"
                description="Prueba con otro rango de canon, una ciudad distinta o menos restricciones."
                actionLabel="Limpiar filtros"
                onAction={clearFilters}
              />
            )}
          </div>
        </div>
      </section>

      <button
        type="button"
        className="mobile-filter-trigger"
        onClick={() => setMobileFiltersOpen(true)}
      >
        <SlidersHorizontal size={18} />
        Filtros
        {activeCount ? <span>{activeCount}</span> : null}
      </button>

      {mobileFiltersOpen ? (
        <div className="mobile-filter-sheet" role="dialog" aria-modal="true">
          <div className="mobile-filter-sheet__backdrop" onClick={() => setMobileFiltersOpen(false)}></div>
          <div className="mobile-filter-sheet__panel">
            <PropertyFilters
              filters={filters}
              activeCount={activeCount}
              onChange={setFilter}
              onToggleExtra={toggleExtra}
              onClear={clearFilters}
              onDismiss={() => setMobileFiltersOpen(false)}
              resultCount={properties.length}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
