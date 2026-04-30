import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { useAuth } from '../../app/providers/AuthProvider';

/**
 * Componente de uso para iniciar recuperacion de contrasena.
 * Solo pide el correo y delega el envio del enlace seguro al proveedor de autenticacion.
 */
export function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      await forgotPassword(email);
      setMessage('Te enviamos un enlace para restablecer tu contraseña.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="section__eyebrow">Recuperación</span>
        <h1>Recupera tu acceso</h1>
        <p>Te enviaremos un enlace seguro para restablecer tu contraseña.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <InlineMessage tone={error ? 'danger' : 'success'}>{error || message}</InlineMessage>
          <div className="field-group">
            <label htmlFor="recoveryEmail">Correo</label>
            <input
              id="recoveryEmail"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <button className="button" type="submit" disabled={submitting}>
            {submitting ? 'Enviando...' : 'Enviar enlace'}
          </button>
          <div className="auth-form__footer">
            <Link to="/login" className="auth-form__link">
              Volver al ingreso
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
