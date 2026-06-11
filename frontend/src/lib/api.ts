// frontend/src/lib/api.ts
import axios from 'axios';
import { getAuthToken } from './authToken';
import { frontendEnv } from './env';

export const api = axios.create({
  baseURL: frontendEnv.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

export const unwrapApiData = <T>(payload: { data?: T } | T): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }

  return payload as T;
};
