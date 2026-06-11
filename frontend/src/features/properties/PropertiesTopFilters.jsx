import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bath,
  BedDouble,
  Building2,
  Car,
  Check,
  ChevronDown,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  WalletCards,
} from 'lucide-react';
import { formatCurrency } from '../../lib/formatters';
import {
  AMENITY_OPTIONS,
  PARKING_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
} from './propertySearchConfig';
import { DEFAULT_SEARCH_FILTERS, PRICE_FILTER_LIMIT } from './searchFilterParams';

const BEDROOM_OPTIONS = [0, 1, 2, 3, 4];
const BATHROOM_OPTIONS = [0, 1, 2, 3];

function ToolbarPopover({ label, summary, icon: Icon, children, className = '' }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className={`properties-toolbar-popover ${className}`.trim()} ref={rootRef}>
      <button
        type="button"
        className={`properties-toolbar-chip ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        <span className="properties-toolbar-chip__icon">
          <Icon size={16} aria-hidden="true" />
        </span>
        <span className="properties-toolbar-chip__text">
          <strong>{label}</strong>
          <small>{summary}</small>
        </span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>

      {open ? (
        <div className="properties-toolbar-popover__panel">
          {children(() => setOpen(false))}
        </div>
      ) : null}
    </div>
  );
}

const getPropertyTypeSummary = (filters) => {
  if (!filters.propertyTypes.length) return 'Todos';
  if (filters.propertyTypes.length === 1) {
    return PROPERTY_TYPE_OPTIONS.find((item) => item.value === filters.propertyTypes[0])?.label || '1 tipo';
  }

  return `${filters.propertyTypes.length} tipos`;
};

const getPriceSummary = (filters) => {
  const minChanged = filters.minRent !== DEFAULT_SEARCH_FILTERS.minRent;
  const maxChanged = filters.maxRent !== DEFAULT_SEARCH_FILTERS.maxRent;

  if (!minChanged && !maxChanged) return 'Cualquier valor';
  if (!minChanged) return `Hasta ${formatCurrency(filters.maxRent)}`;
  if (!maxChanged) return `Desde ${formatCurrency(filters.minRent)}`;

  return `${formatCurrency(filters.minRent)} - ${formatCurrency(filters.maxRent)}`;
};

const getCountSummary = (value, exact, unit) => {
  if (!value) return 'Todos';
  if (exact) return `${value} exactos`;
  if (value >= 4 && unit === 'hab.') return '4 o mas';
  if (value >= 3 && unit === 'banos') return '3 o mas';
  return `${value}+ ${unit}`;
};

const getParkingSummary = (parking) => {
  if (parking === '') return 'Todos';
  if (String(parking) === '0') return 'Sin parqueadero';
  return `${parking}+ cupos`;
};

const getExtrasSummary = (filters) => {
  if (!filters.extras.length) return 'Opcionales';
  if (filters.extras.length === 1) {
    return AMENITY_OPTIONS.find((item) => item.value === filters.extras[0])?.label || '1 extra';
  }

  return `${filters.extras.length} extras`;
};

function MultiToggleButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      className={`properties-toolbar-option ${active ? 'is-active' : ''}`}
      onClick={onClick}
      aria-pressed={active}
    >
      {children}
      {active ? <Check size={14} aria-hidden="true" /> : null}
    </button>
  );
}

export function PropertiesTopFilters({
  filters,
  activeCount,
  onChange,
  onTogglePropertyType,
  onToggleExtra,
  onClear,
  onOpenMoreFilters,
}) {
  const hasInvalidPrice = filters.minRent > filters.maxRent;
  const selectedExtras = useMemo(
    () => AMENITY_OPTIONS.filter((item) => filters.extras.includes(item.value)),
    [filters.extras]
  );

  return (
    <div className="properties-toolbar" aria-label="Filtros compactos">
      <ToolbarPopover
        label="Tipo"
        summary={getPropertyTypeSummary(filters)}
        icon={Building2}
      >
        {(close) => (
          <div className="properties-toolbar-panel properties-toolbar-panel--grid">
            {PROPERTY_TYPE_OPTIONS.map((option) => {
              const active = filters.propertyTypes.includes(option.value);
              const Icon = option.icon;

              return (
                <MultiToggleButton
                  key={option.value}
                  active={active}
                  onClick={() => onTogglePropertyType(option.value)}
                >
                  <span>
                    <Icon size={16} aria-hidden="true" />
                    {option.label}
                  </span>
                </MultiToggleButton>
              );
            })}
            <div className="properties-toolbar-panel__footer">
              <button type="button" className="ghost-link" onClick={close}>
                Listo
              </button>
            </div>
          </div>
        )}
      </ToolbarPopover>

      <ToolbarPopover
        label="Precio"
        summary={getPriceSummary(filters)}
        icon={WalletCards}
      >
        {(close) => (
          <div className="properties-toolbar-panel">
            <div className="properties-toolbar-range">
              <label>
                <span>Minimo</span>
                <input
                  type="number"
                  min="0"
                  step="100000"
                  value={filters.minRent || ''}
                  placeholder="800000"
                  onChange={(event) => onChange('minRent', event.target.value || 0)}
                />
              </label>
              <label>
                <span>Maximo</span>
                <input
                  type="number"
                  min="0"
                  step="100000"
                  value={filters.maxRent === PRICE_FILTER_LIMIT ? '' : filters.maxRent}
                  placeholder="2500000"
                  onChange={(event) =>
                    onChange('maxRent', event.target.value || PRICE_FILTER_LIMIT)
                  }
                />
              </label>
            </div>
            {hasInvalidPrice ? (
              <p className="properties-toolbar-panel__warning">
                El precio minimo no puede ser mayor al maximo.
              </p>
            ) : null}
            <div className="properties-toolbar-panel__footer">
              <button
                type="button"
                className="ghost-link"
                onClick={() => {
                  onChange('minRent', DEFAULT_SEARCH_FILTERS.minRent);
                  onChange('maxRent', DEFAULT_SEARCH_FILTERS.maxRent);
                }}
              >
                Limpiar
              </button>
              <button type="button" className="button" onClick={close}>
                Aplicar
              </button>
            </div>
          </div>
        )}
      </ToolbarPopover>

      <ToolbarPopover
        label="Hab. y banos"
        summary={`${getCountSummary(filters.bedrooms, filters.bedroomsExact, 'hab.')} / ${getCountSummary(filters.bathrooms, filters.bathroomsExact, 'banos')}`}
        icon={BedDouble}
      >
        {(close) => (
          <div className="properties-toolbar-panel">
            <section className="properties-toolbar-count-group">
              <div className="properties-toolbar-count-header">
                <strong>Habitaciones</strong>
                <label className="properties-toolbar-switch">
                  <input
                    type="checkbox"
                    checked={filters.bedroomsExact}
                    onChange={(event) => onChange('bedroomsExact', event.target.checked)}
                  />
                  <span>Numero exacto</span>
                </label>
              </div>
              <div className="properties-toolbar-segmented">
                {BEDROOM_OPTIONS.map((option) => (
                  <button
                    key={`bed-${option}`}
                    type="button"
                    className={filters.bedrooms === option ? 'is-active' : ''}
                    onClick={() => onChange('bedrooms', option)}
                  >
                    {option === 0 ? 'Todos' : option >= 4 ? '4+' : `${option}+`}
                  </button>
                ))}
              </div>
            </section>

            <section className="properties-toolbar-count-group">
              <div className="properties-toolbar-count-header">
                <strong>Banos</strong>
                <label className="properties-toolbar-switch">
                  <input
                    type="checkbox"
                    checked={filters.bathroomsExact}
                    onChange={(event) => onChange('bathroomsExact', event.target.checked)}
                  />
                  <span>Numero exacto</span>
                </label>
              </div>
              <div className="properties-toolbar-segmented">
                {BATHROOM_OPTIONS.map((option) => (
                  <button
                    key={`bath-${option}`}
                    type="button"
                    className={filters.bathrooms === option ? 'is-active' : ''}
                    onClick={() => onChange('bathrooms', option)}
                  >
                    {option === 0 ? 'Todos' : option >= 3 ? '3+' : `${option}+`}
                  </button>
                ))}
              </div>
            </section>

            <div className="properties-toolbar-panel__footer">
              <button
                type="button"
                className="ghost-link"
                onClick={() => {
                  onChange('bedrooms', DEFAULT_SEARCH_FILTERS.bedrooms);
                  onChange('bedroomsExact', DEFAULT_SEARCH_FILTERS.bedroomsExact);
                  onChange('bathrooms', DEFAULT_SEARCH_FILTERS.bathrooms);
                  onChange('bathroomsExact', DEFAULT_SEARCH_FILTERS.bathroomsExact);
                }}
              >
                Limpiar
              </button>
              <button type="button" className="button" onClick={close}>
                Aplicar
              </button>
            </div>
          </div>
        )}
      </ToolbarPopover>

      <ToolbarPopover
        label="Parqueadero"
        summary={getParkingSummary(filters.parking)}
        icon={Car}
      >
        {(close) => (
          <div className="properties-toolbar-panel">
            <div className="properties-toolbar-parking">
              {PARKING_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={String(filters.parking) === String(option.value) ? 'is-active' : ''}
                  onClick={() => onChange('parking', option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="properties-toolbar-panel__footer">
              <button
                type="button"
                className="ghost-link"
                onClick={() => onChange('parking', DEFAULT_SEARCH_FILTERS.parking)}
              >
                Limpiar
              </button>
              <button type="button" className="button" onClick={close}>
                Aplicar
              </button>
            </div>
          </div>
        )}
      </ToolbarPopover>

      <ToolbarPopover
        label="Extras"
        summary={getExtrasSummary(filters)}
        icon={Sparkles}
      >
        {(close) => (
          <div className="properties-toolbar-panel">
            <div className="properties-toolbar-extra-grid">
              {AMENITY_OPTIONS.map((option) => {
                const Icon = option.icon;
                const active = filters.extras.includes(option.value);

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={active ? 'is-active' : ''}
                    onClick={() => onToggleExtra(option.value)}
                  >
                    <span>
                      <Icon size={15} aria-hidden="true" />
                      {option.label}
                    </span>
                    {active ? <Check size={14} aria-hidden="true" /> : null}
                  </button>
                );
              })}
            </div>
            {selectedExtras.length ? (
              <div className="properties-toolbar-selection">
                {selectedExtras.map((option) => (
                  <span key={option.value}>{option.label}</span>
                ))}
              </div>
            ) : null}
            <div className="properties-toolbar-panel__footer">
              <button
                type="button"
                className="ghost-link"
                onClick={() => {
                  filters.extras.forEach((extra) => onToggleExtra(extra));
                }}
              >
                Limpiar
              </button>
              <button type="button" className="button" onClick={close}>
                Aplicar
              </button>
            </div>
          </div>
        )}
      </ToolbarPopover>

      <button type="button" className="properties-toolbar__more" onClick={onOpenMoreFilters}>
        <SlidersHorizontal size={16} aria-hidden="true" />
        Mas filtros
        {activeCount ? <span>{activeCount}</span> : null}
      </button>

      {activeCount ? (
        <button type="button" className="properties-toolbar__reset" onClick={onClear}>
          <RotateCcw size={15} aria-hidden="true" />
          Limpiar
        </button>
      ) : null}
    </div>
  );
}
