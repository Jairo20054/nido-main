import React, { useEffect, useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import {
  AMENITY_OPTIONS,
  PARKING_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
} from './propertySearchConfig';
import {
  countActiveSearchFilters,
  DEFAULT_SEARCH_FILTERS,
  PRICE_FILTER_LIMIT,
} from './searchFilterParams';

const BEDROOM_OPTIONS = [0, 1, 2, 3, 4];
const BATHROOM_OPTIONS = [0, 1, 2, 3];

const pluralizeProperties = (count) =>
  `${count} ${count === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}`;
const pluralizeFilters = (count) => `${count} ${count === 1 ? 'filtro activo' : 'filtros activos'}`;

/**
 * @typedef {typeof DEFAULT_SEARCH_FILTERS} SearchFilters
 *
 * @typedef {object} MoreFiltersModalProps
 * @property {SearchFilters} filters
 * @property {number} activeCount
 * @property {(nextFilters: SearchFilters) => void} onApply
 * @property {() => void} onClear
 * @property {() => void} onDismiss
 * @property {number} [resultCount]
 * @property {boolean} [advancedOnly]
 */

function ModalSection({ title, children }) {
  return (
    <section className="more-filters-section">
      <h3>{title}</h3>
      <div className="more-filters-section__content">{children}</div>
    </section>
  );
}

function CountSegment({ label, exact, value, options, onExactChange, onValueChange }) {
  return (
    <div className="more-filters-count">
      <div className="more-filters-count__header">
        <strong>{label}</strong>
        <label className="more-filters-switch">
          <input
            type="checkbox"
            checked={exact}
            onChange={(event) => onExactChange(event.target.checked)}
          />
          <span>Numero exacto</span>
        </label>
      </div>
      <div className="more-filters-segmented">
        {options.map((option) => (
          <button
            key={`${label}-${option}`}
            type="button"
            className={value === option ? 'is-active' : ''}
            onClick={() => onValueChange(option)}
          >
            {option === 0
              ? 'Todos'
              : option >= 4 && label === 'Habitaciones'
                ? '4+'
                : option >= 3 && label === 'Banos'
                  ? '3+'
                  : `${option}+`}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * @param {MoreFiltersModalProps} props
 */
export function MoreFiltersModal({
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

  const draftActiveCount = useMemo(() => countActiveSearchFilters(draft), [draft]);
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

  const updateMaxRent = (value) => {
    updateField('maxRent', value === '' ? PRICE_FILTER_LIMIT : value);
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

  const clearAll = () => {
    setDraft(DEFAULT_SEARCH_FILTERS);
    onClear();
  };

  return (
    <form
      className={`more-filters-modal ${advancedOnly ? 'more-filters-modal--advanced' : ''}`}
      onSubmit={(event) => {
        event.preventDefault();
        if (!hasInvalidPrice) {
          onApply(draft);
        }
      }}
    >
      <header className="more-filters-modal__header">
        <div>
          <h2>Mas filtros</h2>
          <p>
            {draftActiveCount || activeCount
              ? pluralizeFilters(draftActiveCount)
              : 'Afina tu busqueda'}
          </p>
        </div>
        <button
          type="button"
          className="more-filters-modal__close"
          onClick={onDismiss}
          aria-label="Cerrar filtros"
        >
          <X size={18} />
        </button>
      </header>

      <div className="more-filters-modal__body">
        {!advancedOnly ? (
          <>
            <ModalSection title="Ubicacion">
              <div className="more-filters-grid">
                <label className="more-filters-field" htmlFor="filter-location">
                  <span>Busqueda libre</span>
                  <input
                    id="filter-location"
                    value={draft.location}
                    onChange={(event) => updateField('location', event.target.value)}
                    placeholder="Cali, Laureles, Chapinero..."
                  />
                </label>
                <label className="more-filters-field" htmlFor="filter-city">
                  <span>Ciudad</span>
                  <input
                    id="filter-city"
                    value={draft.city}
                    onChange={(event) => updateField('city', event.target.value)}
                    placeholder="Cali"
                  />
                </label>
                <label className="more-filters-field" htmlFor="filter-neighborhood">
                  <span>Barrio</span>
                  <input
                    id="filter-neighborhood"
                    value={draft.neighborhood}
                    onChange={(event) => updateField('neighborhood', event.target.value)}
                    placeholder="Granada"
                  />
                </label>
                <label className="more-filters-field" htmlFor="filter-department">
                  <span>Departamento</span>
                  <input
                    id="filter-department"
                    value={draft.department}
                    onChange={(event) => updateField('department', event.target.value)}
                    placeholder="Valle del Cauca"
                  />
                </label>
              </div>
            </ModalSection>

            <ModalSection title="Tipo de inmueble">
              <div className="more-filters-type-grid">
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
                      <Icon size={15} aria-hidden="true" />
                      {label}
                    </button>
                  );
                })}
              </div>
            </ModalSection>

            <ModalSection title="Precio y parqueadero">
              <div className="more-filters-grid">
                <label className="more-filters-field" htmlFor="filter-min-rent">
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
                <label className="more-filters-field" htmlFor="filter-max-rent">
                  <span>Precio maximo</span>
                  <input
                    id="filter-max-rent"
                    type="number"
                    min="0"
                    step="100000"
                    value={draft.maxRent === PRICE_FILTER_LIMIT ? '' : draft.maxRent}
                    onChange={(event) => updateMaxRent(event.target.value)}
                    placeholder="2500000"
                  />
                </label>
                <label className="more-filters-field" htmlFor="filter-parking">
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
              </div>
              {hasInvalidPrice ? (
                <p className="more-filters-warning">
                  El precio minimo no puede ser mayor al precio maximo.
                </p>
              ) : null}
            </ModalSection>

            <ModalSection title="Habitaciones y banos">
              <div className="more-filters-grid">
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
            </ModalSection>
          </>
        ) : null}

        <ModalSection title="Condiciones">
          <label className="more-filters-check">
            <input
              type="checkbox"
              checked={draft.administrationIncluded}
              onChange={(event) => updateField('administrationIncluded', event.target.checked)}
            />
            <span>Administracion incluida</span>
          </label>
        </ModalSection>

        <ModalSection title="Area, estrato y disponibilidad">
          <div className="more-filters-grid">
            <label className="more-filters-field more-filters-field--unit" htmlFor="filter-min-area">
              <span>Area minima</span>
              <div>
                <input
                  id="filter-min-area"
                  type="number"
                  min="0"
                  step="5"
                  value={draft.minArea || ''}
                  onChange={(event) => updateField('minArea', event.target.value)}
                  placeholder="Ej: 40"
                />
                <b>m2</b>
              </div>
            </label>
            <label className="more-filters-field more-filters-field--unit" htmlFor="filter-max-area">
              <span>Area maxima</span>
              <div>
                <input
                  id="filter-max-area"
                  type="number"
                  min="0"
                  step="5"
                  value={draft.maxArea || ''}
                  onChange={(event) => updateField('maxArea', event.target.value)}
                  placeholder="Ej: 120"
                />
                <b>m2</b>
              </div>
            </label>
            <label className="more-filters-field" htmlFor="filter-strata">
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
            <label className="more-filters-field" htmlFor="filter-available-from">
              <span>Disponible desde</span>
              <input
                id="filter-available-from"
                type="date"
                value={draft.availableFrom}
                onChange={(event) => updateField('availableFrom', event.target.value)}
              />
            </label>
          </div>
        </ModalSection>

        <ModalSection title="Extras">
          <div className="more-filters-extra-grid">
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
                  {active ? <Check size={14} aria-hidden="true" /> : null}
                  <Icon size={14} aria-hidden="true" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </ModalSection>
      </div>

      <footer className="more-filters-modal__footer">
        <strong>{pluralizeProperties(resultCount)}</strong>
        <div className="more-filters-modal__footer-actions">
          <button
            className="more-filters-modal__clear"
            type="button"
            onClick={clearAll}
            aria-label="Limpiar todos los filtros"
          >
            Limpiar
          </button>
          <button className="more-filters-modal__apply" type="submit" disabled={hasInvalidPrice}>
            Aplicar filtros
          </button>
        </div>
      </footer>
    </form>
  );
}
