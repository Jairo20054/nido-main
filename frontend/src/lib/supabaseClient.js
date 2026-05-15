import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
const siteUrl = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '');
const adminLoginAlias = (import.meta.env.VITE_ADMIN_LOGIN_ALIAS || 'admin').trim().toLowerCase();
const adminLoginEmail = (import.meta.env.VITE_ADMIN_LOGIN_EMAIL || 'admin@nido.local')
  .trim()
  .toLowerCase();

const missingSupabaseConfigMessage =
  'La autenticacion no esta configurada. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY o VITE_SUPABASE_PUBLISHABLE_KEY.';
const hasPlaceholderConfig =
  /your-project\.supabase\.co/i.test(String(supabaseUrl || '')) ||
  /^your-(anon|publishable|secret|service)/i.test(String(supabaseAnonKey || '').trim());
export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey && !hasPlaceholderConfig);

// Punto unico de integracion del cliente web con Supabase Auth.
// Cliente de respaldo para no romper la aplicacion en entornos donde faltan variables
// de Supabase; los metodos fallan solo cuando realmente se intenta usarlos.
const createMissingConfigClient = () => {
  const missing = () => {
    throw new Error(missingSupabaseConfigMessage);
  };

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      resetPasswordForEmail: missing,
      signInWithPassword: missing,
      signOut: missing,
      signUp: missing,
      updateUser: missing,
    },
  };
};

// Cliente principal usado por el flujo de autenticacion del frontend.
export const supabase =
  hasSupabaseConfig
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          detectSessionInUrl: true,
          persistSession: true,
          flowType: 'pkce',
        },
      })
    : createMissingConfigClient();

// URL de retorno usada por el flujo de restablecimiento de contrasena.
export const getPasswordResetUrl = () =>
  import.meta.env.VITE_SUPABASE_REDIRECT_URL || `${siteUrl}/reset-password`;

export const getEmailConfirmationUrl = () =>
  import.meta.env.VITE_SUPABASE_EMAIL_CONFIRMATION_URL || `${siteUrl}/login`;

// Permite iniciar sesion con un alias funcional para el admin sin exponer
// una UX distinta al resto de usuarios.
export const resolveAuthEmail = (value) => {
  const normalized = String(value || '').trim().toLowerCase();

  if (!normalized) {
    return '';
  }

  return normalized === adminLoginAlias ? adminLoginEmail : normalized;
};

export const getSupabaseConfigError = () => missingSupabaseConfigMessage;
