import { useEffect, useRef, useState } from 'react';
import maplibregl, { Map } from 'maplibre-gl';
import { DEFAULT_CENTER, DEFAULT_ZOOM, MAP_STYLES, hasMapTilerKey } from '../lib/map';

export function useMapInstance({
  center,
  zoom = DEFAULT_ZOOM,
  interactive = true,
  style = MAP_STYLES.streets,
}: {
  center?: [number, number];
  zoom?: number;
  interactive?: boolean;
  style?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !hasMapTilerKey) return undefined;

    setError('');
    setLoaded(false);

    try {
      const map = new maplibregl.Map({
        container: containerRef.current,
        style,
        center: center || DEFAULT_CENTER,
        zoom,
        interactive,
        attributionControl: false,
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
      map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
      map.on('load', () => setLoaded(true));
      map.on('error', () => setError('No se pudo cargar el mapa.'));
      mapRef.current = map;
    } catch (_error) {
      setError('No se pudo cargar el mapa.');
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      setLoaded(false);
    };
  }, [center?.[0], center?.[1], interactive, style, zoom]);

  return {
    containerRef,
    error,
    loaded,
    map: mapRef.current,
  };
}
