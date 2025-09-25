import React, { useEffect } from 'react';
import { useAuthContext } from '../../context/AuthContext';

// Componente que protege rutas que requieren autenticación
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthContext();

  useEffect(() => {
    // Si no está cargando y no está autenticado, redirigir al login
    if (!loading && !isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isAuthenticated, loading]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Verificando autenticación...</p>
      </div>
    );
  }

  // Si está autenticado, mostrar el componente hijo
  if (isAuthenticated) {
    return children;
  }

  // Si no está autenticado, no renderizar nada (el useEffect redirigirá)
  return null;
};

export default ProtectedRoute;
