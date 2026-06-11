import React, { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl, { Marker } from 'maplibre-gl';
import { Crosshair, MapPin } from 'lucide-react';
import { DEFAULT_CENTER, hasMapTilerKey } from '../../lib/map';
import { useMapInstance } from '../../hooks/useMapInstance';
import { reverseGeocode } from '../../services/geoService';
import type { GeocodeResult, LocationPayload } from '../../types/geo';
import { hasValidCoordinates } from '../../utils/geo';
import { AddressAutocomplete } from './AddressAutocomplete';

type LocationPickerProps = {
  initialLat?: number | null;
  initialLng?: number | null;
  initialAddress?: string;
  initialCity?: string;
  onLocationChange: (payload: LocationPayload) => void;
};

export function LocationPicker({
  initialLat,
  initialLng,
  initialAddress = '',
  initialCity = '',
  onLocationChange,
}: LocationPickerProps) {
  const initialHasCoordinates = hasValidCoordinates(initialLat, initialLng);
  const [point, setPoint] = useState<LocationPayload | null>(
    initialHasCoordinates
      ? {
          latitude: Number(initialLat),
          longitude: Number(initialLng),
          address: initialAddress,
          city: initialCity,
          country: 'CO',
        }
      : null
  );
  const [address, setAddress] = useState(initialAddress);
  const [status, setStatus] = useState('');
  const markerRef = useRef<Marker | null>(null);
  const center = useMemo<[number, number]>(
    () => (point ? [point.longitude, point.latitude] : DEFAULT_CENTER),
    [point]
  );
  const { containerRef, error, loaded, map } = useMapInstance({
    center,
    zoom: point ? 15 : 12,
    interactive: true,
  });

  useEffect(() => {
    if (!map || !loaded || !point) return undefined;

    markerRef.current?.remove();
    const element = document.createElement('button');
    element.type = 'button';
    element.className = 'nido-map-marker nido-map-marker--draggable';
    element.setAttribute('aria-label', 'Mover ubicacion de la propiedad');
    element.title = 'Mover ubicacion de la propiedad';

    markerRef.current = new maplibregl.Marker({ draggable: true, element })
      .setLngLat([point.longitude, point.latitude])
      .addTo(map);

    markerRef.current.on('dragend', async () => {
      const lngLat = markerRef.current?.getLngLat();
      if (!lngLat) return;

      const nextPoint = {
        latitude: Number(lngLat.lat.toFixed(6)),
        longitude: Number(lngLat.lng.toFixed(6)),
        address,
        city: point.city,
        country: point.country || 'CO',
      };
      setPoint(nextPoint);
      onLocationChange(nextPoint);
      setStatus('Buscando direccion cercana...');

      try {
        const result = await reverseGeocode(nextPoint);
        if (result?.address) {
          const updated = {
            ...nextPoint,
            address: result.address,
            city: result.city || nextPoint.city,
            country: result.country || nextPoint.country,
          };
          setAddress(updated.address || '');
          setPoint(updated);
          onLocationChange(updated);
        }
        setStatus('');
      } catch (_error) {
        setStatus('Coordenadas actualizadas. No encontramos direccion cercana.');
      }
    });

    map.flyTo({ center: [point.longitude, point.latitude], zoom: 15, essential: false });

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
    };
  }, [address, loaded, map, onLocationChange, point]);

  const applyResult = (result: GeocodeResult) => {
    const nextPoint = {
      latitude: result.latitude,
      longitude: result.longitude,
      address: result.address || result.displayName,
      city: result.city || initialCity,
      country: result.country || 'CO',
    };

    setAddress(nextPoint.address || '');
    setPoint(nextPoint);
    setStatus('');
    onLocationChange(nextPoint);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setStatus('Tu navegador no permite obtener la ubicacion.');
      return;
    }

    setStatus('Solicitando ubicacion...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextPoint = {
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6)),
          address,
          city: initialCity,
          country: 'CO',
        };
        setPoint(nextPoint);
        setStatus('');
        onLocationChange(nextPoint);
      },
      () => setStatus('No pudimos obtener tu ubicacion. Puedes buscar la direccion manualmente.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="nido-location-picker">
      <AddressAutocomplete value={address} onSelect={applyResult} onChange={setAddress} />
      <div className="nido-location-picker__toolbar">
        <button type="button" className="button button--secondary" onClick={useCurrentLocation}>
          <Crosshair size={16} aria-hidden="true" />
          Usar mi ubicacion
        </button>
        {point ? (
          <span>
            <MapPin size={14} aria-hidden="true" />
            {point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}
          </span>
        ) : null}
      </div>
      {hasMapTilerKey ? (
        <div className="nido-map-shell nido-map--picker">
          <div ref={containerRef} className="nido-map-canvas" aria-label="Selector de ubicacion de propiedad" />
          {error ? <div className="nido-map-error">{error}</div> : null}
        </div>
      ) : (
        <div className="nido-map-fallback nido-map--picker" role="status">
          <MapPin size={28} aria-hidden="true" />
          <strong>Mapa pendiente de configuracion</strong>
          <span>Configura VITE_MAPTILER_KEY para activar el selector visual.</span>
        </div>
      )}
      {status ? <p className="nido-location-picker__status">{status}</p> : null}
    </div>
  );
}
