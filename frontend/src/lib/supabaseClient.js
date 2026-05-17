import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

const missingSupabaseConfigMessage =
  'La autenticación no está configurada. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY o VITE_SUPABASE_PUBLISHABLE_KEY.';
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
      exchangeCodeForSession: missing,
      resetPasswordForEmail: missing,
      setSession: missing,
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

const withProtocol = (value) => {
  if (!value) {
    return '';
  }

  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
};

export const getSiteUrl = () => {
  const runtimeOrigin =
    typeof window !== 'undefined' && window.location?.origin ? window.location.origin : '';
  const configuredOrigin = withProtocol(
    import.meta.env.VITE_SITE_URL || import.meta.env.VITE_VERCEL_URL || runtimeOrigin
  );

  return configuredOrigin.replace(/\/$/, '');
};

// URL de retorno usada por el flujo de restablecimiento de contrasena.
export const getPasswordResetUrl = () =>
  import.meta.env.VITE_SUPABASE_REDIRECT_URL || `${getSiteUrl()}/reset-password`;

export const getEmailConfirmationUrl = () =>
  import.meta.env.VITE_SUPABASE_EMAIL_CONFIRMATION_URL || `${getSiteUrl()}/email-confirmed`;

export const getOAuthCallbackUrl = () =>
  import.meta.env.VITE_SUPABASE_OAUTH_REDIRECT_URL || `${getSiteUrl()}/auth/callback`;

export const getSupabaseConfigError = () => missingSupabaseConfigMessage;
