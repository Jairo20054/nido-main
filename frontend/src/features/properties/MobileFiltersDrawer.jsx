import React from 'react';
import { PropertyFilters } from './PropertyFilters';

export function MobileFiltersDrawer({
  open,
  filters,
  activeCount,
  resultCount,
  onChange,
  onToggleExtra,
  onTogglePropertyType,
  onClear,
  onDismiss,
}) {
  if (!open) return null;

  return (
    <div className="mobile-filter-sheet" role="dialog" aria-modal="true" aria-label="Filtros de propiedades">
      <button
        type="button"
        className="mobile-filter-sheet__backdrop"
        aria-label="Cerrar filtros"
        onClick={onDismiss}
      />
      <div className="mobile-filter-sheet__panel">
        <PropertyFilters
          filters={filters}
          activeCount={activeCount}
          onChange={onChange}
          onToggleExtra={onToggleExtra}
          onTogglePropertyType={onTogglePropertyType}
          onClear={onClear}
          onDismiss={onDismiss}
          resultCount={resultCount}
        />
      </div>
    </div>
  );
}
