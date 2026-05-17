import React from 'react';
import { Navigate } from 'react-router-dom';
import { LoadingState } from '../../components/ui/LoadingState';
import { useAuth } from '../providers/AuthProvider';
import { resolvePostAuthDestination } from '../../features/auth/authRedirects';

/**
 * Guard para pantallas públicas de autenticación.
 * Evita que un usuario con sesión activa vuelva al login o registro.
 */
export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <LoadingState label="Verificando sesión..." />;
  }

  if (isAuthenticated) {
    return <Navigate to={resolvePostAuthDestination(null, user)} replace />;
  }

  return children;
}
