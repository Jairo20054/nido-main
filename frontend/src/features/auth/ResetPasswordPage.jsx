import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { useAuth } from '../../app/providers/AuthProvider';

/**
 * Componente de uso para cerrar el flujo de recuperacion.
 * Valida la nueva contrasena en cliente y luego delega la actualizacion real
 * al proveedor de autenticacion cuando el usuario llega desde el enlace seguro.
 */
export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { isPasswordRecovery, resetPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setSubmitting(true);

    try {
      await resetPassword(password);
      setMessage('Contrasena actualizada correctamente.');
      setTimeout(() => navigate('/account', { replace: true }), 800);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="section__eyebrow">Seguridad</span>
        <h1>Define tu nueva contrasena</h1>
        <p>
          {isPasswordRecovery
            ? 'Puedes crear una nueva contrasena desde el enlace de recuperacion.'
            : 'Si llegaste aqui desde un enlace de recuperacion, podras restablecer tu contrasena.'}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <InlineMessage tone={error ? 'danger' : 'success'}>{error || message}</InlineMessage>

          <div className="field-group">
            <label htmlFor="newPassword">Nueva contrasena</label>
            <input
              id="newPassword"
              type="password"
              minLength="8"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="confirmPassword">Confirmar contrasena</label>
            <input
              id="confirmPassword"
              type="password"
              minLength="8"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </div>

          <button className="button" type="submit" disabled={submitting}>
            {submitting ? 'Actualizando...' : 'Actualizar contrasena'}
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
