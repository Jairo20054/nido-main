export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface NearbyProperty extends GeoPoint {
  id: string;
  title: string;
  price: number;
  address?: string;
  city?: string;
  distance_meters: number;
}

export interface GeocodeResult extends GeoPoint {
  displayName: string;
  address: string;
  city?: string;
  country?: string;
  bbox?: number[];
}

export interface LocationPayload extends GeoPoint {
  address?: string;
  city?: string;
  country?: string;
}

export interface RouteSummary {
  geojson: GeoJSON.FeatureCollection;
  distanceKm: number;
  durationMinutes: number;
}
