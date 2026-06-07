import React, { useEffect, useId, useRef, useState } from 'react';
import {
  Bath,
  BedDouble,
  Building2,
  Car,
  CheckCircle2,
  ChevronDown,
  HeartHandshake,
  Home,
  MapPin,
  PawPrint,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sofa,
  Sparkles,
  WalletCards,
  X,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { formatCurrency } from '../../lib/formatters';
import { PropertyCard } from '../properties/PropertyCard';
import { PropertyCardSkeleton } from '../properties/PropertyCardSkeleton';
import { useHomePropertySearch } from './useHomePropertySearch';

const BUDGET_OPTIONS = [
  { value: 'all', label: 'Sin limite', minRent: 0, maxRent: 9000000 },
  { value: '0-1500000', label: 'Hasta $1.5M', minRent: 0, maxRent: 1500000 },
  { value: '1500000-2500000', label: '$1.5M - $2.5M', minRent: 1500000, maxRent: 2500000 },
  { value: '2500000-4000000', label: '$2.5M - $4M', minRent: 2500000, maxRent: 4000000 },
  { value: '4000000-9000000', label: 'Mas de $4M', minRent: 4000000, maxRent: 9000000 },
];

const HERO_IMAGES = [
  '/images/hero/hero-colombia-1.png',
  '/images/hero/hero-colombia-2.png',
  '/images/hero/hero-colombia-3.png',
  '/images/hero/hero-colombia-4.png',
];

const HERO_FALLBACK_IMAGE = '/images/sofa.jpg';
const HERO_ROTATION_INTERVAL = 6000;

const PROPERTY_TYPES = [
  { value: '', label: 'Cualquier tipo', icon: Home },
  { value: 'apartment', label: 'Apartamento', icon: Building2 },
  { value: 'house', label: 'Casa', icon: Home },
  { value: 'studio', label: 'Apartaestudio', icon: Sofa },
  { value: 'room', label: 'Habitacion', icon: BedDouble },
];

const ROOM_OPTIONS = [
  { value: 0, label: 'Cualquiera' },
  { value: 1, label: '1 habitacion' },
  { value: 2, label: '2 habitaciones' },
  { value: 3, label: '3 habitaciones' },
  { value: 4, label: '4+ habitaciones' },
];

const BATHROOM_OPTIONS = [
  { value: 0, label: 'Cualquiera' },
  { value: 1, label: '1 baño' },
  { value: 2, label: '2 baños' },
  { value: 3, label: '3+ baños' },
];

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recomendadas' },
  { value: 'rent-asc', label: 'Menor precio' },
  { value: 'rent-desc', label: 'Mayor precio' },
  { value: 'latest', label: 'Más recientes' },
  { value: 'area-desc', label: 'Mayor area' },
];

const QUICK_FILTERS = [
  { label: 'Bogota', patch: { location: 'Bogota' }, isActive: (filters) => filters.location === 'Bogota' },
  { label: 'Medellin', patch: { location: 'Medellin' }, isActive: (filters) => filters.location === 'Medellin' },
  { label: 'Cali', patch: { location: 'Cali' }, isActive: (filters) => filters.location === 'Cali' },
  { label: 'Apartamentos', patch: { propertyType: 'apartment' }, isActive: (filters) => filters.propertyType === 'apartment' },
  { label: 'Casas', patch: { propertyType: 'house' }, isActive: (filters) => filters.propertyType === 'house' },
  { label: 'Amoblados', extra: 'furnished' },
  { label: 'Mascotas', extra: 'petsAllowed' },
];

const EXTRA_FILTERS = [
  { value: 'furnished', label: 'Amoblado', icon: Sofa },
  { value: 'petsAllowed', label: 'Mascotas', icon: PawPrint },
  { value: 'parking', label: 'Parqueadero', icon: Car },
  { value: 'elevator', label: 'Ascensor', icon: ChevronDown },
  { value: 'balcony', label: 'Balcon', icon: Home },
  { value: 'security', label: 'Vigilancia', icon: ShieldCheck },
];

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: 'Propiedades verificadas',
    description: 'Anuncios revisados antes de llegar a ti.',
  },
  {
    icon: WalletCards,
    title: 'Costos claros',
    description: 'Arriendo, administracion y condiciones visibles.',
  },
  {
    icon: Search,
    title: 'Busqueda simple',
    description: 'Filtra y compara sin salir del inicio.',
  },
  {
    icon: HeartHandshake,
    title: 'Atencion confiable',
    description: 'Procesos guiados para arrendar con calma.',
  },
];

const getBudgetValue = (filters) => {
  const match = BUDGET_OPTIONS.find(
    (option) => option.minRent === filters.minRent && option.maxRent === filters.maxRent
  );

  return match?.value || 'custom';
};

const scrollToResults = (resultsRef) => {
  window.setTimeout(() => {
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 80);
};

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mediaQuery) return undefined;

    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);

    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  return prefersReducedMotion;
}

export function HomePage() {
  const resultsRef = useRef(null);
  const location = useLocation();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  const [failedHeroImages, setFailedHeroImages] = useState([]);
  const prefersReducedMotion = usePrefersReducedMotion();
  const {
    filters,
    appliedFilters,
    results,
    totalCount,
    loading,
    error,
    savingFavorite,
    activeCount,
    hasActiveSearch,
    defaultFilters,
    setFilter,
    patchFilters,
    toggleExtra,
    clearFilters,
    runSearch,
    toggleFavorite,
  } = useHomePropertySearch();
  const availableHeroImages = HERO_IMAGES.filter((image) => !failedHeroImages.includes(image));
  const heroImages = availableHeroImages.length ? availableHeroImages : [HERO_FALLBACK_IMAGE];
  const activeHeroImage = Math.min(currentHeroImage, heroImages.length - 1);

  useEffect(() => {
    if (location.hash === '#buscar') {
      window.setTimeout(() => {
        document.getElementById('buscar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    }
  }, [location.hash]);

  useEffect(() => {
    if (currentHeroImage <= heroImages.length - 1) return;
    setCurrentHeroImage(0);
  }, [currentHeroImage, heroImages.length]);

  useEffect(() => {
    if (prefersReducedMotion || heroImages.length < 2) return undefined;

    const interval = window.setInterval(() => {
      setCurrentHeroImage((current) => (current + 1) % heroImages.length);
    }, HERO_ROTATION_INTERVAL);

    return () => window.clearInterval(interval);
  }, [heroImages.length, prefersReducedMotion]);

  const handleHeroImageError = (image) => {
    if (image === HERO_FALLBACK_IMAGE) return;
    setFailedHeroImages((current) => (current.includes(image) ? current : [...current, image]));
  };

  const submitSearch = (event) => {
    event.preventDefault();
    runSearch(filters);
    scrollToResults(resultsRef);
  };

  const applyQuickFilter = (quickFilter) => {
    if (quickFilter.extra) {
      const nextExtras = filters.extras.includes(quickFilter.extra)
        ? filters.extras.filter((extra) => extra !== quickFilter.extra)
        : [...filters.extras, quickFilter.extra];
      patchFilters({ extras: nextExtras }, true);
      scrollToResults(resultsRef);
      return;
    }

    patchFilters(quickFilter.patch, true);
    scrollToResults(resultsRef);
  };

  const applyFilters = () => {
    runSearch(filters);
    setFiltersOpen(false);
    scrollToResults(resultsRef);
  };

  const resetFilters = () => {
    clearFilters(true);
    scrollToResults(resultsRef);
  };

  return (
    <div className="home-page home-page--nido">
      <section className="home-hero home-hero--image" id="buscar">
        <div className="home-hero__content">
          <div className="home-hero__media" aria-hidden="true">
            {heroImages.map((image, index) => (
              <img
                key={image}
                src={image}
                alt=""
                className={`home-hero__image ${index === activeHeroImage ? 'is-active' : ''}`}
                loading={index === 0 ? 'eager' : 'lazy'}
                onError={() => handleHeroImageError(image)}
              />
            ))}
            <div className="home-hero__overlay" />
          </div>
          <div className="home-hero__intro">
            <span className="hero-kicker">
              <Sparkles size={14} aria-hidden="true" />
              Arriendos claros en Colombia
            </span>
            <h1 className="home-hero__title">Tu próximo hogar, sin complicaciones</h1>
            <p className="home-hero__subtitle">
              Encuentra arriendos confiables con información clara, propiedades verificadas y
              procesos simples.
            </p>
          </div>

          <HomeSearchForm
            filters={filters}
            activeCount={activeCount}
            onChange={setFilter}
            onSearch={submitSearch}
            onOpenMoreFilters={() => setFiltersOpen(true)}
          />

          <QuickSearches filters={filters} onSelect={applyQuickFilter} />
        </div>
      </section>

      <section className="home-results" ref={resultsRef} aria-labelledby="home-results-title">
        <div className="home-results__heading">
          <div>
            <span className="section__eyebrow home-results__eyebrow">
              <MapPin size={14} aria-hidden="true" />
              {hasActiveSearch ? 'Busqueda activa' : 'Recomendadas'}
            </span>
            <h2 id="home-results-title">
              {hasActiveSearch ? 'Propiedades encontradas' : 'Propiedades recomendadas cerca de ti'}
            </h2>
            <p>
              {hasActiveSearch
                ? `${totalCount || results.length} opciones segun tus filtros${appliedFilters.location ? ` en ${appliedFilters.location}` : ''}.`
                : 'Explora viviendas publicadas recientemente y ajusta filtros sin cambiar de pantalla.'}
            </p>
          </div>
          <div className="home-results__actions">
            <label className="home-sort-control" htmlFor="home-sort">
              <span>Ordenar</span>
              <select id="home-sort" value={filters.sort} onChange={(event) => patchFilters({ sort: event.target.value }, true)}>
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            {hasActiveSearch ? (
              <button type="button" className="home-clear-button" onClick={resetFilters}>
                <RotateCcw size={16} aria-hidden="true" />
                Limpiar filtros
              </button>
            ) : null}
          </div>
        </div>

        <InlineMessage tone="danger">{error}</InlineMessage>

        {loading ? (
          <div className="property-grid property-grid--home">
            <PropertyCardSkeleton count={8} variant="home" />
          </div>
        ) : results.length > 0 ? (
          <div className="property-grid property-grid--home">
            {results.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                variant="home"
                proximityLabel={property.isExample ? 'Ejemplo' : property.verificationDetails ? 'Verificada' : 'Recomendada'}
                onToggleFavorite={property.isExample ? undefined : toggleFavorite}
                disabledFavorite={savingFavorite === property.id}
              />
            ))}
          </div>
        ) : (
          <HomeEmptyState hasFilters={hasActiveSearch} onClear={resetFilters} />
        )}
      </section>

      <BenefitHighlights />

      <MoreFiltersModal
        open={filtersOpen}
        filters={filters}
        defaultFilters={defaultFilters}
        activeCount={activeCount}
        onChange={setFilter}
        onToggleExtra={toggleExtra}
        onClear={() => clearFilters(false)}
        onDismiss={() => setFiltersOpen(false)}
        onApply={applyFilters}
      />
    </div>
  );
}

function HomeSearchForm({ filters, activeCount, onChange, onSearch, onOpenMoreFilters }) {
  const budgetValue = getBudgetValue(filters);

  return (
    <form className="home-search" onSubmit={onSearch}>
      <label className="home-search__field home-search__field--location" htmlFor="home-location">
        <span className="home-search__icon">
          <MapPin size={20} aria-hidden="true" />
        </span>
        <span className="home-search__label">Ciudad o zona</span>
        <input
          id="home-location"
          type="text"
          list="home-popular-cities"
          placeholder="Ciudad, barrio o zona"
          value={filters.location}
          onChange={(event) => onChange('location', event.target.value)}
        />
      </label>

      <FilterDropdown
        id="home-budget"
        label="Presupuesto"
        icon={WalletCards}
        value={budgetValue}
        options={budgetValue === 'custom' ? [{ value: 'custom', label: 'Rango personalizado' }, ...BUDGET_OPTIONS] : BUDGET_OPTIONS}
        onChange={(value) => {
          const option = BUDGET_OPTIONS.find((item) => item.value === value);
          if (!option) return;
          onChange('minRent', option.minRent);
          onChange('maxRent', option.maxRent);
        }}
      />

      <FilterDropdown
        id="home-property-type"
        label="Tipo de vivienda"
        icon={Home}
        value={filters.propertyType}
        options={PROPERTY_TYPES}
        onChange={(value) => onChange('propertyType', value)}
      />

      <FilterDropdown
        id="home-rooms"
        label="Habitaciones"
        icon={BedDouble}
        value={filters.rooms}
        options={ROOM_OPTIONS}
        onChange={(value) => onChange('rooms', value)}
      />

      <button
        type="button"
        className="home-search__more"
        onClick={onOpenMoreFilters}
        aria-label="Abrir mas filtros"
      >
        <SlidersHorizontal size={18} aria-hidden="true" />
        <span>Mas filtros</span>
        {activeCount ? <strong>{activeCount}</strong> : null}
      </button>

      <button type="submit" className="home-search__button">
        <Search size={20} aria-hidden="true" />
        Buscar
      </button>

      <datalist id="home-popular-cities">
        <option value="Bogota" />
        <option value="Medellin" />
        <option value="Cali" />
        <option value="Barranquilla" />
        <option value="Envigado" />
      </datalist>
    </form>
  );
}

function FilterDropdown({ id, label, value, options, onChange, icon: Icon }) {
  const generatedId = useId();
  const buttonId = id || generatedId;
  const menuId = `${buttonId}-menu`;
  const dropdownRef = useRef(null);
  const selectedOption = options.find((option) => String(option.value) === String(value)) || options[0];
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const selectOption = (nextValue) => {
    onChange(nextValue);
    setOpen(false);
  };

  return (
    <div className="home-search__field home-filter-dropdown" ref={dropdownRef}>
      <span className="home-search__icon">
        <Icon size={20} aria-hidden="true" />
      </span>
      <span className="home-search__label" id={`${buttonId}-label`}>
        {label}
      </span>
      <button
        id={buttonId}
        type="button"
        className="home-filter-dropdown__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${buttonId}-label ${buttonId}`}
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{selectedOption?.label}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>

      {open ? (
        <div className="home-filter-dropdown__menu" id={menuId} role="listbox" aria-labelledby={`${buttonId}-label`}>
          {options.map((option) => {
            const OptionIcon = option.icon;
            const active = String(option.value) === String(value);

            return (
              <button
                key={`${option.value || 'all'}-${option.label}`}
                type="button"
                className={`home-filter-dropdown__option ${active ? 'is-active' : ''}`}
                role="option"
                aria-selected={active}
                onClick={() => selectOption(option.value)}
              >
                {OptionIcon ? <OptionIcon size={16} aria-hidden="true" /> : null}
                <span>{option.label}</span>
                {active ? <CheckCircle2 size={16} aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function QuickSearches({ filters, onSelect }) {
  return (
    <div className="home-quick-row" aria-label="Busquedas rapidas">
      <span>Busquedas rapidas:</span>
      {QUICK_FILTERS.map((quickFilter) => {
        const active = quickFilter.extra
          ? filters.extras.includes(quickFilter.extra)
          : quickFilter.isActive(filters);

        return (
          <button
            key={quickFilter.label}
            type="button"
            className={`home-city-chip ${active ? 'home-city-chip--active' : ''}`}
            onClick={() => onSelect(quickFilter)}
            aria-pressed={active}
          >
            {quickFilter.label}
          </button>
        );
      })}
    </div>
  );
}

function MoreFiltersModal({
  open,
  filters,
  defaultFilters,
  activeCount,
  onChange,
  onToggleExtra,
  onClear,
  onDismiss,
  onApply,
}) {
  if (!open) return null;

  return (
    <div className="home-filter-modal" role="dialog" aria-modal="true" aria-labelledby="home-filter-title">
      <button type="button" className="home-filter-modal__backdrop" onClick={onDismiss} aria-label="Cerrar filtros" />
      <div className="home-filter-modal__panel">
        <div className="home-filter-modal__header">
          <div>
            <span className="section__eyebrow">{activeCount ? `${activeCount} activos` : 'Ajusta tu busqueda'}</span>
            <h2 id="home-filter-title">Mas filtros</h2>
          </div>
          <button type="button" className="home-filter-modal__close" onClick={onDismiss} aria-label="Cerrar filtros">
            <X size={19} />
          </button>
        </div>

        <div className="home-filter-modal__content">
          <section className="home-filter-group">
            <h3>Rango de precio</h3>
            <div className="home-filter-grid home-filter-grid--two">
              <label className="home-filter-input" htmlFor="home-min-rent">
                <span>Minimo</span>
                <input
                  id="home-min-rent"
                  type="number"
                  min="0"
                  step="100000"
                  value={filters.minRent || ''}
                  placeholder="$0"
                  onChange={(event) => onChange('minRent', event.target.value || defaultFilters.minRent)}
                />
              </label>
              <label className="home-filter-input" htmlFor="home-max-rent">
                <span>Maximo</span>
                <input
                  id="home-max-rent"
                  type="number"
                  min="0"
                  step="100000"
                  value={filters.maxRent === defaultFilters.maxRent ? '' : filters.maxRent}
                  placeholder="$9.000.000+"
                  onChange={(event) => onChange('maxRent', event.target.value || defaultFilters.maxRent)}
                />
              </label>
            </div>
            <p className="home-filter-summary">
              {formatCurrency(filters.minRent)} -{' '}
              {filters.maxRent >= defaultFilters.maxRent ? '$9.000.000+' : formatCurrency(filters.maxRent)}
            </p>
          </section>

          <section className="home-filter-group">
            <h3>Tipo de propiedad</h3>
            <div className="home-option-grid">
              {PROPERTY_TYPES.filter((option) => option.value).map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  className={filters.propertyType === value ? 'is-active' : ''}
                  onClick={() => onChange('propertyType', filters.propertyType === value ? '' : value)}
                  aria-pressed={filters.propertyType === value}
                >
                  <Icon size={18} aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
          </section>

          <section className="home-filter-group">
            <h3>Espacios</h3>
            <div className="home-filter-grid home-filter-grid--two">
              <div className="home-filter-input">
                <span>Habitaciones</span>
                <FilterDropdown
                  id="home-filter-rooms"
                  label="Habitaciones"
                  icon={BedDouble}
                  value={filters.rooms}
                  options={ROOM_OPTIONS}
                  onChange={(value) => onChange('rooms', value)}
                />
              </div>
              <div className="home-filter-input">
                <span>Banos</span>
                <FilterDropdown
                  id="home-filter-bathrooms"
                  label="Banos"
                  icon={Bath}
                  value={filters.bathrooms}
                  options={BATHROOM_OPTIONS}
                  onChange={(value) => onChange('bathrooms', value)}
                />
              </div>
              <label className="home-filter-input" htmlFor="home-filter-area">
                <span>Area aproximada desde</span>
                <input
                  id="home-filter-area"
                  type="number"
                  min="0"
                  step="5"
                  value={filters.area || ''}
                  placeholder="Ej: 60 m2"
                  onChange={(event) => onChange('area', event.target.value || defaultFilters.area)}
                />
              </label>
              <label className="home-filter-input" htmlFor="home-filter-date">
                <span>Disponible desde</span>
                <input
                  id="home-filter-date"
                  type="date"
                  value={filters.availableFrom}
                  onChange={(event) => onChange('availableFrom', event.target.value)}
                />
              </label>
            </div>
          </section>

          <section className="home-filter-group">
            <h3>Comodidades</h3>
            <div className="home-amenity-grid">
              {EXTRA_FILTERS.map(({ value, label, icon: Icon }) => (
                <label key={value} className="home-amenity-check">
                  <input
                    type="checkbox"
                    checked={filters.extras.includes(value)}
                    onChange={() => onToggleExtra(value)}
                  />
                  <span aria-hidden="true">
                    <Icon size={16} />
                  </span>
                  {label}
                </label>
              ))}
            </div>
          </section>
        </div>

        <div className="home-filter-modal__footer">
          <button type="button" className="home-clear-button" onClick={onClear}>
            <RotateCcw size={16} aria-hidden="true" />
            Limpiar filtros
          </button>
          <button type="button" className="home-filter-modal__apply" onClick={onApply}>
            Aplicar filtros
          </button>
        </div>
      </div>
    </div>
  );
}

function HomeEmptyState({ hasFilters, onClear }) {
  return (
    <section className="home-empty-state" aria-live="polite">
      <span className="home-empty-state__icon">
        <Home size={30} aria-hidden="true" />
      </span>
      <h2>{hasFilters ? 'No encontramos viviendas con estos filtros' : 'Aun no hay propiedades publicadas'}</h2>
      <p>
        {hasFilters
          ? 'Prueba ampliar el presupuesto, cambiar la zona o quitar alguna comodidad.'
          : 'Cuando haya viviendas disponibles las veras aqui sin tener que cambiar de pagina.'}
      </p>
      {hasFilters ? (
        <button type="button" className="home-filter-modal__apply" onClick={onClear}>
          Limpiar y ver recomendadas
        </button>
      ) : null}
    </section>
  );
}

function BenefitHighlights() {
  return (
    <section className="home-benefits" aria-label="Beneficios de Nido">
      {BENEFITS.map(({ icon: Icon, title, description }) => (
        <article key={title} className="home-benefit">
          <span className="home-benefit__icon">
            <Icon size={22} aria-hidden="true" />
          </span>
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
        </article>
      ))}
      <div className="home-benefits__trust" aria-hidden="true">
        <CheckCircle2 size={18} />
        <Bath size={18} />
        <BedDouble size={18} />
      </div>
    </section>
  );
}
