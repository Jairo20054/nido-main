import React, { useEffect, useMemo, useRef } from 'react';
import maplibregl, { Marker } from 'maplibre-gl';
import { MapPin } from 'lucide-react';
import { DEFAULT_ZOOM, hasMapTilerKey } from '../../lib/map';
import { useMapInstance } from '../../hooks/useMapInstance';
import type { NearbyProperty } from '../../types/geo';
import { formatDistance, hasValidCoordinates } from '../../utils/geo';

type PropertyMapProps = {
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  title?: string;
  nearbyProperties?: NearbyProperty[];
  showNearby?: boolean;
  zoom?: number;
  heightClassName?: string;
  compact?: boolean;
};

const createMarkerElement = (className: string, label: string) => {
  const element = document.createElement('button');
  element.type = 'button';
  element.className = className;
  element.setAttribute('aria-label', label);
  element.title = label;
  return element;
};

export function PropertyMap({
  latitude,
  longitude,
  address,
  title = 'Propiedad',
  nearbyProperties = [],
  showNearby = false,
  zoom = DEFAULT_ZOOM,
  heightClassName = 'nido-map--detail',
  compact = false,
}: PropertyMapProps) {
  const hasCoordinates = hasValidCoordinates(latitude, longitude);
  const center = useMemo<[number, number] | undefined>(
    () => (hasCoordinates ? [Number(longitude), Number(latitude)] : undefined),
    [hasCoordinates, latitude, longitude]
  );
  const markerRef = useRef<Marker | null>(null);
  const nearbyMarkersRef = useRef<Marker[]>([]);
  const { containerRef, error, loaded, map } = useMapInstance({
    center,
    zoom,
    interactive: true,
  });

  useEffect(() => {
    if (!map || !loaded || !center) return undefined;

    markerRef.current?.remove();
    const element = createMarkerElement('nido-map-marker nido-map-marker--primary', `Ubicacion de ${title}`);
    markerRef.current = new maplibregl.Marker({ element }).setLngLat(center).addTo(map);
    map.flyTo({ center, zoom, essential: false });

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
    };
  }, [center, loaded, map, title, zoom]);

  useEffect(() => {
    if (!map || !loaded || !showNearby) return undefined;

    nearbyMarkersRef.current.forEach((marker) => marker.remove());
    nearbyMarkersRef.current = nearbyProperties
      .filter((property) => hasValidCoordinates(property.latitude, property.longitude))
      .map((property) => {
        const element = createMarkerElement('nido-map-marker nido-map-marker--nearby', property.title);
        const popup = new maplibregl.Popup({ closeButton: false, offset: 18 }).setText(
          `${property.title}${property.distance_meters ? ` - ${formatDistance(property.distance_meters)}` : ''}`
        );

        return new maplibregl.Marker({ element })
          .setLngLat([property.longitude, property.latitude])
          .setPopup(popup)
          .addTo(map);
      });

    return () => {
      nearbyMarkersRef.current.forEach((marker) => marker.remove());
      nearbyMarkersRef.current = [];
    };
  }, [loaded, map, nearbyProperties, showNearby]);

  if (!hasCoordinates) {
    return (
      <div className={`nido-map-fallback ${heightClassName}`} role="status">
        <MapPin size={28} aria-hidden="true" />
        <strong>Ubicacion no disponible</strong>
        <span>Esta propiedad aun no tiene ubicacion disponible.</span>
      </div>
    );
  }

  if (!hasMapTilerKey) {
    return (
      <div className={`nido-map-fallback ${heightClassName}`} role="status">
        <MapPin size={28} aria-hidden="true" />
        <strong>{address || title}</strong>
        <span>Configura VITE_MAPTILER_KEY para ver el mapa interactivo.</span>
      </div>
    );
  }

  return (
    <div className={`nido-map-shell ${heightClassName} ${compact ? 'nido-map-shell--compact' : ''}`.trim()}>
      <div ref={containerRef} className="nido-map-canvas" aria-label={`Mapa de ${address || title}`} />
      {error ? <div className="nido-map-error">{error}</div> : null}
    </div>
  );
}
