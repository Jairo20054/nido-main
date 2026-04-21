import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { useAuth } from '../../app/providers/AuthProvider';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const paymentIntent = location.state?.paymentIntent;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await login(form);
      navigate(location.state?.from || '/account', {
        replace: true,
        state: location.state?.checkoutDraft
          ? {
              checkoutDraft: location.state.checkoutDraft,
              openCheckout: true,
            }
          : undefined,
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="section__eyebrow">Acceso</span>
        <h1>Ingresa a tu cuenta</h1>
        <p>
          {paymentIntent
            ? `Estas a un paso de continuar con la reserva de ${paymentIntent.propertyTitle}.`
            : 'Gestiona guardados, solicitudes y propiedades desde una sola experiencia.'}
        </p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <InlineMessage tone="danger">{error}</InlineMessage>
          {paymentIntent ? (
            <InlineMessage tone="success">
              No te pedimos iniciar sesion para explorar. Solo ahora que quieres avanzar con el
              pago o la reserva.
            </InlineMessage>
          ) : null}
          <div className="field-group">
            <label htmlFor="email">Correo</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
          </div>
          <div className="field-group">
            <label htmlFor="password">Contrasena</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            />
          </div>
          <button className="button" type="submit" disabled={submitting}>
            {submitting ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
