// Adaptador para controladores async de Express, evitando try/catch repetidos por ruta.
const asyncHandler = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    next(error);
  }
};

module.exports = { asyncHandler };
