import { frontendEnv } from './env';

export const MAPTILER_KEY = frontendEnv.VITE_MAPTILER_KEY || '';

export const MAP_STYLES = {
  streets: `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`,
  satellite: `https://api.maptiler.com/maps/satellite/style.json?key=${MAPTILER_KEY}`,
  light: `https://api.maptiler.com/maps/dataviz-light/style.json?key=${MAPTILER_KEY}`,
} as const;

export const DEFAULT_CENTER: [number, number] = [-76.532, 3.451];
export const DEFAULT_ZOOM = 13;

export const hasMapTilerKey = Boolean(MAPTILER_KEY);

export const getStaticMapUrl = ({
  latitude,
  longitude,
  width = 560,
  height = 280,
  zoom = 14,
}: {
  latitude?: number | null;
  longitude?: number | null;
  width?: number;
  height?: number;
  zoom?: number;
}) => {
  if (!hasMapTilerKey || !Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) {
    return '';
  }

  return `https://api.maptiler.com/maps/streets-v2/static/${longitude},${latitude},${zoom}/${width}x${height}@2x.png?key=${MAPTILER_KEY}&attribution=false`;
};
