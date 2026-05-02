const { analyzeText } = require('./deepsek.client');
const { badRequest } = require('../../shared/errors');

const analyze = async (req, res) => {
  const { text } = req.body || {};

  if (typeof text !== 'string' || text.trim().length === 0) {
    throw badRequest('Campo "text" requerido');
  }

  const result = await analyzeText(text);

  res.json({ success: true, data: result });
};

module.exports = { analyze };
