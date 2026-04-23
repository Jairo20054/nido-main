import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './app/providers/AuthProvider';
import { ProtectedRoute } from './app/routes/ProtectedRoute';
import { SiteLayout } from './components/layout/SiteLayout';
import { AccountPage } from './features/account/AccountPage';
import { ApplicationDocumentsPage } from './features/applications/ApplicationDocumentsPage';
import { ApplicationReviewPage } from './features/applications/ApplicationReviewPage';
import { ApplyPrequalificationPage } from './features/applications/ApplyPrequalificationPage';
import { ApplyStartPage } from './features/applications/ApplyStartPage';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { ManagementPage } from './features/dashboard/ManagementPage';
import { SavedPropertiesPage } from './features/favorites/SavedPropertiesPage';
import { HomePage } from './features/home/HomePage';
import { PropertyDetailPage } from './features/properties/PropertyDetailPage';
import { SearchPage } from './features/properties/SearchPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<SearchPage />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
          <Route path="/properties/:id/apply/start" element={<ApplyStartPage />} />
          <Route path="/properties/:id/apply/prequal" element={<ApplyPrequalificationPage />} />
          <Route path="/properties/:id/apply/documents" element={<ApplicationDocumentsPage />} />
          <Route path="/properties/:id/apply/review" element={<ApplicationReviewPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
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
          <Route
            path="/manage"
            element={
              <ProtectedRoute>
                <ManagementPage />
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
