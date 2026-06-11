const geoService = require('./geo.service');

const getNearbyProperties = async (req, res) => {
  const data = await geoService.nearbyProperties({
    lat: req.query.lat,
    lng: req.query.lng,
    radiusKm: req.query.radiusKm,
    limit: req.query.limit,
  });

  res.json({
    success: true,
    data,
  });
};

const getRoute = async (req, res) => {
  const data = await geoService.fetchRoute(req.query);

  res.json({
    success: true,
    data,
  });
};

const geocode = async (req, res) => {
  const data = await geoService.geocodeAddress(req.body);

  res.json({
    success: true,
    data,
  });
};

const reverseGeocode = async (req, res) => {
  const data = await geoService.reverseGeocode(req.body);

  res.json({
    success: true,
    data,
  });
};

module.exports = {
  geocode,
  getNearbyProperties,
  getRoute,
  reverseGeocode,
};
