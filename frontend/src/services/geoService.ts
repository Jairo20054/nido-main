import { api } from '../lib/apiClient';
import type { GeocodeResult, LocationPayload, NearbyProperty, RouteSummary } from '../types/geo';

export const fetchNearbyProperties = async ({
  lat,
  lng,
  radiusKm = 5,
  limit = 20,
}: {
  lat: number;
  lng: number;
  radiusKm?: number;
  limit?: number;
}): Promise<NearbyProperty[]> => {
  const response = await api.get('/geo/nearby', {
    auth: false,
    query: { lat, lng, radiusKm, limit },
  });

  return response.data || [];
};

export const fetchRoute = async ({
  fromLat,
  fromLng,
  toLat,
  toLng,
  profile = 'driving-car',
}: {
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
  profile?: 'driving-car' | 'foot-walking' | 'cycling-regular';
}): Promise<RouteSummary> => {
  const response = await api.get('/geo/route', {
    auth: false,
    query: { fromLat, fromLng, toLat, toLng, profile },
  });

  return response.data;
};

export const geocodeAddress = async (address: string): Promise<GeocodeResult[]> => {
  const response = await api.post('/geo/geocode', { address }, { auth: false });
  return response.data?.results || [];
};

export const reverseGeocode = async (payload: LocationPayload): Promise<GeocodeResult | null> => {
  const response = await api.post('/geo/reverse-geocode', payload, { auth: false });
  return response.data || null;
};

export const updatePropertyLocation = async (propertyId: string, payload: LocationPayload) => {
  const response = await api.patch(`/properties/${propertyId}/location`, payload);
  return response.data;
};
