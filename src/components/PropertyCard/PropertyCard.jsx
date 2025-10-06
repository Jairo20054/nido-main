import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PropertyCard.css';

const PropertyCard = ({
  property,
  onViewDetails,
  onContact,
  onReserve,
  isLiked = false
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleCardClick = () => {
    onViewDetails?.(property.id);
  };

  const handleContact = (e) => {
    e.stopPropagation();
    onContact?.(property.id);
  };

  const handleReserve = (e) => {
    e.stopPropagation();
    navigate(`/property/${property.id}`);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  return (
    <article
      className="property-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      role="article"
      aria-label={`Propiedad: ${property.title}`}
      tabIndex={0}
    >
      {/* Carrusel de imágenes */}
      <div className="property-card-image-container">
        {property.images?.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`${property.title} - Imagen ${index + 1}`}
            className={`property-card-image ${index === currentImageIndex ? 'active' : ''}`}
            loading="lazy"
          />
        ))}
        <div className="property-card-image-overlay" />
        <div className="property-card-badges">
          {property.isSuperhost && (
            <span className="property-card-badge">⭐ Superhost</span>
          )}
          {property.isNew && (
            <span className="property-card-badge">Nuevo</span>
          )}
          {property.isPetFriendly && (
            <span className="property-card-badge">🐾 Pet-friendly</span>
          )}
        </div>
        {property.images?.length > 1 && (
          <>
            <button
              className="property-card-nav property-card-nav--prev"
              onClick={prevImage}
              aria-label="Imagen anterior"
            >
              ‹
            </button>
            <button
              className="property-card-nav property-card-nav--next"
              onClick={nextImage}
              aria-label="Imagen siguiente"
            >
              ›
            </button>
            <div className="property-card-indicators">
              {property.images.map((_, index) => (
                <button
                  key={index}
                  className={`property-card-indicator ${index === currentImageIndex ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  aria-label={`Ir a imagen ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Contenido de la tarjeta */}
      <div className="property-card-content">
        <div className="property-card-location-rating">
          <div className="property-card-location" aria-label={`Ubicación: ${property.location}`}>
            📍 {property.location}
          </div>
          {property.rating && (
            <div className="property-card-rating" aria-label={`Valoración: ${property.rating.toFixed(1)} estrellas`}>
              <svg className="property-card-rating-star" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.39 2.462a1 1 0 00-.364 1.118l1.287 3.974c.3.922-.755 1.688-1.54 1.118l-3.39-2.462a1 1 0 00-1.175 0l-3.39 2.462c-.784.57-1.838-.196-1.539-1.118l1.287-3.974a1 1 0 00-.364-1.118L2.045 9.4c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.974z" />
              </svg>
              <span className="property-card-rating-value">{property.rating.toFixed(1)}</span>
              {property.reviewCount && (
                <span className="property-card-rating-count">({property.reviewCount})</span>
              )}
            </div>
          )}
        </div>

        <h3 className="property-card-title">{property.title}</h3>

        <div className="property-card-price">
          <span className="property-card-price-value">{formatPrice(property.price)}</span>
          <span className="property-card-price-unit">/ noche</span>
        </div>

        <div className="property-card-features" aria-label="Características de la propiedad">
          {property.bedrooms && (
            <span>🛏️ {property.bedrooms} {property.bedrooms === 1 ? 'hab' : 'hab'}</span>
          )}
          {property.bathrooms && (
            <span>🚿 {property.bathrooms} {property.bathrooms === 1 ? 'baño' : 'baños'}</span>
          )}
          {property.maxGuests && (
            <span>👥 {property.maxGuests} {property.maxGuests === 1 ? 'huésped' : 'huéspedes'}</span>
          )}
        </div>

        <div className="property-card-buttons" aria-hidden={!isHovered}>
          <button
            className="property-card-button property-card-button--contact"
            onClick={handleContact}
            aria-label="Contactar anfitrión"
          >
            Contactar
          </button>
          <button
            className="property-card-button property-card-button--reserve"
            onClick={handleReserve}
            aria-label="Reservar propiedad"
          >
            Reservar
          </button>
          <button
            className="property-card-button property-card-button--details"
            onClick={handleCardClick}
            aria-label="Ver detalles de la propiedad"
          >
            Ver detalles
          </button>
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;
