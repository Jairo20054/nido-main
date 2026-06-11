import { Lock, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { NearbyPropertiesMap } from '../map/NearbyPropertiesMap';
import PropertySection from './PropertySection';
import { getApproximateAddress, getLocationLabel } from './propertyDisplayUtils';
import { fetchNearbyProperties } from '../../services/geoService';
import { hasValidCoordinates } from '../../utils/geo';

export default function PropertyLocation({ property }) {
  const location = getLocationLabel(property);
  const hasCoordinates = hasValidCoordinates(property.latitude, property.longitude);
  const nearbyQuery = useQuery({
    queryKey: ['nearby-properties', property.id, property.latitude, property.longitude],
    queryFn: () =>
      fetchNearbyProperties({
        lat: Number(property.latitude),
        lng: Number(property.longitude),
        radiusKm: 3,
        limit: 8,
      }),
    enabled: hasCoordinates,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <PropertySection title="Ubicacion">
      <article className="nido-location-card">
        {hasCoordinates ? (
          <NearbyPropertiesMap
            latitude={property.latitude}
            longitude={property.longitude}
            address={getApproximateAddress(property)}
            properties={nearbyQuery.data || []}
          />
        ) : (
          <div className="nido-location-map" aria-label={`Mapa aproximado de ${location}`}>
            <MapPin size={36} aria-hidden="true" />
            <strong>Ubicacion no disponible</strong>
            <span>Esta propiedad aun no tiene ubicacion disponible.</span>
          </div>
        )}
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
