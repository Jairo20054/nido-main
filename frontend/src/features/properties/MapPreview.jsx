import React from 'react';
import { Home, LocateFixed, Minus, Plus } from 'lucide-react';

const PIN_POSITIONS = [
  { top: '22%', left: '54%' },
  { top: '34%', left: '38%' },
  { top: '40%', left: '68%' },
  { top: '57%', left: '30%' },
  { top: '64%', left: '58%' },
  { top: '76%', left: '44%' },
  { top: '27%', left: '72%' },
  { top: '70%', left: '74%' },
];

export function MapPreview({ location, properties }) {
  const visiblePins = properties.slice(0, PIN_POSITIONS.length);

  return (
    <section className="map-preview" aria-label="Vista preparada para mapa">
      <div className="map-preview__canvas">
        <span className="map-preview__zone map-preview__zone--primary">
          {location || 'Zona de busqueda'}
        </span>
        <span className="map-preview__radius" />
        <span className="map-preview__home">
          <Home size={18} aria-hidden="true" />
        </span>
        {visiblePins.map((property, index) => (
          <span
            key={property.id}
            className="map-preview__pin"
            style={PIN_POSITIONS[index]}
            title={property.title}
          />
        ))}
        <div className="map-preview__controls" aria-hidden="true">
          <span>
            <Plus size={15} />
          </span>
          <span>
            <Minus size={15} />
          </span>
          <span>
            <LocateFixed size={15} />
          </span>
        </div>
      </div>
      <p>Vista referencial lista para conectar con Google Maps, Mapbox o Leaflet.</p>
    </section>
  );
}
