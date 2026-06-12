import React, { useEffect } from 'react';
import { MoreFiltersModal } from './MoreFiltersModal';

export function MobileFiltersDrawer({
  open,
  filters,
  activeCount,
  resultCount,
  onClear,
  onApply,
  onDismiss,
  desktop = false,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onDismiss();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onDismiss, open]);

  if (!open) return null;

  return (
    <div
      className={`mobile-filter-sheet ${desktop ? 'mobile-filter-sheet--desktop' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Filtros de propiedades"
    >
      <button
        type="button"
        className="mobile-filter-sheet__backdrop"
        aria-label="Cerrar filtros"
        onClick={onDismiss}
      />
      <div className="mobile-filter-sheet__panel">
        <MoreFiltersModal
          filters={filters}
          activeCount={activeCount}
          onApply={onApply}
          onClear={onClear}
          onDismiss={onDismiss}
          resultCount={resultCount}
          advancedOnly={desktop}
        />
      </div>
    </div>
  );
}
