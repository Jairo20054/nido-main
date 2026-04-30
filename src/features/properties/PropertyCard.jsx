import React from 'react';
import { Bath, BedDouble, Heart, MapPin, Square, Warehouse } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PropertyStatusBadge } from '../../components/ui/PropertyStatusBadge';
import { formatCurrency, getPropertyTypeLabel } from '../../lib/formatters';

/**
 * Componente de uso presentacional para una propiedad resumida.
 * Se reutiliza en home, resultados de busqueda y favoritos; por eso recibe
 * callbacks opcionales para favorito y flags para adaptar el nivel de detalle.
 */
export function PropertyCard({ property, onToggleFavorite, disabledFavorite = false, showStatus = true }) {
  return (
    <article className="property-card">
      <div className="property-card__media">
        <img src={property.coverImage} alt={property.title} className="property-card__image" />
        {showStatus ? (
          <div className="property-card__status">
            <PropertyStatusBadge status={property.status} />
          </div>
        ) : null}
        {onToggleFavorite ? (
          <button
            type="button"
            className={`favorite-chip ${property.isFavorite ? 'favorite-chip--active' : ''}`}
            onClick={() => onToggleFavorite(property)}
            disabled={disabledFavorite}
          >
            <Heart size={16} />
          </button>
        ) : null}
      </div>
      <div className="property-card__body">
        <div className="property-card__eyebrow">
          <span>{getPropertyTypeLabel(property.propertyType)}</span>
          <span>{property.neighborhood ? `${property.city}, ${property.neighborhood}` : property.city}</span>
        </div>
        <Link to={`/properties/${property.id}`} className="property-card__title">
          {property.title}
        </Link>
        <p className="property-card__summary">{property.summary}</p>
        <div className="property-card__meta">
          <span>
            <MapPin size={15} />
            {property.city}
          </span>
          <span>
            <BedDouble size={15} />
            {property.bedrooms} hab.
          </span>
          <span>
            <Bath size={15} />
            {property.bathrooms} banos
          </span>
          <span>
            <Square size={15} />
            {property.areaM2} m2
          </span>
          <span>
            <Warehouse size={15} />
            {property.parkingSpots ? `${property.parkingSpots} parqueadero` : 'Sin parqueadero'}
          </span>
        </div>
        <div className="property-card__footer">
          <strong>{formatCurrency(property.monthlyRent)}</strong>
          <span>canon mensual</span>
        </div>
      </div>
    </article>
  );
}
