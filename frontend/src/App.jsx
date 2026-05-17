import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './app/providers/AuthProvider';
import { ProtectedRoute } from './app/routes/ProtectedRoute';
import { PublicOnlyRoute } from './app/routes/PublicOnlyRoute';
import { AuthenticatedLayout } from './components/layout/AuthenticatedLayout';
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
const AuthCallbackPage = lazyPage(
  () => import('./features/auth/AuthCallbackPage'),
  'AuthCallbackPage'
);
const ForgotPasswordPage = lazyPage(
  () => import('./features/auth/ForgotPasswordPage'),
  'ForgotPasswordPage'
);
const EmailConfirmedPage = lazyPage(
  () => import('./features/auth/EmailConfirmedPage'),
  'EmailConfirmedPage'
);
const LoginPage = lazyPage(() => import('./features/auth/LoginPage'), 'LoginPage');
const RegisterPage = lazyPage(() => import('./features/auth/RegisterPage'), 'RegisterPage');
const ResetPasswordPage = lazyPage(
  () => import('./features/auth/ResetPasswordPage'),
  'ResetPasswordPage'
);
const AdminPage = lazyPage(() => import('./features/dashboard/AdminPage'), 'AdminPage');
const DashboardPage = lazyPage(() => import('./features/dashboard/DashboardPage'), 'DashboardPage');
const ManagementPage = lazyPage(
  () => import('./features/dashboard/ManagementPage'),
  'ManagementPage'
);
const OperationalPage = lazyPage(
  () => import('./features/dashboard/OperationalPage'),
  'OperationalPage'
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

function ProtectedAppPage({ children, roles }) {
  return (
    <ProtectedRoute roles={roles}>
      <AuthenticatedLayout>{children}</AuthenticatedLayout>
    </ProtectedRoute>
  );
}

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
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/email-confirmed" element={<EmailConfirmedPage />} />
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
            </Route>

            {/* Rutas que requieren sesion iniciada */}
            <Route
              path="/dashboard"
              element={
                <ProtectedAppPage>
                  <DashboardPage />
                </ProtectedAppPage>
              }
            />
            <Route
              path="/saved"
              element={
                <ProtectedAppPage>
                  <SavedPropertiesPage />
                </ProtectedAppPage>
              }
            />
            <Route
              path="/account"
              element={
                <ProtectedAppPage>
                  <AccountPage />
                </ProtectedAppPage>
              }
            />
            <Route
              path="/applications"
              element={
                <ProtectedAppPage>
                  <OperationalPage type="applications" />
                </ProtectedAppPage>
              }
            />
            <Route
              path="/documents"
              element={
                <ProtectedAppPage>
                  <OperationalPage type="documents" />
                </ProtectedAppPage>
              }
            />
            <Route
              path="/requests"
              element={
                <ProtectedAppPage roles={['LANDLORD', 'ADMIN']}>
                  <OperationalPage type="requests" />
                </ProtectedAppPage>
              }
            />
            <Route
              path="/stats"
              element={
                <ProtectedAppPage roles={['LANDLORD', 'ADMIN']}>
                  <OperationalPage type="stats" />
                </ProtectedAppPage>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedAppPage>
                  <OperationalPage type="settings" />
                </ProtectedAppPage>
              }
            />
            {/* Rutas con permisos especiales por rol */}
            <Route
              path="/manage"
              element={
                <ProtectedAppPage roles={['LANDLORD', 'ADMIN']}>
                  <ManagementPage />
                </ProtectedAppPage>
              }
            />
            <Route
              path="/publish"
              element={
                <ProtectedAppPage roles={['LANDLORD', 'ADMIN']}>
                  <ManagementPage />
                </ProtectedAppPage>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedAppPage roles={['ADMIN']}>
                  <AdminPage />
                </ProtectedAppPage>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
