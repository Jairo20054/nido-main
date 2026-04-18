import React from 'react';
import { Bath, BedDouble, Heart, MapPin, Sofa } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate, getPropertyTypeLabel } from '../../lib/formatters';

export function PropertyCard({ property, onToggleFavorite, disabledFavorite = false }) {
  return (
    <article className="property-card">
      <div className="property-card__media">
        <img src={property.coverImage} alt={property.title} className="property-card__image" />
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
          <span>{formatDate(property.availableFrom)}</span>
        </div>
        <Link to={`/properties/${property.id}`} className="property-card__title">
          {property.title}
        </Link>
        <p className="property-card__summary">{property.summary}</p>
        <div className="property-card__meta">
          <span>
            <MapPin size={15} />
            {property.city}
            {property.neighborhood ? `, ${property.neighborhood}` : ''}
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
            <Sofa size={15} />
            {property.furnished ? 'Amoblado' : 'Sin amoblar'}
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
