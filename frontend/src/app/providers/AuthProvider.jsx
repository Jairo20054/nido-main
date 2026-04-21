import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, clearStoredToken, setStoredToken } from '../../lib/apiClient';
import { TOKEN_STORAGE_KEY } from '../../lib/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
      setAuthError('');
    } catch (error) {
      clearStoredToken();
      setUser(null);
      setAuthError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem(TOKEN_STORAGE_KEY)) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials, { auth: false });
    setStoredToken(response.data.token);
    setUser(response.data.user);
    setAuthError('');
    return response.data.user;
  };

  const register = async (payload) => {
    const response = await api.post('/auth/register', payload, { auth: false });
    setStoredToken(response.data.token);
    setUser(response.data.user);
    setAuthError('');
    return response.data.user;
  };

  const logout = () => {
    clearStoredToken();
    setUser(null);
  };

  const updateProfile = async (payload) => {
    const response = await api.patch('/users/me', payload);
    setUser(response.data);
    return response.data;
  };

  const value = useMemo(
    () => ({
      authError,
      isAuthenticated: Boolean(user),
      isLandlord: user?.role === 'LANDLORD' || user?.role === 'ADMIN',
      loading,
      login,
      logout,
      refreshUser,
      register,
      updateProfile,
      user,
    }),
    [authError, loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }

  return context;
}
