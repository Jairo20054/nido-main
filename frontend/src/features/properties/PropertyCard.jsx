import React from 'react';
import {
  BadgeCheck,
  Bath,
  BedDouble,
  Car,
  Heart,
  MapPin,
  MessageCircle,
  Ruler,
  ShieldCheck,
  Star,
} from 'lucide-react';
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
  proximityLabel,
  distanceLabel,
}) {
  const safeText = (value, fallback = '') => {
    if (value === null || value === undefined) return fallback;

    const text = String(value).trim();
    return text && text !== '[object Object]' ? text : fallback;
  };
  const formatCount = (value, fallback = '--') => {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  };
  const features = [];
  const amenityText = (property.amenities || []).join(' ').toLowerCase();
  if (property.furnished) features.push('Amoblado');
  if (property.parkingSpots) features.push(`${property.parkingSpots} parqueadero${property.parkingSpots > 1 ? 's' : ''}`);
  if (property.balcony || amenityText.includes('balcon')) {
    features.push('Balcon');
  }
  if (property.elevator || amenityText.includes('ascensor')) features.push('Ascensor');
  if (amenityText.includes('gimnasio') || amenityText.includes('gym')) features.push('Gimnasio');
  if (property.petsAllowed) features.push('Acepta mascotas');
  if (amenityText.includes('conjunto cerrado') || amenityText.includes('unidad cerrada')) {
    features.push('Conjunto cerrado');
  }
  if (property.utilitiesIncluded) features.push('Servicios incluidos');
  if (property.maintenanceFee) features.push(`Adm. ${formatCurrency(property.maintenanceFee)}`);

  const isCompact = variant === 'compact';
  const isHome = variant === 'home';
  const area = property.areaM2 || property.area;
  const typeLabel = getPropertyTypeLabel(property.propertyType);
  const trustLabel = getPropertyTrustLabel(property);
  const reputationLabel = getPropertyReputationLabel(property);
  const totalMonthly = (property.monthlyRent || 0) + (property.maintenanceFee || 0);
  const visibleFeatures = features.slice(0, isCompact ? 2 : 4);
  const title = safeText(property.title, `${typeLabel || 'Vivienda'} en arriendo`);
  const summary = safeText(property.summary || property.description);
  const rating = Number(property.rating || property.averageRating);
  const hasRating = Number.isFinite(rating);
  const commentsCount = property.commentsCount || property.commentCount || property.reviewsCount;
  const badgeLabel = (() => {
    if (property.isExample) return 'Ejemplo';
    if (property.availableImmediately) return 'Disponible';
    if ((property.requestCount || 0) >= 3) return 'Destacado';
    if (property.verificationDetails) return 'Verificada';
    return 'Nuevo';
  })();
  const cardTarget = `/properties/${property.id}`;

  const handleToggleFavorite = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (onToggleFavorite) {
      onToggleFavorite(property);
    }
  };

  return (
    <Link
      to={cardTarget}
      className={`property-card property-card--${variant}`}
      aria-label={`Ver detalle de ${title}`}
    >
      <div className="property-card__media">
        <PropertyImage property={property} alt={title} className="property-card__image" />

        <div className="property-card__badge-row">
          <span className="property-card__badge">
            {isHome ? proximityLabel || 'Cerca de ti' : badgeLabel}
          </span>
          {!isCompact && !isHome ? (
            <span className="property-card__badge property-card__badge--trust">
              <ShieldCheck size={13} />
              {trustLabel}
            </span>
          ) : null}
        </div>

        {onToggleFavorite ? (
          <button
            type="button"
            className={`property-card__favorite ${
              property.isFavorite ? 'property-card__favorite--active' : ''
            }`}
            onClick={handleToggleFavorite}
            disabled={disabledFavorite}
            aria-label={property.isFavorite ? 'Quitar de guardados' : 'Guardar propiedad'}
          >
            <Heart size={16} />
          </button>
        ) : null}

        {isHome && distanceLabel ? (
          <span className="property-card__distance">
            <MapPin size={13} />
            {distanceLabel}
          </span>
        ) : null}
      </div>

      <div className="property-card__body">
        <div className="property-card__headline">
          <div>
            <p className="property-card__price">
              {formatCurrency(property.monthlyRent)}
              {isHome ? '' : ' / mes'}
            </p>
            {property.maintenanceFee && !isHome ? (
              <p className="property-card__price-note">
                Total estimado: {formatCurrency(totalMonthly)}
              </p>
            ) : null}
          </div>
          {!isCompact && !isHome ? (
            <span className="property-card__signal">
              <BadgeCheck size={14} />
              {reputationLabel}
            </span>
          ) : null}
        </div>

        <h3 className="property-card__title">{title}</h3>
        <p className="property-card__location">
          <MapPin size={14} />
          {getPropertyLocationLabel(property)}
        </p>
        {!isHome && summary ? <p className="property-card__summary">{summary}</p> : null}

        <div className="property-card__stats">
          <span>
            <BedDouble size={14} /> {formatCount(property.bedrooms)} hab.
          </span>
          <span>
            <Bath size={14} /> {formatCount(property.bathrooms)} banos
          </span>
          <span>
            <Ruler size={14} /> {formatCount(area)} m2
          </span>
          {!isHome ? (
            <span>
              <Car size={14} /> {Number(property.parkingSpots || 0) > 0 ? `${property.parkingSpots}` : 'Sin'} parq.
            </span>
          ) : null}
        </div>

        {!isHome && (hasRating || commentsCount) ? (
          <div className="property-card__social-proof">
            {hasRating ? (
              <span>
                <Star size={14} /> {rating.toFixed(1)}
              </span>
            ) : null}
            {commentsCount ? (
              <span>
                <MessageCircle size={14} /> {commentsCount} comentarios
              </span>
            ) : null}
          </div>
        ) : null}

        {!isHome && visibleFeatures.length > 0 ? (
          <div className="property-card__tags">
            {visibleFeatures.map((feature) => (
              <span key={feature} className="property-card__tag">
                {feature}
              </span>
            ))}
          </div>
        ) : null}

        {!isHome ? (
          <div className="property-card__footer">
            <span className="property-card__footer-badge">
              {property.availableImmediately ? 'Disponible ahora' : 'Agenda visita'}
            </span>
            <span className="property-card__cta">Ver detalles</span>
          </div>
        ) : null}
      </div>
    </Link>
  );
}
