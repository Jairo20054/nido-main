import React, { useEffect, useState } from 'react';
import { Bath, BedDouble, Heart, MapPin, Ruler } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency, getPropertyTypeLabel } from '../../lib/formatters';

export function PropertyCard({ property, onToggleFavorite, disabledFavorite = false }) {
  const [isFavorite, setIsFavorite] = useState(property.isFavorite || false);

  useEffect(() => {
    setIsFavorite(property.isFavorite || false);
  }, [property.isFavorite]);

  const handleToggleFavorite = (event) => {
    event.preventDefault();
    setIsFavorite(!isFavorite);
    if (onToggleFavorite) {
      onToggleFavorite(property);
    }
  };

  const getPropertyFeatures = () => {
    const features = [];
    if (property.furnished) features.push('Amoblado');
    if (property.petsAllowed) features.push('Mascotas OK');
    if (property.parkingSpots) features.push('Parqueadero');
    if (property.maintenanceFee) features.push(`Adm. ${formatCurrency(property.maintenanceFee)}`);
    return features;
  };

  const features = getPropertyFeatures();
  const area = property.areaM2 || property.area || 0;
  const typeLabel = getPropertyTypeLabel(property.propertyType);

  return (
    <Link to={`/properties/${property.id}`} className="property-card">
      <div className="property-card__media">
        <img src={property.coverImage} alt={property.title} className="property-card__image" />

        <span className="property-card__badge">{typeLabel}</span>

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
        <p className="property-card__price">{formatCurrency(property.monthlyRent)} / mes</p>
        <h3 className="property-card__title">{property.title}</h3>
        <p className="property-card__summary">{property.summary}</p>
        <p className="property-card__location">
          <MapPin size={14} />
          {property.neighborhood || 'Zona residencial'} · {property.city}
        </p>

        <div className="property-card__stats">
          <span><BedDouble size={14} /> {property.bedrooms}</span>
          <span><Bath size={14} /> {property.bathrooms}</span>
          <span><Ruler size={14} /> {area}m2</span>
        </div>

        {features.length > 0 && (
          <div className="property-card__tags">
            {features.slice(0, 4).map((feature) => (
              <span key={feature} className="property-card__tag">
                {feature}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
