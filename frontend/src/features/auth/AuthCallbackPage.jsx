import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/useAuth';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { LoadingState } from '../../components/ui/LoadingState';
import { supabase } from '../../lib/supabaseClient';
import { normalizeAuthRedirectPath, resolvePostAuthDestination } from './authRedirects';

const OAUTH_ERROR_MESSAGE =
  'No pudimos completar el ingreso con Google. Intenta de nuevo en un momento.';

const getOAuthErrorMessage = (location) => {
  const searchParams = new URLSearchParams(location.search);
  const hashParams = new URLSearchParams(location.hash.replace(/^#/, ''));
  const rawError =
    searchParams.get('error_description') ||
    searchParams.get('error') ||
    hashParams.get('error_description') ||
    hashParams.get('error');

  if (!rawError) {
    return '';
  }

  return OAUTH_ERROR_MESSAGE;
};

export function AuthCallbackPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { authError, isAuthenticated, loading, refreshUser, user } = useAuth();
  const [error, setError] = useState('');

  const nextPath = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return normalizeAuthRedirectPath(searchParams.get('next'));
  }, [location.search]);

  useEffect(() => {
    let active = true;

    const finishOAuthSignIn = async () => {
      const callbackError = getOAuthErrorMessage(location);

      if (callbackError) {
        if (active) {
          setError(callbackError);
        }
        return;
      }

      const searchParams = new URLSearchParams(location.search);
      const authCode = searchParams.get('code');

      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (!active) {
          return;
        }

        if (!currentSession?.access_token && !authCode) {
          throw new Error('Missing auth code');
        }

        if (!currentSession?.access_token && authCode) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(authCode);

          if (exchangeError) {
            throw exchangeError;
          }
        }

        const nextUser = await refreshUser();

        if (!active) {
          return;
        }

        if (!nextUser) {
          throw new Error('Missing user profile');
        }

        navigate(resolvePostAuthDestination({ from: nextPath }, nextUser), { replace: true });
      } catch (_error) {
        if (active) {
          setError(OAUTH_ERROR_MESSAGE);
        }
      }
    };

    if (!loading) {
      void finishOAuthSignIn();
    }

    return () => {
      active = false;
    };
  }, [loading, location, navigate, nextPath, refreshUser]);

  if (isAuthenticated && user && !error) {
    return <Navigate to={resolvePostAuthDestination({ from: nextPath }, user)} replace />;
  }

  if (loading && !error) {
    return <LoadingState label="Conectando tu cuenta..." />;
  }

  if (!error && authError) {
    return <LoadingState label="Preparando tu espacio..." />;
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="section__eyebrow">Google</span>
        <h1>No pudimos completar tu acceso</h1>
        <p>Vuelve a intentarlo desde el inicio de sesión para continuar con NIDO.</p>
        <InlineMessage tone="danger">{error || OAUTH_ERROR_MESSAGE}</InlineMessage>
        <Link className="button" to="/login" replace>
          Volver al ingreso
        </Link>
      </div>
    </div>
  );
}
