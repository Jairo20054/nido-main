import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CircleUserRound, CreditCard, ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { useAuth } from '../../app/providers/AuthProvider';
import { formatCurrency } from '../../lib/formatters';

const initialForm = {
  desiredMoveIn: '',
  leaseMonths: 12,
  occupants: 1,
  monthlyIncome: '',
  hasPets: false,
  phone: '',
  message: '',
};

export function RentalRequestForm({
  property,
  propertyId,
  ownerId,
  onSubmit,
  submitting,
}) {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');

  useEffect(() => {
    const incomingDraft = location.state?.checkoutDraft;

    setForm((current) => ({
      ...current,
      ...incomingDraft,
      phone: incomingDraft?.phone || user?.phone || current.phone || '',
    }));
  }, [location.state, user?.phone]);

  const loginState = useMemo(
    () => ({
      from: location.pathname,
      checkoutDraft: form,
      paymentIntent: {
        propertyId,
        propertyTitle: property.title,
      },
    }),
    [form, location.pathname, property.title, propertyId]
  );

  const monthlyTotal = (property.monthlyRent || 0) + (property.maintenanceFee || 0);

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
    <div className="booking-card-stack">
      <div className="booking-intro-card">
        <div className="booking-intro-card__icon">
          <CalendarDays size={18} />
        </div>
        <div>
          <h3>Reserva en pocos pasos</h3>
          <p>
            Revisa fechas, costos y condiciones sin iniciar sesion. Solo te pediremos acceso cuando
            quieras continuar al pago o formalizar la solicitud.
          </p>
        </div>
      </div>

      <div className="booking-trust-strip">
        <span>
          <ShieldCheck size={14} />
          Sin login para explorar
        </span>
        <span>
          <CreditCard size={14} />
          Pago al final del flujo
        </span>
        <span>
          <CircleUserRound size={14} />
          Tus datos se completan despues
        </span>
      </div>

      <form className="form-card booking-form" onSubmit={handleSubmit}>
        <div className="form-card__header">
          <h3>Pre-reserva</h3>
          <p>
            Deja lista tu informacion basica para avanzar mas rapido cuando decidas reservar esta
            propiedad.
          </p>
        </div>

        <div className="booking-summary">
          <div>
            <span>Total mensual estimado</span>
            <strong>{formatCurrency(monthlyTotal)}</strong>
          </div>
          <div>
            <span>Deposito referencial</span>
            <strong>{formatCurrency(property.securityDeposit)}</strong>
          </div>
        </div>

        <InlineMessage tone="danger">{error}</InlineMessage>

        <div className="field-group">
          <label htmlFor="desiredMoveIn">Fecha deseada de ingreso</label>
          <input
            id="desiredMoveIn"
            type="date"
            value={form.desiredMoveIn}
            onChange={(event) =>
              setForm((current) => ({ ...current, desiredMoveIn: event.target.value }))
            }
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
              onChange={(event) =>
                setForm((current) => ({ ...current, leaseMonths: event.target.value }))
              }
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
              onChange={(event) =>
                setForm((current) => ({ ...current, occupants: event.target.value }))
              }
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
              onChange={(event) =>
                setForm((current) => ({ ...current, monthlyIncome: event.target.value }))
              }
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
            onChange={(event) =>
              setForm((current) => ({ ...current, hasPets: event.target.checked }))
            }
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
            placeholder="Cuentale al propietario quien eres, cuando quieres mudarte y por que te interesa esta propiedad."
          />
        </div>

        {isAuthenticated ? (
          <button className="button" type="submit" disabled={submitting}>
            {submitting ? 'Enviando...' : 'Continuar con la reserva'}
          </button>
        ) : (
          <div className="booking-cta">
            <p>
              Tu pre-reserva queda lista. Para continuar al pago o enviar la solicitud formal, te
              pediremos iniciar sesion.
            </p>
            <div className="booking-cta__actions">
              <Link to="/login" state={loginState} className="button">
                Continuar al pago
              </Link>
              <Link to="/register" state={loginState} className="button button--secondary">
                Crear cuenta
              </Link>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
