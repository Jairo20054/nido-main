import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { useAuth } from '../../app/providers/AuthProvider';

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'TENANT',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const paymentIntent = location.state?.paymentIntent;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await register(form);
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
      <div className="auth-card auth-card--wide">
        <span className="section__eyebrow">Registro</span>
        <h1>Crea tu cuenta</h1>
        <p>
          {paymentIntent
            ? 'Crea tu cuenta para terminar la reserva cuando ya estes listo para avanzar.'
            : 'Empieza a guardar propiedades, enviar solicitudes o publicar tu inventario de arriendos.'}
        </p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <InlineMessage tone="danger">{error}</InlineMessage>
          {paymentIntent ? (
            <InlineMessage tone="success">
              Tu exploracion sigue siendo abierta. La cuenta solo aparece en este punto final del
              flujo.
            </InlineMessage>
          ) : null}
          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="firstName">Nombre</label>
              <input
                id="firstName"
                value={form.firstName}
                onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
              />
            </div>
            <div className="field-group">
              <label htmlFor="lastName">Apellido</label>
              <input
                id="lastName"
                value={form.lastName}
                onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))}
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
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              />
            </div>
            <div className="field-group">
              <label htmlFor="phone">Telefono</label>
              <input
                id="phone"
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
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
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              />
            </div>
            <div className="field-group">
              <label htmlFor="role">Perfil</label>
              <select id="role" value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}>
                <option value="TENANT">Arrendatario</option>
                <option value="LANDLORD">Propietario</option>
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
