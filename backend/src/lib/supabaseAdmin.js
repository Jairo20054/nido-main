// Canonical server-only Supabase admin client export.
// This module must never be imported from frontend code.
const { supabaseAdmin } = require('../shared/supabase');

module.exports = { supabaseAdmin };
