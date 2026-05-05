import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { useAuth } from '../../app/providers/AuthProvider';
import { resolvePostAuthDestination } from './authRedirects';

/**
 * Componente de uso para el registro publico.
 * Permite crear cuentas de arrendatario o arrendador y deja la administracion
 * fuera del flujo abierto para evitar altas accidentales de usuarios privilegiados.
 */
export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, register, user } = useAuth();
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
      setError('Las contrasenas no coinciden.');
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
        setMessage('Revisa tu correo para activar la cuenta y luego inicia sesion.');
        return;
      }

      navigate(resolvePostAuthDestination(location.state, result.profile), { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        <span className="section__eyebrow">Registro</span>
        <h1>Crea tu cuenta</h1>
        <p>Empieza a guardar propiedades, enviar solicitudes o publicar tu inventario de arriendos.</p>
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
              <label htmlFor="phone">Telefono</label>
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
              <label htmlFor="password">Contrasena</label>
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
              <label htmlFor="confirmPassword">Confirmar contrasena</label>
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
            </div>
          </div>
          <button className="button" type="submit" disabled={submitting}>
            {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
}
