import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { useAuth } from '../../app/providers/AuthProvider';
import { GoogleAuthButton } from './GoogleAuthButton';
import { resolvePostAuthDestination } from './authRedirects';

/**
 * Componente de uso para el registro público.
 * Permite crear cuentas de arrendatario o arrendador y deja la administración
 * fuera del flujo abierto para evitar altas accidentales de usuarios privilegiados.
 */
export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, register, signInWithGoogle, user } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'TENANT',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const updateField = (field) => (event) =>
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));

  if (isAuthenticated) {
    return <Navigate to={resolvePostAuthDestination(null, user)} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setSubmitting(false);
      return;
    }

    try {
      const result = await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
      });

      if (result.requiresEmailConfirmation) {
        setMessage('Revisa tu correo para activar la cuenta y luego inicia sesión.');
        return;
      }

      navigate(resolvePostAuthDestination(location.state, result.profile), { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleSubmitting(true);
    setError('');
    setMessage('');

    try {
      await signInWithGoogle();
    } catch (requestError) {
      setError(requestError.message);
      setGoogleSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        <span className="section__eyebrow">Registro</span>
        <h1>Crea tu cuenta</h1>
        <p>Empieza a guardar propiedades, enviar solicitudes o publicar tu inventario de arriendos.</p>
        <div className="auth-social">
          <GoogleAuthButton
            disabled={submitting}
            loading={googleSubmitting}
            onClick={handleGoogleSignIn}
          />
          <div className="auth-divider" aria-hidden="true">
            <span>o crea tu cuenta con correo</span>
          </div>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <InlineMessage tone={error ? 'danger' : 'success'}>{error || message}</InlineMessage>
          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="firstName">Nombre</label>
              <input
                id="firstName"
                value={form.firstName}
                onChange={updateField('firstName')}
                autoComplete="given-name"
                required
              />
            </div>
            <div className="field-group">
              <label htmlFor="lastName">Apellido</label>
              <input
                id="lastName"
                value={form.lastName}
                onChange={updateField('lastName')}
                autoComplete="family-name"
                required
              />
            </div>
          </div>
          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="registerEmail">Correo</label>
              <input
                id="registerEmail"
                type="email"
                value={form.email}
                onChange={updateField('email')}
                autoComplete="email"
                required
              />
            </div>
            <div className="field-group">
              <label htmlFor="phone">Teléfono</label>
              <input
                id="phone"
                value={form.phone}
                onChange={updateField('phone')}
                autoComplete="tel"
              />
            </div>
          </div>
          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={updateField('password')}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
            <div className="field-group">
              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={updateField('confirmPassword')}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
          </div>
          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="role">Perfil</label>
              <select id="role" value={form.role} onChange={updateField('role')}>
                <option value="TENANT">Arrendatario</option>
                <option value="LANDLORD">Arrendador</option>
              </select>
              <small className="field-help">
                El perfil define si entraras a explorar propiedades o a publicar inventario.
              </small>
            </div>
          </div>
          <button className="button" type="submit" disabled={submitting || googleSubmitting}>
            {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
          <div className="auth-form__footer">
            <Link to="/login" className="auth-form__link">
              ¿Ya tienes cuenta? Ingresar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
