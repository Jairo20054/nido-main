import React from 'react';
import { Grid2X2, List, Map, RotateCcw, X } from 'lucide-react';
import { FilterDropdown } from './FilterDropdown';
import { SORT_OPTIONS } from './propertySearchConfig';
import { getPropertyTypeLabel } from '../../lib/formatters';

export function PropertiesResultsHeader({
  count,
  totalCount,
  filters,
  viewMode,
  activeCount = 0,
  resultSummary,
  mapOpen = false,
  onSortChange,
  onClear,
  onClearPropertyTypes,
  onToggleMap,
  onViewModeChange,
}) {
  const locationCopy =
    filters.location ||
    [filters.neighborhood, filters.city, filters.department].filter(Boolean).join(', ');
  const counter = totalCount > count ? totalCount : count;
  const summaryParts = (resultSummary || locationCopy).split(' / ').filter(Boolean);
  const typeCopy =
    filters.propertyTypes.length === 1
      ? getPropertyTypeLabel(filters.propertyTypes[0])
      : filters.propertyTypes.length > 1
        ? `${filters.propertyTypes.length} tipos de inmueble`
        : 'Casas y apartamentos';
  const heading = `${typeCopy} en arriendo${locationCopy ? ` en ${locationCopy}` : ''}`;
  const hasTypeFilter = filters.propertyTypes.length > 0;
  const visibleSummaryParts = summaryParts.filter((part) => part !== typeCopy);

  return (
    <div className="properties-results-header">
      <div className="properties-results-header__copy">
        <span className="properties-results-header__breadcrumb">
          Estas en: NIDO &gt; Arriendo &gt; {locationCopy || 'Colombia'}
        </span>
        <h1>{heading}</h1>
        <p>
          Mostrando {count ? 1 : 0} - {count} de {counter} resultados
        </p>
        <div className="properties-results-header__meta" aria-label="Resumen de resultados">
          {hasTypeFilter ? (
            <button
              type="button"
              className="properties-results-header__category"
              onClick={onClearPropertyTypes}
            >
              {typeCopy}
              <X size={14} aria-hidden="true" />
            </button>
          ) : (
            <span className="properties-results-header__category">{typeCopy}</span>
          )}
          {visibleSummaryParts.map((part) => (
            <span key={part}>{part}</span>
          ))}
        </div>
      </div>
      <div className="properties-results-header__actions">
        <FilterDropdown
          className="properties-sort"
          label="Ordenar"
          ariaLabel="Ordenar propiedades"
          value={filters.sort}
          options={SORT_OPTIONS}
          onChange={onSortChange}
        />
        {activeCount ? (
          <button type="button" className="properties-clear-button" onClick={onClear}>
            <RotateCcw size={16} aria-hidden="true" />
            Limpiar filtros
          </button>
        ) : null}
        <button type="button" className="properties-map-button" onClick={onToggleMap}>
          <Map size={17} aria-hidden="true" />
          {mapOpen ? 'Ocultar mapa' : 'Ver mapa'}
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
