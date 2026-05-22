import React from 'react';
import { Grid2X2, List, Map } from 'lucide-react';
import { SORT_OPTIONS } from './propertySearchConfig';

export function PropertiesResultsHeader({
  count,
  totalCount,
  filters,
  viewMode,
  onSortChange,
  onToggleMap,
  onViewModeChange,
}) {
  const locationCopy = filters.city
    ? `Mostrando en ${filters.city}`
    : 'Mostrando propiedades segun tus filtros';
  const counter = totalCount > count ? totalCount : count;

  return (
    <div className="properties-results-header">
      <div>
        <h1>{counter} propiedades encontradas</h1>
        <p>{locationCopy}</p>
      </div>
      <div className="properties-results-header__actions">
        <label className="properties-sort" htmlFor="properties-sort">
          <span>Ordenar por</span>
          <select id="properties-sort" value={filters.sort} onChange={(event) => onSortChange(event.target.value)}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="properties-map-button" onClick={onToggleMap}>
          <Map size={17} aria-hidden="true" />
          Ver en mapa
        </button>
        <div className="properties-view-toggle" role="group" aria-label="Vista de resultados">
          <button
            type="button"
            className={viewMode === 'grid' ? 'is-active' : ''}
            onClick={() => onViewModeChange('grid')}
            aria-label="Vista en grilla"
          >
            <Grid2X2 size={16} />
          </button>
          <button
            type="button"
            className={viewMode === 'list' ? 'is-active' : ''}
            onClick={() => onViewModeChange('list')}
            aria-label="Vista en lista"
          >
            <List size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
