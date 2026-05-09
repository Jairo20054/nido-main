const { tooManyRequests } = require('./errors');

const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_MAX_REQUESTS = 20;

const getClientKey = (req, prefix) => {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';

  return `${prefix}:${ip}`;
};

const createRateLimiter = ({
  windowMs = DEFAULT_WINDOW_MS,
  max = DEFAULT_MAX_REQUESTS,
  keyPrefix = 'global',
  message,
} = {}) => {
  const attempts = new Map();
  let lastCleanup = 0;

  return (req, res, next) => {
    const now = Date.now();

    if (now - lastCleanup > windowMs) {
      attempts.forEach((entry, key) => {
        if (entry.expiresAt <= now) {
          attempts.delete(key);
        }
      });
      lastCleanup = now;
    }

    const key = getClientKey(req, keyPrefix);
    const current = attempts.get(key);

    if (!current || current.expiresAt <= now) {
      attempts.set(key, {
        count: 1,
        expiresAt: now + windowMs,
      });
      return next();
    }

    current.count += 1;

    if (current.count > max) {
      const retryAfterSeconds = Math.ceil((current.expiresAt - now) / 1000);
      res.set('Retry-After', String(retryAfterSeconds));
      return next(tooManyRequests(message));
    }

    return next();
  };
};

module.exports = {
  createRateLimiter,
};
