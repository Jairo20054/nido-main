// authMock.js
// Mock authentication functions for host onboarding flow

import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';

/**
 * Hook to check if user is authenticated
 * @returns {boolean}
 */
export const useIsAuthenticated = () => {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated;
};

/**
 * Hook to simulate login process
 * @returns {function} login function that returns a promise resolving on success
 */
export const useLogin = () => {
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loginUser = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error);
        setLoading(false);
        return Promise.reject(result.error);
      }
      setLoading(false);
      return Promise.resolve(result.user);
    } catch (err) {
      setError(err.message || 'Error inesperado');
      setLoading(false);
      return Promise.reject(err);
    }
  };

  return { loginUser, loading, error };
};
