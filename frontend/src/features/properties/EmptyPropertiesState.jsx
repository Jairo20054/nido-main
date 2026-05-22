import React from 'react';
import { Home, RotateCcw, Sparkles } from 'lucide-react';

export function EmptyPropertiesState({ hasFilters, onClear, onPopular }) {
  const title = hasFilters
    ? 'No encontramos propiedades con estos filtros'
    : 'No hay propiedades disponibles';
  const description = hasFilters
    ? 'Intenta ampliar el presupuesto, cambiar la zona o eliminar algunos filtros.'
    : 'Cuando haya nuevas publicaciones disponibles las veras aqui.';

  return (
    <section className="empty-properties-state" aria-live="polite">
      <div className="empty-properties-state__icon">
        <Home size={30} aria-hidden="true" />
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="empty-properties-state__actions">
        <button type="button" className="button button--secondary" onClick={onClear}>
          <RotateCcw size={16} aria-hidden="true" />
          Limpiar filtros
        </button>
        <button type="button" className="button" onClick={onPopular}>
          <Sparkles size={16} aria-hidden="true" />
          Ver propiedades populares
        </button>
      </div>
    </section>
  );
}
