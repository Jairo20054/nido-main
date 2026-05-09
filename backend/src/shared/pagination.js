const Joi = require('joi');

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

const paginationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(DEFAULT_PAGE),
  limit: Joi.number().integer().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});

const getPagination = (query = {}) => {
  const page = Number(query.page || DEFAULT_PAGE);
  const limit = Number(query.limit || DEFAULT_PAGE_SIZE);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
};

const buildPaginationMeta = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  pages: Math.ceil(total / limit),
});

module.exports = {
  buildPaginationMeta,
  getPagination,
  paginationQuerySchema,
};
