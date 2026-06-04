import { Lock, MapPin } from 'lucide-react';
import PropertySection from './PropertySection';
import { getApproximateAddress, getLocationLabel } from './propertyDisplayUtils';

export default function PropertyLocation({ property }) {
  const location = getLocationLabel(property);

  return (
    <PropertySection title="Ubicacion">
      <article className="nido-location-card">
        <div className="nido-location-map" aria-label={`Mapa aproximado de ${location}`}>
          <MapPin size={36} aria-hidden="true" />
          <strong>{property.neighborhood || property.city || 'Zona por confirmar'}</strong>
          <span>{property.city || 'Colombia'}</span>
        </div>
        <div className="nido-location-copy">
          <h3>
            <MapPin size={18} />
            {location}
          </h3>
          <p>{property.zoneReference || getApproximateAddress(property)}</p>
          <span>
            <Lock size={13} />
            La direccion exacta se comparte al iniciar el proceso.
          </span>
        </div>
      </article>
    </PropertySection>
  );
}
