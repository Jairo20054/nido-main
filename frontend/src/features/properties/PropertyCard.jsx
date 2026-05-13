import React from 'react';
import { BadgeCheck, Bath, BedDouble, Heart, MapPin, Ruler, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PropertyImage } from '../../components/ui/PropertyImage';
import { formatCurrency, getPropertyTypeLabel } from '../../lib/formatters';
import {
  getPropertyLocationLabel,
  getPropertyReputationLabel,
  getPropertyTrustLabel,
} from '../../lib/propertyPresentation';

export function PropertyCard({
  property,
  onToggleFavorite,
  disabledFavorite = false,
  variant = 'default',
}) {
  const features = [];
  if (property.furnished) features.push('Amoblado');
  if (property.petsAllowed) features.push('Mascotas OK');
  if (property.parkingSpots) features.push('Parqueadero');
  if (property.utilitiesIncluded) features.push('Servicios incluidos');
  if (property.maintenanceFee) features.push(`Adm. ${formatCurrency(property.maintenanceFee)}`);

  const isCompact = variant === 'compact';
  const area = property.areaM2 || property.area || 0;
  const typeLabel = getPropertyTypeLabel(property.propertyType);
  const trustLabel = getPropertyTrustLabel(property);
  const reputationLabel = getPropertyReputationLabel(property);
  const totalMonthly = (property.monthlyRent || 0) + (property.maintenanceFee || 0);
  const visibleFeatures = features.slice(0, isCompact ? 2 : 4);

  const handleToggleFavorite = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (onToggleFavorite) {
      onToggleFavorite(property);
    }
  };

  return (
    <Link to={`/properties/${property.id}`} className={`property-card property-card--${variant}`}>
      <div className="property-card__media">
        <PropertyImage property={property} alt={property.title} className="property-card__image" />

        <div className="property-card__badge-row">
          <span className="property-card__badge">{typeLabel}</span>
          {!isCompact ? (
            <span className="property-card__badge property-card__badge--trust">
              <ShieldCheck size={13} />
              {trustLabel}
            </span>
          ) : null}
        </div>

        {onToggleFavorite ? (
          <button
            type="button"
            className={`property-card__favorite ${property.isFavorite ? 'property-card__favorite--active' : ''}`}
            onClick={handleToggleFavorite}
            disabled={disabledFavorite}
            aria-label={property.isFavorite ? 'Quitar de guardados' : 'Guardar propiedad'}
          >
            <Heart size={16} />
          </button>
        ) : null}
      </div>

      <div className="property-card__body">
        <div className="property-card__headline">
          <div>
            <p className="property-card__price">{formatCurrency(property.monthlyRent)} / mes</p>
            {property.maintenanceFee ? (
              <p className="property-card__price-note">Total estimado: {formatCurrency(totalMonthly)}</p>
            ) : null}
          </div>
          {!isCompact ? (
            <span className="property-card__signal">
            <BadgeCheck size={14} />
            {reputationLabel}
            </span>
          ) : null}
        </div>

        <h3 className="property-card__title">{property.title}</h3>
        <p className="property-card__location">
          <MapPin size={14} />
          {getPropertyLocationLabel(property)}
        </p>
        {!isCompact ? <p className="property-card__summary">{property.summary}</p> : null}

        <div className="property-card__stats">
          <span><BedDouble size={14} /> {property.bedrooms} hab.</span>
          <span><Bath size={14} /> {property.bathrooms} banos</span>
          <span><Ruler size={14} /> {area} m2</span>
        </div>

        {visibleFeatures.length > 0 ? (
          <div className="property-card__tags">
            {visibleFeatures.map((feature) => (
              <span key={feature} className="property-card__tag">
                {feature}
              </span>
            ))}
          </div>
        ) : null}

        <div className="property-card__footer">
          <span className="property-card__footer-badge">
            {property.availableImmediately ? 'Disponible ahora' : 'Agenda visita'}
          </span>
          <span className="property-card__cta">Ver detalles</span>
        </div>
      </div>
    </Link>
  );
}
