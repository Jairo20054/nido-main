import React from 'react';
import { PROPERTY_TYPE_OPTIONS, SORT_OPTIONS } from '../../lib/constants';

export function PropertyFilters({ filters, onChange, onApply, onClear, compact = false }) {
  return (
    <form
      className={`filter-panel ${compact ? 'filter-panel--compact' : ''}`}
      onSubmit={(event) => {
        event.preventDefault();
        onApply();
      }}
    >
      <div className="field-group">
        <label htmlFor="city">Ciudad</label>
        <input id="city" value={filters.city} onChange={(event) => onChange('city', event.target.value)} placeholder="Ej. Medellin" />
      </div>

      <div className="field-grid">
        <div className="field-group">
          <label htmlFor="propertyType">Tipo</label>
          <select
            id="propertyType"
            value={filters.propertyType}
            onChange={(event) => onChange('propertyType', event.target.value)}
          >
            <option value="">Todos</option>
            {PROPERTY_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label htmlFor="sort">Orden</label>
          <select id="sort" value={filters.sort} onChange={(event) => onChange('sort', event.target.value)}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field-grid">
        <div className="field-group">
          <label htmlFor="minRent">Canon minimo</label>
          <input
            id="minRent"
            type="number"
            value={filters.minRent}
            onChange={(event) => onChange('minRent', event.target.value)}
            placeholder="1800000"
          />
        </div>
        <div className="field-group">
          <label htmlFor="maxRent">Canon maximo</label>
          <input
            id="maxRent"
            type="number"
            value={filters.maxRent}
            onChange={(event) => onChange('maxRent', event.target.value)}
            placeholder="4500000"
          />
        </div>
      </div>

      <div className="field-grid">
        <div className="field-group">
          <label htmlFor="bedrooms">Habitaciones</label>
          <input
            id="bedrooms"
            type="number"
            min="0"
            value={filters.bedrooms}
            onChange={(event) => onChange('bedrooms', event.target.value)}
          />
        </div>
        <div className="field-group">
          <label htmlFor="bathrooms">Banos</label>
          <input
            id="bathrooms"
            type="number"
            min="1"
            value={filters.bathrooms}
            onChange={(event) => onChange('bathrooms', event.target.value)}
          />
        </div>
      </div>

      <div className="field-grid">
        <label className="checkbox">
          <input
            type="checkbox"
            checked={filters.furnished}
            onChange={(event) => onChange('furnished', event.target.checked)}
          />
          Amoblado
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={filters.petsAllowed}
            onChange={(event) => onChange('petsAllowed', event.target.checked)}
          />
          Acepta mascotas
        </label>
      </div>

      <div className="filter-panel__actions">
        <button className="button" type="submit">
          Aplicar
        </button>
        <button className="button button--secondary" type="button" onClick={onClear}>
          Limpiar
        </button>
      </div>
    </form>
  );
}
