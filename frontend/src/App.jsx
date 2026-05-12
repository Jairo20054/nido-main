import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './app/providers/AuthProvider';
import { ProtectedRoute } from './app/routes/ProtectedRoute';
import { PublicOnlyRoute } from './app/routes/PublicOnlyRoute';
import { SiteLayout } from './components/layout/SiteLayout';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { LoadingState } from './components/ui/LoadingState';

const lazyPage = (loader, exportName) =>
  lazy(() => loader().then((module) => ({ default: module[exportName] })));

const AccountPage = lazyPage(() => import('./features/account/AccountPage'), 'AccountPage');
const ApplicationDocumentsPage = lazyPage(
  () => import('./features/applications/ApplicationDocumentsPage'),
  'ApplicationDocumentsPage'
);
const ApplicationReviewPage = lazyPage(
  () => import('./features/applications/ApplicationReviewPage'),
  'ApplicationReviewPage'
);
const ApplyPrequalificationPage = lazyPage(
  () => import('./features/applications/ApplyPrequalificationPage'),
  'ApplyPrequalificationPage'
);
const ApplyStartPage = lazyPage(
  () => import('./features/applications/ApplyStartPage'),
  'ApplyStartPage'
);
const AccessDeniedPage = lazyPage(
  () => import('./features/auth/AccessDeniedPage'),
  'AccessDeniedPage'
);
const ForgotPasswordPage = lazyPage(
  () => import('./features/auth/ForgotPasswordPage'),
  'ForgotPasswordPage'
);
const LoginPage = lazyPage(() => import('./features/auth/LoginPage'), 'LoginPage');
const RegisterPage = lazyPage(() => import('./features/auth/RegisterPage'), 'RegisterPage');
const ResetPasswordPage = lazyPage(
  () => import('./features/auth/ResetPasswordPage'),
  'ResetPasswordPage'
);
const AdminPage = lazyPage(() => import('./features/dashboard/AdminPage'), 'AdminPage');
const ManagementPage = lazyPage(
  () => import('./features/dashboard/ManagementPage'),
  'ManagementPage'
);
const SavedPropertiesPage = lazyPage(
  () => import('./features/favorites/SavedPropertiesPage'),
  'SavedPropertiesPage'
);
const HomePage = lazyPage(() => import('./features/home/HomePage'), 'HomePage');
const PropertyDetailPage = lazyPage(
  () => import('./features/properties/PropertyDetailPage'),
  'PropertyDetailPage'
);
const SearchPage = lazyPage(() => import('./features/properties/SearchPage'), 'SearchPage');

/**
 * Componente de uso raiz de la SPA.
 * Se monta una sola vez desde `main.jsx` y define la composicion general de la aplicacion:
 * proveedor de autenticacion, layout compartido y separacion entre rutas publicas,
 * privadas y administrativas.
 */
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Suspense fallback={<LoadingState label="Cargando vista..." />}>
          <Routes>
            <Route element={<SiteLayout />}>
              {/* Rutas publicas del portal */}
              <Route path="/" element={<HomePage />} />
              <Route path="/properties" element={<SearchPage />} />
              <Route path="/properties/:id" element={<PropertyDetailPage />} />
              <Route path="/properties/:id/apply/start" element={<ApplyStartPage />} />
              <Route path="/properties/:id/apply/prequal" element={<ApplyPrequalificationPage />} />
              <Route path="/properties/:id/apply/documents" element={<ApplicationDocumentsPage />} />
              <Route path="/properties/:id/apply/review" element={<ApplicationReviewPage />} />
              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <LoginPage />
                  </PublicOnlyRoute>
                }
              />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route
                path="/register"
                element={
                  <PublicOnlyRoute>
                    <RegisterPage />
                  </PublicOnlyRoute>
                }
              />
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
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
