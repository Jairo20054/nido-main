const { createClient } = require('@supabase/supabase-js');
const { env } = require('./env');

const supabaseUrl = env.SUPABASE_URL;
const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
let validatedSupabaseUrl = supabaseUrl;

const warnDevSupabaseUnavailable = (message) => {
  if (env.NODE_ENV === 'production') {
    throw new Error(message);
  }

  console.warn(`${message}. Los endpoints de autenticacion responderan 400/401 hasta configurar Supabase.`);
};

if (!supabaseUrl || !supabaseServiceRoleKey) {
  warnDevSupabaseUnavailable(
    '[Nido] SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no estan definidas en el .env del backend'
  );
  validatedSupabaseUrl = '';
}

if (validatedSupabaseUrl) {
  try {
    new URL(validatedSupabaseUrl);
  } catch (_error) {
    warnDevSupabaseUnavailable('[Nido] SUPABASE_URL no es una URL valida de Supabase');
    validatedSupabaseUrl = '';
  }
}

// Centraliza la creacion de clientes de Supabase para evitar configuraciones
// inconsistentes entre operaciones anonimas y administrativas.
// Fabrica clientes de Supabase con configuracion adecuada para uso en backend.
const createSupabaseClient = (key, authOptions = {}) => {
  if (!validatedSupabaseUrl || !key) {
    return null;
  }

  return createClient(validatedSupabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
      ...authOptions,
    },
  });
};

// Cliente anonimo para operaciones de usuario final y cliente service para tareas administrativas.
// Nunca se usa service_role como reemplazo del anon key: aunque sea backend, mezclar
// privilegios vuelve peligrosos los flujos de registro/login y dificulta auditar RLS.
const supabaseAnon = createSupabaseClient(env.SUPABASE_ANON_KEY);
const supabaseService = createSupabaseClient(supabaseServiceRoleKey);

module.exports = {
  createSupabaseClient,
  supabase: supabaseAnon,
  supabaseAdmin: supabaseService,
  supabaseAnon,
  supabaseService,
};
