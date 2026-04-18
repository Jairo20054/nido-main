module.exports = (_req, res) => {
  res.status(404).json({
    error: {
      message: 'El recurso solicitado no existe.'
    }
  });
};
