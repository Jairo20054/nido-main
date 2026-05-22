import React, { useState } from 'react';
import { ChevronDown, MapPin, SlidersHorizontal, X } from 'lucide-react';
import { formatCurrency } from '../../lib/formatters';
import {
  AMENITY_OPTIONS,
  BATHROOM_OPTIONS,
  BEDROOM_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  RADIUS_OPTIONS,
} from './propertySearchConfig';

function FilterSection({ title, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className={`property-filter-section ${isOpen ? 'property-filter-section--open' : ''}`}>
      <button
        type="button"
        className="property-filter-section__trigger"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
      >
        {title}
        <ChevronDown size={15} aria-hidden="true" />
      </button>
      <div className="property-filter-section__content">{children}</div>
    </section>
  );
}

function PriceInput({ id, label, value, onChange }) {
  return (
    <label className="price-filter-input" htmlFor={id}>
      <span>{label}</span>
      <input
        id={id}
        inputMode="numeric"
        type="number"
        min="0"
        step="100000"
        value={value || ''}
        onChange={(event) => onChange(Number(event.target.value || 0))}
        placeholder="$0"
      />
    </label>
  );
}

function PriceRange({ filters, onChange }) {
  const rawMax = filters.maxRent > 0 ? filters.maxRent : 9000000;
  const maxValue = Math.min(9000000, Math.max(rawMax, 100000));
  const minValue = Math.min(Math.max(filters.minRent, 0), maxValue - 100000);
  const left = (minValue / 9000000) * 100;
  const right = (maxValue / 9000000) * 100;

  const setMin = (value) => onChange('minRent', Math.max(0, Math.min(value, maxValue - 100000)));
  const setMax = (value) => onChange('maxRent', Math.min(9000000, Math.max(value, minValue + 100000)));

  return (
    <div className="price-filter">
      <div className="price-filter__summary">
        <span>{formatCurrency(filters.minRent)}</span>
        <span>{filters.maxRent >= 9000000 ? '$9.000.000+' : formatCurrency(filters.maxRent)}</span>
      </div>
      <div className="price-filter__inputs">
        <PriceInput id="minRent" label="Minimo" value={filters.minRent} onChange={setMin} />
        <PriceInput id="maxRent" label="Maximo" value={filters.maxRent} onChange={setMax} />
      </div>
      <div className="price-filter__track">
        <span className="price-filter__rail" />
        <span className="price-filter__fill" style={{ left: `${left}%`, width: `${right - left}%` }} />
        <input
          type="range"
          min="0"
          max="9000000"
          step="100000"
          value={minValue}
          aria-label="Presupuesto minimo"
          onChange={(event) => setMin(Number(event.target.value))}
        />
        <input
          type="range"
          min="0"
          max="9000000"
          step="100000"
          value={maxValue}
          aria-label="Presupuesto maximo"
          onChange={(event) => setMax(Number(event.target.value))}
        />
      </div>
    </div>
  );
}

export function PropertyFilters({
  filters,
  activeCount,
  onChange,
  onToggleExtra,
  onTogglePropertyType,
  onClear,
  onDismiss,
  resultCount = 0,
}) {
  return (
    <form className="property-filters" onSubmit={(event) => event.preventDefault()}>
      <div className="property-filters__header">
        <div>
          <h2>Filtros</h2>
          <p>{activeCount ? `${activeCount} activos` : 'Ajusta tu busqueda'}</p>
        </div>
        <div className="property-filters__header-actions">
          <button type="button" className="property-filters__clear" onClick={onClear}>
            Limpiar todo
          </button>
          {onDismiss ? (
            <button
              type="button"
              className="property-filters__dismiss"
              onClick={onDismiss}
              aria-label="Cerrar filtros"
            >
              <X size={18} />
            </button>
          ) : null}
        </div>
      </div>

      <FilterSection title="Ubicacion">
        <div className="selected-location">
          <MapPin size={15} aria-hidden="true" />
          <span>{filters.city || 'Elige ciudad, barrio o zona'}</span>
          {filters.city ? (
            <button type="button" onClick={() => onChange('city', '')} aria-label="Limpiar ubicacion">
              <X size={14} />
            </button>
          ) : null}
        </div>
        <label className="property-filter-field" htmlFor="filter-city">
          <span>Ciudad / zona seleccionada</span>
          <input
            id="filter-city"
            value={filters.city}
            onChange={(event) => onChange('city', event.target.value)}
            placeholder="Medellin, Chapinero, El Poblado"
          />
        </label>
        <div className="radius-selector" aria-label="Radio de busqueda">
          <div className="radius-selector__label">
            <span>Radio de busqueda</span>
            <strong>{filters.radius === 0.5 ? '500 m' : `${filters.radius} km`}</strong>
          </div>
          <div className="radius-selector__options">
            {RADIUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={filters.radius === option.value ? 'is-active' : ''}
                onClick={() => onChange('radius', option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <small>Preparado para busqueda geografica real cuando el backend exponga coordenadas por radio.</small>
        </div>
      </FilterSection>

      <FilterSection title="Presupuesto mensual">
        <PriceRange filters={filters} onChange={onChange} />
      </FilterSection>

      <FilterSection title="Tipo de propiedad">
        <div className="property-filter-card-grid">
          {PROPERTY_TYPE_OPTIONS.map(({ value, label, icon: Icon }) => {
            const active = filters.propertyTypes.includes(value);

            return (
              <button
                key={value}
                type="button"
                className={active ? 'is-active' : ''}
                onClick={() => onTogglePropertyType(value)}
                aria-pressed={active}
              >
                <Icon size={17} aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Habitaciones">
        <div className="segmented-options" role="group" aria-label="Habitaciones">
          {BEDROOM_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={filters.bedrooms === option.value ? 'is-active' : ''}
              onClick={() => onChange('bedrooms', filters.bedrooms === option.value ? 0 : option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Banos">
        <div className="segmented-options" role="group" aria-label="Banos">
          {BATHROOM_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={filters.bathrooms === option.value ? 'is-active' : ''}
              onClick={() => onChange('bathrooms', filters.bathrooms === option.value ? 0 : option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Amenidades">
        <div className="amenity-checklist">
          {AMENITY_OPTIONS.slice(0, 7).map(({ value, label, icon: Icon }) => (
            <label key={value} className="amenity-check">
              <input
                type="checkbox"
                checked={filters.extras.includes(value)}
                onChange={() => onToggleExtra(value)}
              />
              <span aria-hidden="true">
                <Icon size={15} />
              </span>
              {label}
            </label>
          ))}
        </div>
        <details className="amenity-more">
          <summary>Ver mas</summary>
          <div className="amenity-checklist">
            {AMENITY_OPTIONS.slice(7).map(({ value, label, icon: Icon }) => (
              <label key={value} className="amenity-check">
                <input
                  type="checkbox"
                  checked={filters.extras.includes(value)}
                  onChange={() => onToggleExtra(value)}
                />
                <span aria-hidden="true">
                  <Icon size={15} />
                </span>
                {label}
              </label>
            ))}
          </div>
        </details>
      </FilterSection>

      <div className="property-filters__footer">
        <div>
          <SlidersHorizontal size={15} aria-hidden="true" />
          {resultCount} propiedades visibles
        </div>
        {onDismiss ? (
          <button className="property-filters__apply" type="button" onClick={onDismiss}>
            Ver resultados
          </button>
        ) : null}
      </div>
    </form>
  );
}
