import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './app/providers/AuthProvider';
import { ProtectedRoute } from './app/routes/ProtectedRoute';
import { SiteLayout } from './components/layout/SiteLayout';
import { AccountPage } from './features/account/AccountPage';
import { AccessDeniedPage } from './features/auth/AccessDeniedPage';
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { ResetPasswordPage } from './features/auth/ResetPasswordPage';
import { AdminPage } from './features/dashboard/AdminPage';
import { ManagementPage } from './features/dashboard/ManagementPage';
import { SavedPropertiesPage } from './features/favorites/SavedPropertiesPage';
import { HomePage } from './features/home/HomePage';
import { PropertyDetailPage } from './features/properties/PropertyDetailPage';
import { SearchPage } from './features/properties/SearchPage';

/**
 * Componente de uso raiz de la SPA.
 * Se monta una sola vez desde `main.jsx` y define la composicion general de la aplicacion:
 * proveedor de autenticacion, layout compartido y separacion entre rutas publicas,
 * privadas y administrativas.
 */
function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<SiteLayout />}>
          {/* Rutas publicas del portal */}
          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<SearchPage />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/acceso-denegado" element={<AccessDeniedPage />} />
          {/* Rutas que requieren sesion iniciada */}
          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <SavedPropertiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />
          {/* Rutas con permisos especiales por rol */}
          <Route
            path="/manage"
            element={
              <ProtectedRoute roles={['LANDLORD', 'ADMIN']}>
                <ManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
