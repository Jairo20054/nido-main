import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { LoadingState } from '../../components/ui/LoadingState';
import { useAuth } from '../providers/useAuth';

/**
 * Componente de uso guard para rutas privadas.
 * Se coloca alrededor de páginas protegidas y decide si debe renderizar el contenido,
 * redirigir al login o enviar al usuario a acceso denegado según autenticación y roles.
 */
export function ProtectedRoute({ children, roles = [] }) {
  const { hasRole, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState label="Verificando sesión..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles.length && !hasRole(...roles)) {
    return <Navigate to="/acceso-denegado" replace state={{ from: location.pathname }} />;
  }

  return children;
}
