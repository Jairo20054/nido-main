import React, { useMemo } from 'react';
import { MapPin, Search, SlidersHorizontal } from 'lucide-react';
import {
  BUDGET_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  QUICK_FILTERS,
} from './propertySearchConfig';

const getBudgetValue = (filters) => {
  const match = BUDGET_OPTIONS.find(
    (option) => option.minRent === filters.minRent && option.maxRent === filters.maxRent
  );

  return match?.value || 'custom';
};

export function PropertiesSearchBar({
  filters,
  activeCount,
  onChange,
  onToggleExtra,
  onTogglePropertyType,
}) {
  const budgetValue = useMemo(() => getBudgetValue(filters), [filters]);
  const primaryType = filters.propertyTypes.length === 1 ? filters.propertyTypes[0] : '';

  const applyQuickFilter = (filter) => {
    if (filter.type === 'extra') {
      onToggleExtra(filter.value);
      return;
    }

    onTogglePropertyType(filter.value);
  };

  return (
    <form
      className="properties-search-bar"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <label className="properties-search-bar__field properties-search-bar__field--location">
        <span>Donde quieres vivir?</span>
        <div>
          <MapPin size={18} aria-hidden="true" />
          <input
            type="text"
            value={filters.city}
            onChange={(event) => onChange('city', event.target.value)}
            placeholder="Ciudad, barrio o zona"
            aria-label="Ciudad, barrio o zona"
          />
        </div>
      </label>

      <label className="properties-search-bar__field">
        <span>Presupuesto</span>
        <select
          value={budgetValue}
          aria-label="Rango de presupuesto"
          onChange={(event) => {
            const option = BUDGET_OPTIONS.find((item) => item.value === event.target.value);
            if (!option) return;
            onChange('minRent', option.minRent);
            onChange('maxRent', option.maxRent);
          }}
        >
          {budgetValue === 'custom' ? <option value="custom">Rango personalizado</option> : null}
          {BUDGET_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="properties-search-bar__field">
        <span>Tipo de vivienda</span>
        <select
          value={primaryType}
          aria-label="Tipo de vivienda"
          onChange={(event) => {
            const nextValue = event.target.value;
            onChange('propertyTypes', nextValue ? [nextValue] : []);
          }}
        >
          <option value="">Cualquier tipo</option>
          {PROPERTY_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="properties-search-bar__active" aria-live="polite">
        <SlidersHorizontal size={17} aria-hidden="true" />
        <strong>{activeCount}</strong>
        filtros activos
      </div>

      <button className="properties-search-bar__submit" type="submit">
        <Search size={18} aria-hidden="true" />
        Buscar propiedades
      </button>

      <div className="properties-search-bar__quick" aria-label="Busquedas rapidas">
        <span>Busquedas rapidas:</span>
        {QUICK_FILTERS.map((filter) => {
          const active =
            filter.type === 'extra'
              ? filters.extras.includes(filter.value)
              : filters.propertyTypes.includes(filter.value);

          return (
            <button
              key={filter.key}
              type="button"
              className={`properties-search-bar__chip ${
                active ? 'properties-search-bar__chip--active' : ''
              }`}
              onClick={() => applyQuickFilter(filter)}
              aria-pressed={active}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </form>
  );
}
