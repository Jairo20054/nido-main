const { createClient } = require('@supabase/supabase-js');
const { env } = require('./env');

// Centraliza la creacion de clientes de Supabase para evitar configuraciones
// inconsistentes entre operaciones anonimas y administrativas.
// Fabrica clientes de Supabase con configuracion adecuada para uso en backend.
const createSupabaseClient = (key, authOptions = {}) => {
  if (!env.SUPABASE_URL || !key) {
    return null;
  }

  try {
    const parsedUrl = new URL(env.SUPABASE_URL);

    if (!parsedUrl.hostname.endsWith('.supabase.co')) {
      return null;
    }
  } catch (_error) {
    return null;
  }

  return createClient(env.SUPABASE_URL, key, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
      ...authOptions,
    },
  });
};

// Cliente anonimo para operaciones de usuario final y cliente service para tareas administrativas.
const supabaseAnon = createSupabaseClient(env.SUPABASE_ANON_KEY);
const supabaseService = createSupabaseClient(env.SUPABASE_SERVICE_ROLE_KEY);

module.exports = {
  createSupabaseClient,
  supabaseAnon,
  supabaseService,
};
