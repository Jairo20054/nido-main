import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../app/providers/useAuth';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { LoadingState } from '../../components/ui/LoadingState';
import { supabase } from '../../lib/supabaseClient';
import { resolvePostAuthDestination } from './authRedirects';

const CONFIRMATION_ERROR =
  'No pudimos confirmar tu correo. Abre el enlace más reciente o solicita un nuevo acceso.';

const getConfirmationError = (location) => {
  const searchParams = new URLSearchParams(location.search);
  const hashParams = new URLSearchParams(location.hash.replace(/^#/, ''));

  return (
    searchParams.get('error_description') ||
    searchParams.get('error') ||
    hashParams.get('error_description') ||
    hashParams.get('error') ||
    ''
  );
};

export function EmailConfirmedPage() {
  const location = useLocation();
  const { isAuthenticated, loading, refreshUser, user } = useAuth();
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');

  const authCode = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('code');
  }, [location.search]);

  useEffect(() => {
    let active = true;

    const finishConfirmation = async () => {
      const providerError = getConfirmationError(location);

      if (providerError) {
        if (active) {
          setError(CONFIRMATION_ERROR);
          setChecking(false);
        }
        return;
      }

      try {
        if (authCode) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(authCode);

          if (exchangeError) {
            throw exchangeError;
          }
        }

        if (authCode || isAuthenticated) {
          await refreshUser();
        }

        if (active) {
          setChecking(false);
        }
      } catch (_error) {
        if (active) {
          setError(CONFIRMATION_ERROR);
          setChecking(false);
        }
      }
    };

    if (!loading) {
      void finishConfirmation();
    }

    return () => {
      active = false;
    };
  }, [authCode, isAuthenticated, loading, location, refreshUser]);

  if (isAuthenticated && user && !authCode && !checking) {
    return <Navigate to={resolvePostAuthDestination(null, user)} replace />;
  }

  if (loading || checking) {
    return <LoadingState label="Confirmando tu correo..." />;
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="section__eyebrow">Cuenta verificada</span>
        <h1>{error ? 'No pudimos confirmar tu correo' : 'Correo confirmado correctamente'}</h1>
        <p>
          {error
            ? 'El enlace puede haber expirado o ya fue utilizado. Intenta iniciar sesión o solicita un nuevo correo de confirmación.'
            : 'Tu cuenta ha sido verificada. Ya puedes iniciar sesión y continuar en NIDO.'}
        </p>
        <InlineMessage tone={error ? 'danger' : 'success'}>{error || 'Tu verificación quedó registrada.'}</InlineMessage>
        <Link className="button" to={isAuthenticated ? resolvePostAuthDestination(null, user) : '/login'} replace>
          {isAuthenticated ? 'Ir al panel' : 'Iniciar sesión'}
        </Link>
      </div>
    </div>
  );
}
