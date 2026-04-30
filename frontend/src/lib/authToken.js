let authToken = null;

// Token en memoria para adjuntar autenticacion al cliente API sin persistirlo manualmente en storage.
export const setAuthToken = (token) => {
  authToken = token || null;
};

export const clearAuthToken = () => {
  authToken = null;
};

export const getAuthToken = () => authToken;
