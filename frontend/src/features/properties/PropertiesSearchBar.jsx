import React, { useEffect, useState } from 'react';
import { MapPin, Search } from 'lucide-react';

const QUICK_LOCATIONS = ['Bogota', 'Medellin', 'Cali', 'Laureles', 'Chapinero', 'Granada'];

export function PropertiesSearchBar({ filters, activeCount, onChange }) {
  const [draftLocation, setDraftLocation] = useState(filters.location);

  useEffect(() => {
    setDraftLocation(filters.location);
  }, [filters.location]);

  const submitSearch = (event) => {
    event.preventDefault();
    onChange('city', '');
    onChange('department', '');
    onChange('neighborhood', '');
    onChange('location', draftLocation.trim());
  };

  return (
    <form className="properties-search-bar properties-search-bar--marketplace" onSubmit={submitSearch}>
      <label className="properties-search-bar__field properties-search-bar__field--location">
        <span>Buscar por ciudad, barrio o zona</span>
        <div>
          <MapPin size={18} aria-hidden="true" />
          <input
            type="text"
            value={draftLocation}
            onChange={(event) => setDraftLocation(event.target.value)}
            placeholder="Ej: Cali, Medellin, Laureles, Granada"
            aria-label="Ciudad, departamento, barrio o zona"
          />
        </div>
      </label>

      <div className="properties-search-bar__active" aria-live="polite">
        <strong>{activeCount}</strong>
        filtros activos
      </div>

      <button className="properties-search-bar__submit" type="submit">
        <Search size={18} aria-hidden="true" />
        Buscar
      </button>

      <div className="properties-search-bar__quick" aria-label="Ubicaciones sugeridas">
        <span>Sugeridas:</span>
        {QUICK_LOCATIONS.map((location) => {
          const active = filters.location === location || filters.city === location || filters.neighborhood === location;

          return (
            <button
              key={location}
              type="button"
              className={`properties-search-bar__chip ${
                active ? 'properties-search-bar__chip--active' : ''
              }`}
              onClick={() => {
                setDraftLocation(location);
                onChange('city', '');
                onChange('department', '');
                onChange('neighborhood', '');
                onChange('location', location);
              }}
              aria-pressed={active}
            >
              {location}
            </button>
          );
        })}
      </div>
    </form>
  );
}
