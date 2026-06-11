const PLACEHOLDER_PATTERN = /your-project\.supabase\.co|^your-(anon|publishable|secret|service)|^replace-with-|<[^>]+>/iu;

const decodeJwtRole = (value) => {
  if (typeof value !== 'string' || !value.startsWith('eyJ')) {
    return '';
  }

  try {
    const [, payload] = value.trim().split('.');
    if (!payload) {
      return '';
    }

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      '='
    );
    const decodedPayload =
      typeof window === 'undefined'
        ? ''
        : decodeURIComponent(
            window
              .atob(paddedPayload)
              .split('')
              .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
              .join('')
          );

    return JSON.parse(decodedPayload)?.role || '';
  } catch (_error) {
    return '';
  }
};

const isPlaceholder = (value) =>
  typeof value !== 'string' || !value.trim() || PLACEHOLDER_PATTERN.test(value.trim());

const isPublicSupabaseKey = (value) => {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  return /^sb_publishable_/iu.test(trimmed) || decodeJwtRole(trimmed) === 'anon';
};

const normalizeUrl = (value, variableName, issues) => {
  if (isPlaceholder(value)) {
    issues.push(`${variableName} no esta configurada`);
    return '';
  }

  try {
    return new URL(value).toString().replace(/\/$/u, '');
  } catch (_error) {
    issues.push(`${variableName} debe ser una URL absoluta valida`);
    return '';
  }
};

const validateFrontendEnv = () => {
  const issues = [];
  const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  const appEnv = import.meta.env.VITE_ENV || import.meta.env.MODE;
  const supabaseKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (isPlaceholder(apiUrl)) {
    issues.push('VITE_API_URL no esta configurada');
  }

  const supabaseUrl = normalizeUrl(import.meta.env.VITE_SUPABASE_URL, 'VITE_SUPABASE_URL', issues);

  if (isPlaceholder(supabaseKey)) {
    issues.push('VITE_SUPABASE_ANON_KEY o VITE_SUPABASE_PUBLISHABLE_KEY no esta configurada');
  } else if (!isPublicSupabaseKey(supabaseKey)) {
    issues.push('VITE_SUPABASE_ANON_KEY/VITE_SUPABASE_PUBLISHABLE_KEY debe ser una clave publica de Supabase');
  }

  if (issues.length) {
    throw new Error(
      `Configuracion publica del frontend incompleta o insegura: ${issues.join(
        ', '
      )}. Revisa frontend/.env.example y README.md.`
    );
  }

  return {
    VITE_ENV: appEnv,
    VITE_API_URL: apiUrl,
    VITE_SITE_URL: import.meta.env.VITE_SITE_URL || '',
    VITE_SUPABASE_ANON_KEY: supabaseKey,
    VITE_SUPABASE_OAUTH_REDIRECT_URL: import.meta.env.VITE_SUPABASE_OAUTH_REDIRECT_URL || '',
    VITE_SUPABASE_REDIRECT_URL: import.meta.env.VITE_SUPABASE_REDIRECT_URL || '',
    VITE_SUPABASE_EMAIL_CONFIRMATION_URL: import.meta.env.VITE_SUPABASE_EMAIL_CONFIRMATION_URL || '',
    VITE_SUPABASE_PROPERTY_MEDIA_BUCKET:
      import.meta.env.VITE_SUPABASE_PROPERTY_MEDIA_BUCKET || 'property-media-public',
    VITE_MAPTILER_KEY: import.meta.env.VITE_MAPTILER_KEY || '',
    VITE_SUPABASE_URL: supabaseUrl,
    VITE_VERCEL_URL: import.meta.env.VITE_VERCEL_URL || '',
  };
};

export const frontendEnv = validateFrontendEnv();
