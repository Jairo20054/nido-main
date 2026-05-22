import React from 'react';
import { X } from 'lucide-react';

export function ActiveFilterChips({ chips, onDismiss, onClear }) {
  if (!chips.length) return null;

  return (
    <div className="active-properties-filters" aria-label="Filtros activos">
      {chips.map((chip) => (
        <button key={chip.key} type="button" onClick={() => onDismiss(chip)}>
          {chip.label}
          <X size={14} aria-hidden="true" />
        </button>
      ))}
      <button type="button" className="active-properties-filters__clear" onClick={onClear}>
        Limpiar filtros
      </button>
    </div>
  );
}
