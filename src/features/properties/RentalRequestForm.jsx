import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { useAuth } from '../../app/providers/AuthProvider';

const initialForm = {
  desiredMoveIn: '',
  leaseMonths: 12,
  occupants: 1,
  monthlyIncome: '',
  hasPets: false,
  phone: '',
  message: '',
};

export function RentalRequestForm({ propertyId, ownerId, onSubmit, submitting }) {
  const { isAuthenticated, user } = useAuth();
  const [form, setForm] = useState({
    ...initialForm,
    phone: user?.phone || '',
  });
  const [error, setError] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="status-card">
        <h3>Inicia sesion para postularte</h3>
        <p>Guarda esta propiedad o envia una solicitud formal de arrendamiento en pocos pasos.</p>
        <Link to="/login" className="button">
          Ingresar
        </Link>
      </div>
    );
  }

  if (user?.id === ownerId) {
    return (
      <div className="status-card">
        <h3>Esta es tu propiedad</h3>
        <p>Puedes gestionarla desde el panel y revisar desde alla las solicitudes que lleguen.</p>
        <Link to="/manage" className="button">
          Ir a gestion
        </Link>
      </div>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.desiredMoveIn || !form.phone || form.message.trim().length < 20) {
      setError('Completa la fecha, tu telefono y un mensaje claro de al menos 20 caracteres.');
      return;
    }

    setError('');
    await onSubmit({
      ...form,
      propertyId,
      leaseMonths: Number(form.leaseMonths),
      occupants: Number(form.occupants),
      monthlyIncome: form.monthlyIncome ? Number(form.monthlyIncome) : null,
    });
    setForm({ ...initialForm, phone: user?.phone || '' });
  };

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="form-card__header">
        <h3>Enviar solicitud</h3>
        <p>Comparte tu fecha ideal de ingreso y contexto basico para iniciar la conversacion.</p>
      </div>
      <InlineMessage tone="danger">{error}</InlineMessage>
      <div className="field-group">
        <label htmlFor="desiredMoveIn">Fecha deseada de ingreso</label>
        <input
          id="desiredMoveIn"
          type="date"
          value={form.desiredMoveIn}
          onChange={(event) => setForm((current) => ({ ...current, desiredMoveIn: event.target.value }))}
        />
      </div>
      <div className="field-grid">
        <div className="field-group">
          <label htmlFor="leaseMonths">Meses de contrato</label>
          <input
            id="leaseMonths"
            type="number"
            min="1"
            max="60"
            value={form.leaseMonths}
            onChange={(event) => setForm((current) => ({ ...current, leaseMonths: event.target.value }))}
          />
        </div>
        <div className="field-group">
          <label htmlFor="occupants">Ocupantes</label>
          <input
            id="occupants"
            type="number"
            min="1"
            max="12"
            value={form.occupants}
            onChange={(event) => setForm((current) => ({ ...current, occupants: event.target.value }))}
          />
        </div>
      </div>
      <div className="field-grid">
        <div className="field-group">
          <label htmlFor="monthlyIncome">Ingresos mensuales</label>
          <input
            id="monthlyIncome"
            type="number"
            value={form.monthlyIncome}
            onChange={(event) => setForm((current) => ({ ...current, monthlyIncome: event.target.value }))}
            placeholder="7800000"
          />
        </div>
        <div className="field-group">
          <label htmlFor="phone">Telefono</label>
          <input
            id="phone"
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
            placeholder="+57 300 000 0000"
          />
        </div>
      </div>
      <label className="checkbox">
        <input
          type="checkbox"
          checked={form.hasPets}
          onChange={(event) => setForm((current) => ({ ...current, hasPets: event.target.checked }))}
        />
        Tengo mascotas
      </label>
      <div className="field-group">
        <label htmlFor="message">Mensaje</label>
        <textarea
          id="message"
          rows="5"
          value={form.message}
          onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
          placeholder="Cuéntale al propietario quién eres, cuándo quieres mudarte y por qué te interesa esta propiedad."
        />
      </div>
      <button className="button" type="submit" disabled={submitting}>
        {submitting ? 'Enviando...' : 'Enviar solicitud'}
      </button>
    </form>
  );
}
