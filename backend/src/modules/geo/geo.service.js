const { badRequest, serviceUnavailable } = require('../../shared/errors');
const { prisma } = require('../../shared/prisma');

const MAPTILER_GEOCODING_URL = 'https://api.maptiler.com/geocoding';
const ORS_DIRECTIONS_URL = 'https://api.openrouteservice.org/v2/directions';

const requireEnvKey = (name, serviceName) => {
  const value = process.env[name];

  if (!value) {
    throw serviceUnavailable(`${serviceName} no esta configurado en el servidor`);
  }

  return value;
};

const sanitizeAddress = (value) =>
  String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/javascript:/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const getContextValue = (feature, keys) => {
  const context = feature?.context || {};
  const match = keys
    .map((key) => context[key])
    .find((item) => item?.name || item);

  return typeof match === 'string' ? match : match?.name || '';
};

const normalizeMapTilerFeature = (feature) => {
  const [longitude, latitude] = feature?.geometry?.coordinates || [];
  const displayName = feature?.place_name || feature?.text || feature?.properties?.name || '';

  return {
    latitude: toNumber(latitude),
    longitude: toNumber(longitude),
    displayName,
    address: feature?.place_name || displayName,
    city: getContextValue(feature, ['municipality', 'place', 'locality']),
    country: getContextValue(feature, ['country']),
    bbox: Array.isArray(feature?.bbox) ? feature.bbox.map(Number).filter(Number.isFinite) : undefined,
  };
};

const nearbyProperties = async ({ lat, lng, radiusKm, limit }) => {
  const radiusMeters = radiusKm * 1000;
  const rows = await prisma.$queryRaw`
    SELECT
      id::text,
      title,
      monthly_rent,
      latitude::float8,
      longitude::float8,
      address,
      address_line,
      city,
      ST_Distance(
        location,
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
      ) AS distance_meters
    FROM public.properties
    WHERE location IS NOT NULL
      AND ST_DWithin(
        location,
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
        ${radiusMeters}
      )
      AND status = 'published'
    ORDER BY distance_meters ASC
    LIMIT ${limit}
  `;

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    price: Number(row.monthly_rent || 0),
    latitude: toNumber(row.latitude),
    longitude: toNumber(row.longitude),
    address: row.address || row.address_line || '',
    city: row.city || '',
    distance_meters: Number(row.distance_meters || 0),
  }));
};

const fetchRoute = async ({ fromLat, fromLng, toLat, toLng, profile }) => {
  const orsKey = requireEnvKey('ORS_KEY', 'OpenRouteService');
  const response = await fetch(`${ORS_DIRECTIONS_URL}/${profile}/geojson`, {
    method: 'POST',
    headers: {
      Authorization: orsKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      coordinates: [
        [fromLng, fromLat],
        [toLng, toLat],
      ],
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw serviceUnavailable('No fue posible calcular la ruta en este momento');
  }

  const summary = payload?.features?.[0]?.properties?.summary || {};

  return {
    geojson: payload,
    distanceKm: Number((Number(summary.distance || 0) / 1000).toFixed(2)),
    durationMinutes: Number((Number(summary.duration || 0) / 60).toFixed(1)),
  };
};

const geocodeAddress = async ({ address }) => {
  const mapTilerKey = requireEnvKey('MAPTILER_KEY', 'MapTiler Geocoding');
  const cleanedAddress = sanitizeAddress(address);

  if (!cleanedAddress) {
    throw badRequest('Ingresa una direccion valida');
  }

  const url = new URL(`${MAPTILER_GEOCODING_URL}/${encodeURIComponent(cleanedAddress)}.json`);
  url.searchParams.set('key', mapTilerKey);
  url.searchParams.set('country', 'co');
  url.searchParams.set('language', 'es');
  url.searchParams.set('limit', '6');

  const response = await fetch(url);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw serviceUnavailable('No fue posible geocodificar la direccion');
  }

  return {
    results: (payload.features || [])
      .map(normalizeMapTilerFeature)
      .filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude)),
  };
};

const reverseGeocode = async ({ latitude, longitude }) => {
  const mapTilerKey = requireEnvKey('MAPTILER_KEY', 'MapTiler Geocoding');
  const url = new URL(`${MAPTILER_GEOCODING_URL}/${longitude},${latitude}.json`);
  url.searchParams.set('key', mapTilerKey);
  url.searchParams.set('language', 'es');
  url.searchParams.set('limit', '1');

  const response = await fetch(url);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw serviceUnavailable('No fue posible consultar la direccion de la ubicacion');
  }

  const result = normalizeMapTilerFeature(payload.features?.[0] || {});

  return {
    latitude,
    longitude,
    displayName: result.displayName || 'Ubicacion seleccionada',
    address: result.address || '',
    city: result.city || '',
    country: result.country || '',
  };
};

module.exports = {
  fetchRoute,
  geocodeAddress,
  nearbyProperties,
  reverseGeocode,
};
