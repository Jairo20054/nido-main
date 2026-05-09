const Joi = require('joi');

const analyzeSchema = Joi.object({
  text: Joi.string().trim().min(1).max(4000).required(),
});

module.exports = { analyzeSchema };
