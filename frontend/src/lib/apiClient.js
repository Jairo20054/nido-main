import { getAuthToken } from './authToken';
import { frontendEnv } from './env';

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

const API_BASE_URL = frontendEnv.VITE_API_URL;

const TECHNICAL_ERROR_PATTERNS = [
  /database_url/i,
  /prisma/i,
  /connection string/i,
  /p\d{4}/i,
  /econnrefused/i,
  /failed to fetch/i,
  /networkerror/i,
];

const sanitizeErrorMessage = (message, status) => {
  const fallback =
    status >= 500
      ? 'No pudimos cargar la informacion en este momento. Intenta de nuevo en unos minutos.'
      : 'No fue posible completar la solicitud. Revisa los datos e intenta de nuevo.';

  if (!message) {
    return fallback;
  }

  if (TECHNICAL_ERROR_PATTERNS.some((pattern) => pattern.test(message))) {
    return fallback;
  }

  return message;
};

// Construye URLs relativas al backend y elimina query params vacios para evitar ruido en la API.
const buildUrl = (path, query) => {
  const normalizedBase = API_BASE_URL.replace(/\/$/, '');
  const url = new URL(`${normalizedBase}${path}`, window.location.origin);

  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  if (url.origin === window.location.origin) {
    return `${url.pathname}${url.search}`;
  }

  return `${url.origin}${url.pathname}${url.search}`;
};

/**
 * Utilidad de uso compartido para llamadas HTTP del frontend.
 * Cualquier feature que necesite hablar con el backend debe pasar por aqui para reutilizar
 * autenticacion, serializacion del body, limpieza de query params y manejo consistente de errores.
 */
export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, query, auth = true } = options;
  const token = auth ? getAuthToken() : null;

  let response;

  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    throw new ApiError(sanitizeErrorMessage(error.message, 503), 503, null);
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      sanitizeErrorMessage(payload.message, response.status),
      response.status,
      payload.details
    );
  }

  return payload;
}

// Fachada ergonomica para los verbos HTTP usados en la aplicacion.
export const api = {
  get: (path, options) => apiRequest(path, { ...options, method: 'GET' }),
  post: (path, body, options) => apiRequest(path, { ...options, method: 'POST', body }),
  patch: (path, body, options) => apiRequest(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => apiRequest(path, { ...options, method: 'DELETE' }),
};
