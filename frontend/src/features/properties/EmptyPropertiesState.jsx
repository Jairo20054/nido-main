import React from 'react';
import { Home, RotateCcw, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export function EmptyPropertiesState({ hasFilters, onClear, onPopular }) {
  const title = hasFilters
    ? 'No encontramos propiedades con estos filtros'
    : 'No hay propiedades disponibles';
  const description = hasFilters
    ? 'Prueba quitando algunos filtros o buscando otra ubicacion.'
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
        <Link to="/" className="button button--secondary">
          <Home size={16} aria-hidden="true" />
          Volver al inicio
        </Link>
      </div>
    </section>
  );
}
