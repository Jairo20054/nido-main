import React, { useState } from 'react';
import { Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../lib/formatters';

export function PropertyCard({ property, onToggleFavorite, disabledFavorite = false }) {
  const [isFavorite, setIsFavorite] = useState(property.isFavorite || false);

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    setIsFavorite(!isFavorite);
    if (onToggleFavorite) {
      onToggleFavorite(property);
    }
  };

  const getPropertyTag = () => {
    if (property.isNew) return 'Nuevo';
    if (property.isPopular) return 'Popular';
    return null;
  };

  const getPropertyFeatures = () => {
    const features = [];
    if (property.furnished) features.push('Amoblado');
    if (property.allowPets) features.push('Mascotas OK');
    if (property.parking) features.push('Parqueadero');
    return features;
  };

  const tag = getPropertyTag();
  const features = getPropertyFeatures();

  return (
    <Link to={`/properties/${property.id}`} className="property-card">
      <div className="property-card__media">
        <img src={property.coverImage} alt={property.title} className="property-card__image" />
        
        {tag && (
          <span className="property-card__badge">{tag}</span>
        )}

        <button
          type="button"
          className={`property-card__favorite ${isFavorite ? 'property-card__favorite--active' : ''}`}
          onClick={handleToggleFavorite}
          disabled={disabledFavorite}
        >
          <Heart size={16} />
        </button>
      </div>

      <div className="property-card__body">
        <div className="property-card__header">
          <h3 className="property-card__title">
            {property.title} · {property.neighborhood || property.city}
          </h3>
          <span className="property-card__rating">
            <Star size={14} fill="currentColor" /> {property.rating || 4.9}
          </span>
        </div>

        <p className="property-card__meta">
          {property.bedrooms} hab · {property.bathrooms} baño · {property.area} m²
        </p>

        {features.length > 0 && (
          <div className="property-card__tags">
            {features.map((feature) => (
              <span key={feature} className="property-card__tag">
                {feature}
              </span>
            ))}
          </div>
        )}

        <p className="property-card__price">
          {formatCurrency(property.monthlyRent)} / mes
        </p>
      </div>
    </Link>
  );
}
