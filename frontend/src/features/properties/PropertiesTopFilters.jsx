import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  BedDouble,
  Building2,
  Car,
  Check,
  ChevronDown,
  SlidersHorizontal,
  WalletCards,
} from 'lucide-react';
import { formatCurrency } from '../../lib/formatters';
import { PriceDropdown } from './PriceDropdown';
import {
  AMENITY_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  PARKING_OPTIONS,
} from './propertySearchConfig';
import { DEFAULT_SEARCH_FILTERS } from './searchFilterParams';

const BEDROOM_OPTIONS = [0, 1, 2, 3, 4];
const BATHROOM_OPTIONS = [0, 1, 2, 3];
const PANEL_MARGIN = 16;
const PANEL_GAP = 8;
const DEFAULT_PANEL_WIDTH = 360;

function ToolbarPopover({
  id,
  label,
  summary,
  icon: Icon,
  active = false,
  open,
  onToggle,
  onClose,
  children,
  className = '',
  panelWidth = DEFAULT_PANEL_WIDTH,
}) {
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);
  const [panelStyle, setPanelStyle] = useState(null);

  useLayoutEffect(() => {
    if (!open || typeof window === 'undefined') return undefined;

    const updatePanelPosition = () => {
      const buttonRect = buttonRef.current?.getBoundingClientRect();

      if (!buttonRect) return;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const preferredWidth = Math.min(panelWidth, viewportWidth - PANEL_MARGIN * 2);
      const maxLeft = Math.max(PANEL_MARGIN, viewportWidth - preferredWidth - PANEL_MARGIN);
      const nextLeft = Math.min(Math.max(buttonRect.left, PANEL_MARGIN), maxLeft);
      const maxHeight = Math.min(520, viewportHeight - PANEL_MARGIN * 2);
      const measuredHeight = Math.min(panelRef.current?.offsetHeight || maxHeight, maxHeight);
      const preferredTop = buttonRect.bottom + PANEL_GAP;
      const shouldOpenAbove =
        preferredTop + measuredHeight > viewportHeight - PANEL_MARGIN &&
        buttonRect.top > viewportHeight / 2;
      const nextTop = shouldOpenAbove
        ? Math.max(PANEL_MARGIN, buttonRect.top - PANEL_GAP - measuredHeight)
        : Math.min(preferredTop, Math.max(PANEL_MARGIN, viewportHeight - measuredHeight - PANEL_MARGIN));

      setPanelStyle({
        position: 'fixed',
        top: nextTop,
        left: nextLeft,
        width: preferredWidth,
        maxHeight,
      });
    };

    updatePanelPosition();
    window.addEventListener('resize', updatePanelPosition);
    window.addEventListener('scroll', updatePanelPosition, true);

    return () => {
      window.removeEventListener('resize', updatePanelPosition);
      window.removeEventListener('scroll', updatePanelPosition, true);
    };
  }, [open, panelWidth]);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      const clickInsideButton = rootRef.current?.contains(event.target);
      const clickInsidePanel = panelRef.current?.contains(event.target);

      if (!clickInsideButton && !clickInsidePanel) {
        onClose();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, open]);

  return (
    <div className={`properties-toolbar-popover ${className}`.trim()} ref={rootRef}>
      <button
        type="button"
        ref={buttonRef}
        className={`properties-toolbar-chip ${open ? 'is-open' : ''} ${active ? 'is-selected' : ''}`.trim()}
        onClick={() => onToggle(id)}
        aria-expanded={open}
        aria-controls={open ? `${id}-panel` : undefined}
        aria-haspopup="dialog"
      >
        <span className="properties-toolbar-chip__icon">
          <Icon size={16} aria-hidden="true" />
        </span>
        <span className="properties-toolbar-chip__text">
          <strong>{label}</strong>
          {summary ? <small>{summary}</small> : null}
        </span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>

      {open && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={panelRef}
              id={`${id}-panel`}
              className="properties-toolbar-popover__panel"
              style={
                panelStyle || {
                  position: 'fixed',
                  top: 0,
                  left: PANEL_MARGIN,
                  width: Math.min(panelWidth, window.innerWidth - PANEL_MARGIN * 2),
                  visibility: 'hidden',
                }
              }
            >
              {children(onClose)}
            </div>,
            document.body
          )
        : null}
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

function MultiToggleButton({ active, children, value }) {
  return (
    <button
      type="button"
      className={`properties-toolbar-option ${active ? 'is-active' : ''}`}
      data-property-type-value={value}
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
  onClear,
  onOpenMoreFilters,
}) {
  const [openPopover, setOpenPopover] = useState(null);

  const hasTypeFilters = filters.propertyTypes.length > 0;
  const hasPriceFilters =
    filters.minRent !== DEFAULT_SEARCH_FILTERS.minRent ||
    filters.maxRent !== DEFAULT_SEARCH_FILTERS.maxRent;
  const hasRoomFilters =
    filters.bedrooms !== DEFAULT_SEARCH_FILTERS.bedrooms ||
    filters.bedroomsExact !== DEFAULT_SEARCH_FILTERS.bedroomsExact ||
    filters.bathrooms !== DEFAULT_SEARCH_FILTERS.bathrooms ||
    filters.bathroomsExact !== DEFAULT_SEARCH_FILTERS.bathroomsExact;
  const hasParkingFilter = filters.parking !== DEFAULT_SEARCH_FILTERS.parking;
  const hasAdvancedFilters =
    filters.extras.length > 0 ||
    filters.minArea !== DEFAULT_SEARCH_FILTERS.minArea ||
    filters.maxArea !== DEFAULT_SEARCH_FILTERS.maxArea ||
    filters.strata !== DEFAULT_SEARCH_FILTERS.strata ||
    filters.administrationIncluded !== DEFAULT_SEARCH_FILTERS.administrationIncluded ||
    filters.availableFrom !== DEFAULT_SEARCH_FILTERS.availableFrom;

  const togglePopover = (popoverId) => {
    setOpenPopover((current) => (current === popoverId ? null : popoverId));
  };

  const closePopover = () => setOpenPopover(null);
  const updatePropertyTypes = (propertyType) => {
    const nextPropertyTypes = filters.propertyTypes.includes(propertyType)
      ? filters.propertyTypes.filter((item) => item !== propertyType)
      : [...filters.propertyTypes, propertyType];

    onChange('propertyTypes', nextPropertyTypes);
  };

  const handlePropertyTypeClick = (event) => {
    const button = event.target.closest('button[data-property-type-value]');

    if (!button) return;

    event.preventDefault();
    updatePropertyTypes(button.dataset.propertyTypeValue);
  };

  const handleCountClick = (event) => {
    const button = event.target.closest('button[data-count-field]');

    if (!button) return;

    event.preventDefault();
    onChange(button.dataset.countField, button.dataset.countValue);
  };

  const handleParkingClick = (event) => {
    const button = event.target.closest('button[data-parking-value]');

    if (!button) return;

    event.preventDefault();
    onChange('parking', button.dataset.parkingValue);
  };

  return (
    <div className="properties-toolbar-shell">
      <div className="properties-toolbar" aria-label="Filtros compactos">
        <ToolbarPopover
          id="property-type"
          label="Tipo"
          summary={getPropertyTypeSummary(filters)}
          icon={Building2}
          panelWidth={390}
          active={hasTypeFilters}
          open={openPopover === 'property-type'}
          onToggle={togglePopover}
          onClose={closePopover}
        >
          {(close) => (
            <div
              className="properties-toolbar-panel properties-toolbar-panel--grid"
              onClickCapture={handlePropertyTypeClick}
            >
              {PROPERTY_TYPE_OPTIONS.map((option) => {
                const active = filters.propertyTypes.includes(option.value);
                const Icon = option.icon;

                return (
                  <MultiToggleButton
                    key={option.value}
                    active={active}
                    value={option.value}
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
          id="price"
          label="Precio"
          summary={getPriceSummary(filters)}
          icon={WalletCards}
          active={hasPriceFilters}
          open={openPopover === 'price'}
          onToggle={togglePopover}
          onClose={closePopover}
          panelWidth={320}
        >
          {(close) => (
            <PriceDropdown
              filters={filters}
              onChange={onChange}
              onClear={() => {
                onChange('minRent', DEFAULT_SEARCH_FILTERS.minRent);
                onChange('maxRent', DEFAULT_SEARCH_FILTERS.maxRent);
              }}
              onApply={close}
            />
          )}
        </ToolbarPopover>

        <ToolbarPopover
          id="rooms"
          label="Hab. y banos"
          summary={`${getCountSummary(filters.bedrooms, filters.bedroomsExact, 'hab.')} / ${getCountSummary(filters.bathrooms, filters.bathroomsExact, 'banos')}`}
          icon={BedDouble}
          active={hasRoomFilters}
          open={openPopover === 'rooms'}
          onToggle={togglePopover}
          onClose={closePopover}
        >
          {(close) => (
            <div className="properties-toolbar-panel" onClickCapture={handleCountClick}>
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
                      data-count-field="bedrooms"
                      data-count-value={option}
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
                      data-count-field="bathrooms"
                      data-count-value={option}
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
          id="parking"
          label="Parqueadero"
          summary={getParkingSummary(filters.parking)}
          icon={Car}
          active={hasParkingFilter}
          open={openPopover === 'parking'}
          onToggle={togglePopover}
          onClose={closePopover}
        >
          {(close) => (
            <div className="properties-toolbar-panel" onClickCapture={handleParkingClick}>
              <div className="properties-toolbar-parking">
                {PARKING_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={String(filters.parking) === String(option.value) ? 'is-active' : ''}
                    data-parking-value={option.value}
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

        <button
          type="button"
          className={`properties-toolbar__more ${hasAdvancedFilters ? 'is-selected' : ''}`.trim()}
          onClick={() => {
            closePopover();
            onOpenMoreFilters();
          }}
        >
          <SlidersHorizontal size={16} aria-hidden="true" />
          <strong>Mas filtros</strong>
          <small>{filters.extras.length ? getExtrasSummary(filters) : 'Area y extras'}</small>
          {activeCount ? <span>{activeCount}</span> : null}
        </button>
      </div>
    </div>
  );
}
