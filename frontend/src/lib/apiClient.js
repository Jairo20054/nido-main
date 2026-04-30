import { getAuthToken } from './authToken';

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Construye URLs relativas al backend y elimina query params vacios para evitar ruido en la API.
const buildUrl = (path, query) => {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin);

  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  return `${url.pathname}${url.search}`;
};

/**
 * Utilidad de uso compartido para llamadas HTTP del frontend.
 * Cualquier feature que necesite hablar con el backend debe pasar por aqui para reutilizar
 * autenticacion, serializacion del body, limpieza de query params y manejo consistente de errores.
 */
export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, query, auth = true } = options;
  const token = auth ? getAuthToken() : null;

  const response = await fetch(buildUrl(path, query), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      payload.message || 'No fue posible completar la solicitud',
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
