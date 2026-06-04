import { CheckCircle2, Heart, Lock, MessageCircle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { InlineMessage } from '../ui/InlineMessage';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { getCurrency, getMonthlyTotal } from './propertyDisplayUtils';

export default function PropertySidebar({
  property,
  pageMessage,
  onContact,
  onToggleFavorite,
}) {
  const monthlyTotal = getMonthlyTotal(property);

  return (
    <aside className="nido-detail-sidebar">
      <div className="nido-pricing-card">
        <div className="nido-pricing-card__price">
          <strong>{formatCurrency(property.monthlyRent)}</strong>
          <span>canon mensual</span>
        </div>

        <div className="nido-pricing-card__rows">
          <div>
            <span>Administracion</span>
            <strong>{property.administrationIncluded ? 'Incluida' : getCurrency(property.maintenanceFee)}</strong>
          </div>
          <div>
            <span>Deposito</span>
            <strong>{property.depositRequired ? getCurrency(property.securityDeposit) : 'Por confirmar'}</strong>
          </div>
          <div className="nido-pricing-card__total">
            <span>Total mensual estimado</span>
            <strong>{monthlyTotal ? formatCurrency(monthlyTotal) : 'Precio no disponible'}</strong>
          </div>
        </div>

        <div className="nido-pricing-card__actions">
          <button type="button" className="nido-primary-button" onClick={() => onContact('contact')}>
            Contactar propietario
          </button>
          <button
            type="button"
            className={`nido-secondary-button ${property.isFavorite ? 'nido-secondary-button--saved' : ''}`}
            onClick={onToggleFavorite}
          >
            <Heart size={16} />
            {property.isFavorite ? 'Guardada' : 'Guardar propiedad'}
          </button>
        </div>

        <div className="nido-availability-badge">
          <CheckCircle2 size={16} />
          {property.availableImmediately
            ? 'Disponible para mudanza inmediata'
            : `Disponible desde ${formatDate(property.availableFrom) || 'fecha por confirmar'}`}
        </div>

        <div className="nido-verified-note">
          <Lock size={15} />
          <p>Propiedad verificada por NIDO. Tus datos se comparten solo dentro del proceso.</p>
        </div>
      </div>

      {pageMessage ? <InlineMessage tone="neutral">{pageMessage}</InlineMessage> : null}

      <div className="nido-process-card">
        <span>Arrendar con NIDO</span>
        <h3>Proceso claro antes de aplicar</h3>
        <p>Contacto, visitas y documentos se mantienen en un flujo guiado para proteger a ambas partes.</p>
        <div className="nido-process-card__list">
          <div>
            <ShieldCheck size={16} />
            <span>Direccion exacta y contacto privado se comparten solo cuando avance la visita.</span>
          </div>
          <div>
            <MessageCircle size={16} />
            <span>El propietario recibe tu interes con contexto de la vivienda.</span>
          </div>
        </div>
        <div className="nido-process-card__actions">
          <button type="button" className="nido-primary-button" onClick={() => onContact('visit')}>
            Solicitar visita
          </button>
          <Link className="nido-secondary-button" to="/properties">
            Comparar opciones
          </Link>
        </div>
      </div>
    </aside>
  );
}
