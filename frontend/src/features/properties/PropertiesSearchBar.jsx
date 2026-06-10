import React, { useMemo } from 'react';
import { MapPin, Search, SlidersHorizontal } from 'lucide-react';
import {
  BUDGET_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  QUICK_FILTERS,
} from './propertySearchConfig';
import { FilterDropdown } from './FilterDropdown';

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
  const budgetOptions = useMemo(
    () =>
      budgetValue === 'custom'
        ? [{ value: 'custom', label: 'Rango personalizado' }, ...BUDGET_OPTIONS]
        : BUDGET_OPTIONS,
    [budgetValue]
  );
  const propertyTypeOptions = useMemo(
    () => [{ value: '', label: 'Cualquier tipo' }, ...PROPERTY_TYPE_OPTIONS],
    []
  );

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
        <span>Ciudad, departamento o barrio</span>
        <div>
          <MapPin size={18} aria-hidden="true" />
          <input
            type="text"
            value={filters.city}
            onChange={(event) => onChange('city', event.target.value)}
            placeholder="Ej: Bogota, Cundinamarca, Chapinero"
            aria-label="Ciudad, departamento, barrio o zona"
          />
        </div>
      </label>

      <FilterDropdown
        label="Presupuesto"
        ariaLabel="Rango de presupuesto"
        value={budgetValue}
        options={budgetOptions}
        onChange={(nextValue) => {
          const option = BUDGET_OPTIONS.find((item) => item.value === nextValue);
          if (!option) return;
          onChange('minRent', option.minRent);
          onChange('maxRent', option.maxRent);
        }}
      />

      <FilterDropdown
        label="Tipo de vivienda"
        ariaLabel="Tipo de vivienda"
        value={primaryType}
        options={propertyTypeOptions}
        onChange={(nextValue) => {
          onChange('propertyTypes', nextValue ? [nextValue] : []);
        }}
      />

      <div className="properties-search-bar__active" aria-live="polite">
        <SlidersHorizontal size={17} aria-hidden="true" />
        <strong>{activeCount}</strong>
        filtros activos
      </div>

      <button className="properties-search-bar__submit" type="submit">
        <Search size={18} aria-hidden="true" />
        Buscar
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
