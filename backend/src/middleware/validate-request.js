const HttpError = require('../utils/http-error');

const validateRequest = (schema, target = 'body') => (req, _res, next) => {
  const { error, value } = schema.validate(req[target], {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  });

  if (error) {
    return next(
      new HttpError(
        400,
        'Los datos enviados no son validos.',
        error.details.map((detail) => detail.message)
      )
    );
  }

  req[target] = value;
  return next();
};

module.exports = validateRequest;
