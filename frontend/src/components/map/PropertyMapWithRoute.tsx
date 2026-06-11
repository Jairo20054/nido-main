import React, { useEffect, useMemo } from 'react';
import { Route } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchRoute } from '../../services/geoService';
import { PropertyMap } from './PropertyMap';
import { hasValidCoordinates } from '../../utils/geo';

type PropertyMapWithRouteProps = {
  fromLat?: number | null;
  fromLng?: number | null;
  toLat?: number | null;
  toLng?: number | null;
  profile?: 'driving-car' | 'foot-walking' | 'cycling-regular';
  address?: string;
};

export function PropertyMapWithRoute({
  fromLat,
  fromLng,
  toLat,
  toLng,
  profile = 'driving-car',
  address,
}: PropertyMapWithRouteProps) {
  const enabled = hasValidCoordinates(fromLat, fromLng) && hasValidCoordinates(toLat, toLng);
  const query = useQuery({
    queryKey: ['property-route', fromLat, fromLng, toLat, toLng, profile],
    queryFn: () =>
      fetchRoute({
        fromLat: Number(fromLat),
        fromLng: Number(fromLng),
        toLat: Number(toLat),
        toLng: Number(toLng),
        profile,
      }),
    enabled,
    staleTime: 2 * 60 * 1000,
  });

  const routeLine = useMemo(() => query.data?.geojson?.features?.[0]?.geometry || null, [query.data]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('nido-route-preview', { detail: routeLine }));
  }, [routeLine]);

  return (
    <div className="nido-route-map">
      <PropertyMap latitude={toLat} longitude={toLng} address={address} />
      <div className="nido-route-map__summary" aria-live="polite">
        <Route size={16} aria-hidden="true" />
        {query.isLoading ? <span>Calculando ruta...</span> : null}
        {query.data ? (
          <span>
            {query.data.distanceKm} km - {query.data.durationMinutes} min aprox.
          </span>
        ) : null}
        {query.error ? <span>No se pudo calcular la ruta.</span> : null}
      </div>
    </div>
  );
}
