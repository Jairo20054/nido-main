import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, RotateCcw, X } from 'lucide-react';
import {
  AMENITY_OPTIONS,
  PARKING_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
} from './propertySearchConfig';
import {
  DEFAULT_SEARCH_FILTERS,
  PRICE_FILTER_LIMIT,
} from './searchFilterParams';

const BEDROOM_OPTIONS = [0, 1, 2, 3, 4];
const BATHROOM_OPTIONS = [0, 1, 2, 3];

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

function CountSegment({ label, exact, value, options, onExactChange, onValueChange }) {
  return (
    <div className="property-filter-count-card">
      <div className="property-filter-count-card__header">
        <strong>{label}</strong>
        <label className="property-filter-switch">
          <input type="checkbox" checked={exact} onChange={(event) => onExactChange(event.target.checked)} />
          <span>Numero exacto</span>
        </label>
      </div>
      <div className="property-filter-segmented">
        {options.map((option) => (
          <button
            key={`${label}-${option}`}
            type="button"
            className={value === option ? 'is-active' : ''}
            onClick={() => onValueChange(option)}
          >
            {option === 0 ? 'Todos' : option >= 4 && label === 'Habitaciones' ? '4+' : option >= 3 && label === 'Banos' ? '3+' : `${option}+`}
          </button>
        ))}
      </div>
    </div>
  );
}

export function PropertyFilters({
  filters,
  activeCount,
  onApply,
  onClear,
  onDismiss,
  resultCount = 0,
  advancedOnly = false,
}) {
  const [draft, setDraft] = useState(filters);

  useEffect(() => {
    setDraft(filters);
  }, [filters]);

  const hasInvalidPrice = !advancedOnly && draft.minRent > draft.maxRent;

  const updateField = (field, value) => {
    setDraft((current) => ({
      ...current,
      [field]:
        ['minRent', 'maxRent', 'bedrooms', 'bathrooms', 'minArea', 'maxArea'].includes(field)
          ? Number(value) || 0
          : field === 'parking' || field === 'strata'
            ? value === '' ? '' : String(value)
            : value,
    }));
  };

  const togglePropertyType = (value) => {
    setDraft((current) => ({
      ...current,
      propertyTypes: current.propertyTypes.includes(value)
        ? current.propertyTypes.filter((item) => item !== value)
        : [...current.propertyTypes, value],
    }));
  };

  const toggleExtra = (value) => {
    setDraft((current) => ({
      ...current,
      extras: current.extras.includes(value)
        ? current.extras.filter((item) => item !== value)
        : [...current.extras, value],
    }));
  };

  const selectedExtras = useMemo(
    () => AMENITY_OPTIONS.filter((option) => draft.extras.includes(option.value)),
    [draft.extras]
  );

  return (
    <form
      className="property-filters property-filters--modal"
      onSubmit={(event) => {
        event.preventDefault();
        if (!hasInvalidPrice) {
          onApply(draft);
        }
      }}
    >
      <div className="property-filters__header">
        <div>
          <h2>Mas filtros</h2>
          <p>{activeCount ? `${activeCount} activos` : 'Afina tu busqueda'}</p>
        </div>
        <div className="property-filters__header-actions">
          <button type="button" className="property-filters__clear" onClick={onClear}>
            Limpiar todo
          </button>
          <button
            type="button"
            className="property-filters__dismiss"
            onClick={onDismiss}
            aria-label="Cerrar filtros"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {!advancedOnly ? (
        <>
          <FilterSection title="Ubicacion">
            <div className="property-filter-field-grid">
              <label className="property-filter-field" htmlFor="filter-location">
                <span>Busqueda libre</span>
                <input
                  id="filter-location"
                  value={draft.location}
                  onChange={(event) => updateField('location', event.target.value)}
                  placeholder="Cali, Laureles, Chapinero..."
                />
              </label>
              <label className="property-filter-field" htmlFor="filter-city">
                <span>Ciudad</span>
                <input
                  id="filter-city"
                  value={draft.city}
                  onChange={(event) => updateField('city', event.target.value)}
                  placeholder="Cali"
                />
              </label>
              <label className="property-filter-field" htmlFor="filter-neighborhood">
                <span>Barrio</span>
                <input
                  id="filter-neighborhood"
                  value={draft.neighborhood}
                  onChange={(event) => updateField('neighborhood', event.target.value)}
                  placeholder="Granada"
                />
              </label>
              <label className="property-filter-field" htmlFor="filter-department">
                <span>Departamento</span>
                <input
                  id="filter-department"
                  value={draft.department}
                  onChange={(event) => updateField('department', event.target.value)}
                  placeholder="Valle del Cauca"
                />
              </label>
            </div>
          </FilterSection>

          <FilterSection title="Tipo de inmueble">
            <div className="property-filter-card-grid">
              {PROPERTY_TYPE_OPTIONS.map(({ value, label, icon: Icon }) => {
                const active = draft.propertyTypes.includes(value);

                return (
                  <button
                    key={value}
                    type="button"
                    className={active ? 'is-active' : ''}
                    onClick={() => togglePropertyType(value)}
                    aria-pressed={active}
                  >
                    <Icon size={17} aria-hidden="true" />
                    {label}
                  </button>
                );
              })}
            </div>
          </FilterSection>

          <FilterSection title="Precio y parqueadero">
            <div className="property-filter-field-grid">
              <label className="property-filter-field" htmlFor="filter-min-rent">
                <span>Precio minimo</span>
                <input
                  id="filter-min-rent"
                  type="number"
                  min="0"
                  step="100000"
                  value={draft.minRent || ''}
                  onChange={(event) => updateField('minRent', event.target.value)}
                  placeholder="800000"
                />
              </label>
              <label className="property-filter-field" htmlFor="filter-max-rent">
                <span>Precio maximo</span>
                <input
                  id="filter-max-rent"
                  type="number"
                  min="0"
                  step="100000"
                  value={draft.maxRent === PRICE_FILTER_LIMIT ? '' : draft.maxRent}
                  onChange={(event) => updateField('maxRent', event.target.value || PRICE_FILTER_LIMIT)}
                  placeholder="2500000"
                />
              </label>
              <label className="property-filter-field" htmlFor="filter-parking">
                <span>Parqueadero</span>
                <select
                  id="filter-parking"
                  value={draft.parking}
                  onChange={(event) => updateField('parking', event.target.value)}
                >
                  {PARKING_OPTIONS.map((option) => (
                    <option key={option.value || 'all'} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="property-filter-check property-filter-check--single">
                <input
                  type="checkbox"
                  checked={draft.administrationIncluded}
                  onChange={(event) => updateField('administrationIncluded', event.target.checked)}
                />
                <span>Administracion incluida</span>
              </label>
            </div>
            {hasInvalidPrice ? (
              <p className="property-filter-warning">
                El precio minimo no puede ser mayor al precio maximo.
              </p>
            ) : null}
          </FilterSection>

          <FilterSection title="Habitaciones y banos">
            <div className="property-filter-double-grid">
              <CountSegment
                label="Habitaciones"
                exact={draft.bedroomsExact}
                value={draft.bedrooms}
                options={BEDROOM_OPTIONS}
                onExactChange={(value) => updateField('bedroomsExact', value)}
                onValueChange={(value) => updateField('bedrooms', value)}
              />
              <CountSegment
                label="Banos"
                exact={draft.bathroomsExact}
                value={draft.bathrooms}
                options={BATHROOM_OPTIONS}
                onExactChange={(value) => updateField('bathroomsExact', value)}
                onValueChange={(value) => updateField('bathrooms', value)}
              />
            </div>
          </FilterSection>
        </>
      ) : (
        <FilterSection title="Condiciones">
          <label className="property-filter-check property-filter-check--single">
            <input
              type="checkbox"
              checked={draft.administrationIncluded}
              onChange={(event) => updateField('administrationIncluded', event.target.checked)}
            />
            <span>Administracion incluida</span>
          </label>
        </FilterSection>
      )}

      <FilterSection title="Area, estrato y disponibilidad">
        <div className="property-filter-field-grid">
          <label className="property-filter-field" htmlFor="filter-min-area">
            <span>Area minima (m2)</span>
            <input
              id="filter-min-area"
              type="number"
              min="0"
              step="5"
              value={draft.minArea || ''}
              onChange={(event) => updateField('minArea', event.target.value)}
              placeholder="60"
            />
          </label>
          <label className="property-filter-field" htmlFor="filter-max-area">
            <span>Area maxima (m2)</span>
            <input
              id="filter-max-area"
              type="number"
              min="0"
              step="5"
              value={draft.maxArea || ''}
              onChange={(event) => updateField('maxArea', event.target.value)}
              placeholder="180"
            />
          </label>
          <label className="property-filter-field" htmlFor="filter-strata">
            <span>Estrato</span>
            <select
              id="filter-strata"
              value={draft.strata}
              onChange={(event) => updateField('strata', event.target.value)}
            >
              <option value="">Todos</option>
              {[1, 2, 3, 4, 5, 6].map((value) => (
                <option key={value} value={value}>
                  Estrato {value}
                </option>
              ))}
            </select>
          </label>
          <label className="property-filter-field" htmlFor="filter-available-from">
            <span>Disponible desde</span>
            <input
              id="filter-available-from"
              type="date"
              value={draft.availableFrom}
              onChange={(event) => updateField('availableFrom', event.target.value)}
            />
          </label>
        </div>
      </FilterSection>

      <FilterSection title="Extras">
        <div className="property-filter-extra-grid">
          {AMENITY_OPTIONS.map(({ value, label, icon: Icon }) => {
            const active = draft.extras.includes(value);

            return (
              <button
                key={value}
                type="button"
                className={active ? 'is-active' : ''}
                onClick={() => toggleExtra(value)}
                aria-pressed={active}
              >
                <span>
                  <Icon size={15} aria-hidden="true" />
                  {label}
                </span>
              </button>
            );
          })}
        </div>
        {selectedExtras.length ? (
          <div className="property-filter-extra-summary">
            {selectedExtras.map((extra) => (
              <span key={extra.value}>{extra.label}</span>
            ))}
          </div>
        ) : null}
      </FilterSection>

      <div className="property-filters__footer">
        <div>
          <span>{resultCount} propiedades visibles</span>
        </div>
        <div className="property-filters__footer-actions">
          <button
            className="property-filters__secondary"
            type="button"
            onClick={() => {
              onClear();
              setDraft(DEFAULT_SEARCH_FILTERS);
            }}
          >
            <RotateCcw size={15} aria-hidden="true" />
            Limpiar
          </button>
          <button className="property-filters__apply" type="submit" disabled={hasInvalidPrice}>
            Aplicar filtros
          </button>
        </div>
      </div>
    </form>
  );
}
