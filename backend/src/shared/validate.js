const { badRequest } = require('./errors');

const validate = (schema, source = 'body') => (req, _res, next) => {
  const { value, error } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    return next(
      badRequest(
        'Hay campos por corregir',
        error.details.map((item) => item.message)
      )
    );
  }

  req[source] = value;
  return next();
};

module.exports = { validate };
