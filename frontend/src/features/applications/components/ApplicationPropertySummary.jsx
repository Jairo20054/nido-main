import React from 'react';
import { CalendarDays, MapPin, ShieldCheck, WalletCards } from 'lucide-react';
import { formatCurrency, formatDate } from '../../../lib/formatters';

export function ApplicationPropertySummary({ property, prequalification }) {
  const monthlyTotal = (property.monthlyRent || 0) + (property.maintenanceFee || 0);

  return (
    <aside className="content-card application-summary-card">
      <div className="application-summary-card__header">
        <span className="section__eyebrow">Resumen del inmueble</span>
        <h3>{property.title}</h3>
        <p>
          {property.city}
          {property.neighborhood ? `, ${property.neighborhood}` : ''}
        </p>
      </div>

      <div className="application-summary-card__rows">
        <div>
          <span>Canon</span>
          <strong>{formatCurrency(property.monthlyRent)}</strong>
        </div>
        <div>
          <span>Administracion</span>
          <strong>{formatCurrency(property.maintenanceFee)}</strong>
        </div>
        <div>
          <span>Deposito</span>
          <strong>{formatCurrency(property.securityDeposit)}</strong>
        </div>
        <div>
          <span>Total mensual estimado</span>
          <strong>{formatCurrency(monthlyTotal)}</strong>
        </div>
      </div>

      <div className="application-trust-list">
        <div>
          <ShieldCheck size={16} />
          <span>Aplicar es gratis y con reglas claras.</span>
        </div>
        <div>
          <WalletCards size={16} />
          <span>Tu pago inicial se hace despues y con proteccion.</span>
        </div>
        <div>
          <CalendarDays size={16} />
          <span>Disponible desde {formatDate(property.availableFrom)}.</span>
        </div>
        <div>
          <MapPin size={16} />
          <span>Proceso digital con trazabilidad paso a paso.</span>
        </div>
      </div>

      {prequalification ? (
        <div className="application-summary-card__score">
          <span>Score base</span>
          <strong>{prequalification.score}/100</strong>
          <p>Riesgo {prequalification.riskBand === 'low' ? 'bajo' : prequalification.riskBand === 'medium' ? 'medio' : 'alto'}.</p>
        </div>
      ) : null}
    </aside>
  );
}
