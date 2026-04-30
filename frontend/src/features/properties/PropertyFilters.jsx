import React, { useMemo, useState } from 'react';
import {
  Bath,
  BedDouble,
  Building2,
  ChevronDown,
  Dog,
  Home,
  Landmark,
  MapPin,
  Shield,
  Sofa,
  Trees,
} from 'lucide-react';
import { SORT_OPTIONS } from '../../lib/constants';
import { formatCurrency } from '../../lib/formatters';

const PROPERTY_TYPE_OPTIONS = [
  { value: 'apartment', label: 'Apartamento', icon: Building2 },
  { value: 'house', label: 'Casa', icon: Home },
  { value: 'studio', label: 'Estudio', icon: Sofa },
];

const EXTRA_OPTIONS = [
  { value: 'furnished', label: 'Amoblado', icon: Sofa },
  { value: 'petsAllowed', label: 'Mascotas OK', icon: Dog },
  { value: 'parking', label: 'Parqueadero', icon: Landmark },
  { value: 'security', label: 'Vigilancia', icon: Shield },
  { value: 'gatedCommunity', label: 'Conjunto cerrado', icon: Trees },
];

const RECENT_CITIES = ['Medellín', 'Bogotá', 'Cali', 'Barranquilla', 'Chapinero', 'Envigado'];

function Stepper({ label, icon: Icon, value, onChange, min = 0 }) {
  return (
    <div className="stepper">
      <div className="stepper__label">
        <Icon size={16} />
        <span>{label}</span>
      </div>
      <div className="stepper__controls" role="group" aria-label={label}>
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} aria-label={`Reducir ${label}`}>
          −
        </button>
        <span aria-live="polite">{value}</span>
        <button type="button" onClick={() => onChange(value + 1)} aria-label={`Aumentar ${label}`}>
          +
        </button>
      </div>
    </div>
  );
}

function DualRangeSlider({ min, max, valueMin, valueMax, onChange }) {
  const safeMin = Math.min(valueMin, valueMax - 100000);
  const safeMax = Math.max(valueMax, safeMin + 100000);
  const range = max - min;
  const left = ((safeMin - min) / range) * 100;
  const right = ((safeMax - min) / range) * 100;

  return (
    <div className="dual-range">
      <div className="dual-range__values">{formatCurrency(safeMin)} — {formatCurrency(safeMax)}</div>
      <div className="dual-range__track">
        <span className="dual-range__rail"></span>
        <span className="dual-range__fill" style={{ left: `${left}%`, width: `${right - left}%` }}></span>
        <input
          type="range"
          min={min}
          max={max}
          step="100000"
          value={safeMin}
          aria-label="Canon mensual mínimo"
          onChange={(event) => onChange('min', Math.min(Number(event.target.value), safeMax - 100000))}
        />
        <input
          type="range"
          min={min}
          max={max}
          step="100000"
          value={safeMax}
          aria-label="Canon mensual máximo"
          onChange={(event) => onChange('max', Math.max(Number(event.target.value), safeMin + 100000))}
        />
      </div>
    </div>
  );
}

function AccordionSection({ icon: Icon, title, defaultOpen = true, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className={`filter-accordion ${isOpen ? 'filter-accordion--open' : ''}`}>
      <button
        type="button"
        className="filter-accordion__trigger"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
      >
        <span>
          <Icon size={16} />
          {title}
        </span>
        <ChevronDown size={16} />
      </button>
      <div className="filter-accordion__content">{children}</div>
    </section>
  );
}

export function PropertyFilters({
  filters,
  activeCount,
  onChange,
  onToggleExtra,
  onClear,
  onDismiss,
  resultCount = 0,
}) {
  const sortLabel = useMemo(
    () => SORT_OPTIONS.find((option) => option.value === filters.sort)?.label || 'Recomendados',
    [filters.sort]
  );

  return (
    <form className="filter-panel" onSubmit={(event) => event.preventDefault()}>
      <div className="filter-panel__header">
        <div>
          <span className="section__eyebrow">Filtros</span>
          <h2>Encuentra algo que sí te quede bien</h2>
        </div>
        {onDismiss ? (
          <button type="button" className="filter-panel__dismiss" onClick={onDismiss}>
            Cerrar
          </button>
        ) : null}
      </div>

      <AccordionSection icon={MapPin} title="Ciudad / Zona">
        <div className="field-group">
          <label htmlFor="city">Busca por ciudad o zona</label>
          <input
            id="city"
            list="recent-cities"
            value={filters.city}
            onChange={(event) => onChange('city', event.target.value)}
            placeholder="Ej. Medellín, Chapinero, Envigado"
          />
          <datalist id="recent-cities">
            {RECENT_CITIES.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
        </div>
        <div className="filter-chip-row">
          {RECENT_CITIES.map((city) => (
            <button
              key={city}
              type="button"
              className={`filter-chip ${filters.city === city ? 'filter-chip--active' : ''}`}
              onClick={() => onChange('city', city)}
            >
              {city}
            </button>
          ))}
        </div>
      </AccordionSection>

      <AccordionSection icon={Landmark} title="Canon mensual">
        <DualRangeSlider
          min={500000}
          max={9000000}
          valueMin={filters.minRent}
          valueMax={filters.maxRent}
          onChange={(field, value) =>
            onChange(field === 'min' ? 'minRent' : 'maxRent', value)
          }
        />
      </AccordionSection>

      <AccordionSection icon={Building2} title="Tipo de propiedad">
        <div className="filter-icon-grid">
          {PROPERTY_TYPE_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              className={`property-type-pill ${filters.propertyType === value ? 'property-type-pill--active' : ''}`}
              onClick={() => onChange('propertyType', filters.propertyType === value ? '' : value)}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
      </AccordionSection>

      <AccordionSection icon={BedDouble} title="Habitaciones">
        <Stepper
          label="Habitaciones"
          icon={BedDouble}
          value={filters.bedrooms}
          min={0}
          onChange={(value) => onChange('bedrooms', value)}
        />
      </AccordionSection>

      <AccordionSection icon={Bath} title="Baños">
        <Stepper
          label="Baños"
          icon={Bath}
          value={filters.bathrooms}
          min={1}
          onChange={(value) => onChange('bathrooms', value)}
        />
      </AccordionSection>

      <AccordionSection icon={SparklesIcon} title="Extras">
        <div className="filter-chip-row">
          {EXTRA_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              className={`filter-chip filter-chip--icon ${filters.extras.includes(value) ? 'filter-chip--active-accent' : ''}`}
              onClick={() => onToggleExtra(value)}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </AccordionSection>

      <div className="field-group">
        <label htmlFor="sort">Ordenar por</label>
        <select id="sort" value={filters.sort} onChange={(event) => onChange('sort', event.target.value)}>
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <small className="field-help">Actual: {sortLabel}</small>
      </div>

      <div className="filter-panel__actions">
        <button className="ghost-link" type="button" onClick={onClear}>
          Limpiar filtros
        </button>
        <button className="button button--accent" type="button" onClick={onDismiss}>
          Ver {resultCount} propiedades →
        </button>
      </div>

      <div className="filter-panel__footer-note">{activeCount} filtros activos</div>
    </form>
  );
}

function SparklesIcon(props) {
  return <span className="sparkles-icon" {...props}>✨</span>;
}
