import { createClient } from '@supabase/supabase-js';
import { frontendEnv } from './env';

const supabaseUrl = frontendEnv.VITE_SUPABASE_URL;
const supabaseAnonKey = frontendEnv.VITE_SUPABASE_ANON_KEY;

const missingSupabaseConfigMessage =
  'La autenticación no está configurada. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY o VITE_SUPABASE_PUBLISHABLE_KEY.';
export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

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
      resend: missing,
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
    frontendEnv.VITE_SITE_URL || frontendEnv.VITE_VERCEL_URL || runtimeOrigin
  );

  return configuredOrigin.replace(/\/$/, '');
};

// URL de retorno usada por el flujo de restablecimiento de contrasena.
export const getPasswordResetUrl = () =>
  frontendEnv.VITE_SUPABASE_REDIRECT_URL || `${getSiteUrl()}/reset-password`;

export const getEmailConfirmationUrl = () =>
  frontendEnv.VITE_SUPABASE_EMAIL_CONFIRMATION_URL || `${getSiteUrl()}/email-confirmed`;

export const getOAuthCallbackUrl = () =>
  frontendEnv.VITE_SUPABASE_OAUTH_REDIRECT_URL || `${getSiteUrl()}/auth/callback`;

export const getSupabaseConfigError = () => missingSupabaseConfigMessage;
