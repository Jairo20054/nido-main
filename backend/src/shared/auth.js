const {
  attachUser,
  requireAuth,
  requireAuthOptional,
  requireRole,
  requireOwnership,
} = require('./supabase-auth-middleware');

const optionalAuth = requireAuthOptional;

module.exports = {
  optionalAuth,
  requireAuth,
  attachUser,
  requireRole,
  requireOwnership,
};
