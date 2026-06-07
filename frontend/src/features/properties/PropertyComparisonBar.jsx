import React from 'react';
import { Scale, X } from 'lucide-react';

export function PropertyComparisonBar({ count, onClear, onCompare }) {
  if (!count) return null;

  return (
    <div className="property-comparison-bar" role="region" aria-label="Propiedades seleccionadas para comparar">
      <div>
        <Scale size={18} aria-hidden="true" />
        <strong>{count} propiedades seleccionadas</strong>
        <span>Elige minimo 2 y maximo 4 opciones.</span>
      </div>
      <div className="property-comparison-bar__actions">
        <button type="button" className="property-comparison-bar__compare" onClick={onCompare}>
          Comparar ahora
        </button>
        <button type="button" className="property-comparison-bar__clear" onClick={onClear}>
          <X size={16} aria-hidden="true" />
          Limpiar seleccion
        </button>
      </div>
    </div>
  );
}
