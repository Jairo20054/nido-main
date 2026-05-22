import React, { useEffect, useMemo, useState } from 'react';
import { Map, Search, SlidersHorizontal, X } from 'lucide-react';
import { EmptyState } from '../../components/ui/EmptyState';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { useAuth } from '../../app/providers/useAuth';
import { api } from '../../lib/apiClient';
import { formatCurrency, getPropertyTypeLabel } from '../../lib/formatters';
import { PropertyCard } from './PropertyCard';
import { PropertyCardSkeleton } from './PropertyCardSkeleton';
import { PropertyFilters } from './PropertyFilters';
import { useSearchFilters } from './useSearchFilters';

const EXTRA_LABELS = {
  furnished: 'Amoblado',
  petsAllowed: 'Acepta mascotas',
  parking: 'Parqueadero',
  security: 'Vigilancia',
  gatedCommunity: 'Conjunto cerrado',
};

const SEARCH_BUDGET_OPTIONS = [
  { value: 1500000, label: 'Hasta $1.5M' },
  { value: 2000000, label: 'Hasta $2M' },
  { value: 2500000, label: 'Hasta $2.5M' },
  { value: 3500000, label: 'Hasta $3.5M' },
  { value: 9000000, label: 'Sin limite cercano' },
];

const SEARCH_PROPERTY_TYPES = [
  { value: '', label: 'Cualquier tipo' },
  { value: 'apartment', label: 'Apartamento' },
  { value: 'house', label: 'Casa' },
  { value: 'studio', label: 'Apartaestudio' },
  { value: 'room', label: 'Habitacion' },
  { value: 'loft', label: 'Loft' },
];

const QUICK_SEARCH_CHIPS = [
  { key: 'bogota', label: 'Bogotá', field: 'city', value: 'Bogotá' },
  { key: 'medellin', label: 'Medellín', field: 'city', value: 'Medellín' },
  { key: 'apartment', label: 'Apartamentos', field: 'propertyType', value: 'apartment' },
  { key: 'furnished', label: 'Amoblados', extra: 'furnished' },
  { key: 'petsAllowed', label: 'Acepta mascotas', extra: 'petsAllowed' },
];

const MAP_PIN_POSITIONS = [
  { top: '22%', left: '64%' },
  { top: '36%', left: '32%' },
  { top: '52%', left: '74%' },
  { top: '66%', left: '44%' },
  { top: '78%', left: '58%' },
];

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
  const budgetSelectValue = SEARCH_BUDGET_OPTIONS.some((option) => option.value === filters.maxRent)
    ? String(filters.maxRent)
    : 'custom';

  const fetchProperties = async (activeFilters) => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/properties', {
        auth: isAuthenticated,
        query: {
          q: activeFilters.city || undefined,
          propertyType: activeFilters.propertyType
            ? activeFilters.propertyType.toUpperCase()
            : undefined,
          minRent: activeFilters.minRent || undefined,
          maxRent: activeFilters.maxRent || undefined,
          bedrooms: activeFilters.bedrooms || undefined,
          bathrooms: activeFilters.bathrooms || undefined,
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
      setError('Puedes explorar sin cuenta. Inicia sesión solo si quieres guardar propiedades.');
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

    if (filters.propertyType) {
      chips.push({
        key: 'propertyType',
        label: getPropertyTypeLabel(filters.propertyType.toUpperCase()),
      });
    }
    if (filters.city) chips.push({ key: 'city', label: filters.city });
    if (filters.minRent !== 0 || filters.maxRent !== 9000000) {
      chips.push({
        key: 'rent',
        label: `${formatCurrency(filters.minRent)} - ${formatCurrency(filters.maxRent)}`,
      });
    }
    if (filters.bedrooms !== 0) chips.push({ key: 'bedrooms', label: `${filters.bedrooms} hab.` });
    if (filters.bathrooms !== 0) chips.push({ key: 'bathrooms', label: `${filters.bathrooms} banos` });
    filters.extras.forEach((extra) => chips.push({ key: extra, label: EXTRA_LABELS[extra] }));

    return chips;
  }, [filters]);

  const dismissChip = (key) => {
    if (key === 'propertyType') return setFilter('propertyType', '');
    if (key === 'city') return setFilter('city', '');
    if (key === 'rent') {
      setFilter('minRent', 0);
      setFilter('maxRent', 9000000);
      return;
    }
    if (key === 'bedrooms') return setFilter('bedrooms', 0);
    if (key === 'bathrooms') return setFilter('bathrooms', 0);
    toggleExtra(key);
  };

  const applyQuickSearch = (chip) => {
    if (chip.extra) {
      if (!filters.extras.includes(chip.extra)) {
        toggleExtra(chip.extra);
      }
      return;
    }

    setFilter(chip.field, chip.value);
  };

  const showPopularResults = () => {
    clearFilters();
    setFilter('city', 'Bogotá');
    setFilter('propertyType', '');
    setFilter('minRent', 0);
    setFilter('maxRent', 9000000);
    setFilter('bedrooms', 0);
    setFilter('bathrooms', 0);
  };

  return (
    <div className="page page--search search-page">
      <section className="section section--compact">
        <form
          className="search-command"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <label className="search-command__field search-command__field--location">
            <span>¿Dónde quieres vivir?</span>
            <input
              type="text"
              placeholder="Ciudad, barrio o zona"
              value={filters.city}
              onChange={(event) => setFilter('city', event.target.value)}
            />
          </label>

          <label className="search-command__field">
            <span>Presupuesto</span>
            <select
              value={budgetSelectValue}
              onChange={(event) => {
                if (event.target.value !== 'custom') {
                  setFilter('maxRent', Number(event.target.value));
                }
              }}
            >
              {budgetSelectValue === 'custom' ? (
                <option value="custom">Hasta {formatCurrency(filters.maxRent)}</option>
              ) : null}
              {SEARCH_BUDGET_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="search-command__field">
            <span>Tipo de vivienda</span>
            <select
              value={filters.propertyType}
              onChange={(event) => setFilter('propertyType', event.target.value)}
            >
              {SEARCH_PROPERTY_TYPES.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" className="search-command__button">
            <Search size={18} />
            Buscar
          </button>

          <div className="search-command__chips" aria-label="Filtros rápidos">
            <span>Rápido:</span>
            {QUICK_SEARCH_CHIPS.map((chip) => {
              const active = chip.extra
                ? filters.extras.includes(chip.extra)
                : filters[chip.field] === chip.value;

              return (
                <button
                  key={chip.key}
                  type="button"
                  className={`search-command__chip ${active ? 'search-command__chip--active' : ''}`}
                  onClick={() => applyQuickSearch(chip)}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </form>

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
                <span className="section__eyebrow">Resultados</span>
                <h1>
                  {loading
                    ? `Buscando en ${filters.city || 'Colombia'}`
                    : `${properties.length} propiedades encontradas`}
                </h1>
                <p>
                  Compara precio, ubicación y atributos clave sin perder de vista tus filtros.
                </p>
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
                  {mapView ? 'Lista' : 'Mapa'}
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
            <div className={`search-results__content ${mapView ? 'search-results__content--with-map' : ''}`}>
              <div className="search-results__list">
                {loading ? (
                  <div className="property-grid property-grid--results">
                    <PropertyCardSkeleton count={mapView ? 4 : 8} variant="compact" />
                  </div>
                ) : properties.length ? (
                  <div className="property-grid property-grid--results">
                    {properties.map((property) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        variant="compact"
                        onToggleFavorite={toggleFavorite}
                        disabledFavorite={savingFavorite === property.id}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No hay propiedades que coincidan"
                    description="Prueba ampliar el presupuesto, quitar un filtro o revisar una zona cercana."
                    actionLabel="Limpiar filtros"
                    onAction={clearFilters}
                    secondaryActionLabel="Ver populares"
                    onSecondaryAction={showPopularResults}
                  />
                )}
              </div>

              {mapView ? (
                <aside className="search-map-panel" aria-label="Mapa referencial de resultados">
                  <div className="search-map-panel__header">
                    <span>Mapa</span>
                    <strong>{filters.city || 'Colombia'}</strong>
                  </div>
                  <div className="search-map-panel__canvas">
                    <span className="search-map-panel__city">{filters.city || 'Zonas principales'}</span>
                    {(properties.length ? properties : []).slice(0, 5).map((property, index) => (
                      <span
                        key={property.id}
                        className="search-map-pin"
                        style={MAP_PIN_POSITIONS[index]}
                      >
                        {formatCurrency(property.monthlyRent).replace(/\s/g, '')}
                      </span>
                    ))}
                  </div>
                  <p>Usa la vista dividida para comparar zonas sin salir de la lista.</p>
                </aside>
              ) : null}
            </div>
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
