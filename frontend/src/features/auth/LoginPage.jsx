import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { useAuth } from '../../app/providers/AuthProvider';
import { GoogleAuthButton } from './GoogleAuthButton';
import { resolvePostAuthDestination } from './authRedirects';

/**
 * Componente de uso para el ingreso principal.
 * Se utiliza en rutas publicas y decide a donde redirigir al usuario despues del login:
 * la ruta pendiente, su panel operativo o su cuenta segun el rol autenticado.
 */
export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login, signInWithGoogle, user } = useAuth();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const oauthError = location.state?.oauthError || '';

  if (isAuthenticated) {
    return <Navigate to={resolvePostAuthDestination(null, user)} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const nextUser = await login(form);

      const nextRoute = resolvePostAuthDestination(location.state, nextUser);
      navigate(nextRoute, { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleSubmitting(true);
    setError('');

    try {
      await signInWithGoogle({ next: location.state?.from });
    } catch (requestError) {
      setError(requestError.message);
      setGoogleSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="section__eyebrow">Acceso</span>
        <h1>Ingresa a tu cuenta</h1>
        <p>Gestiona guardados, solicitudes y propiedades desde una sola experiencia.</p>

        <div className="auth-social">
          <InlineMessage tone="danger">{oauthError}</InlineMessage>
          <GoogleAuthButton
            disabled={submitting}
            loading={googleSubmitting}
            onClick={handleGoogleSignIn}
          />
          <div className="auth-divider" aria-hidden="true">
            <span>o continua con tu correo</span>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <InlineMessage tone="danger">{error}</InlineMessage>

          <div className="field-group">
            <label htmlFor="identifier">Correo o usuario</label>
            <input
              id="identifier"
              value={form.identifier}
              onChange={(event) =>
                setForm((current) => ({ ...current, identifier: event.target.value }))
              }
              placeholder="admin o correo@dominio.com"
              autoComplete="username"
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="password">Contrasena</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              autoComplete="current-password"
              required
            />
          </div>

          <div className="auth-form__footer">
            <Link to="/forgot-password" className="auth-form__link">
              Olvidaste tu contrasena?
            </Link>
            <Link to="/register" className="auth-form__link">
              Crear cuenta
            </Link>
          </div>

          <button className="button" type="submit" disabled={submitting || googleSubmitting}>
            {submitting ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
