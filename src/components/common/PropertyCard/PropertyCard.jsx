import React, { useState } from 'react';
import { FiHeart, FiStar } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import './PropertyCard.css';

const PropertyCard = ({ property, onFavorite }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleFavorite = (e) => {
    e.preventDefault();
    setIsFavorite(!isFavorite);
    onFavorite?.(property.id, !isFavorite);
  };

  const handlePrevImage = (e) => {
    e.preventDefault();
    setCurrentImageIndex((prev) =>
      prev === 0 ? (property.images?.length || 1) - 1 : prev - 1
    );
  };

  const handleNextImage = (e) => {
    e.preventDefault();
    setCurrentImageIndex((prev) =>
      prev === (property.images?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  const images = property.images || ['/api/placeholder/300/300'];
  const currentImage = images[currentImageIndex];
  const rating = property.rating || 4.8;
  const reviews = property.reviews || 0;

  return (
    <Link to={`/property/${property.id}`} className="property-card-link">
      <div className="property-card">
        {/* Imagen */}
        <div className="property-image-container">
          <img
            src={currentImage}
            alt={property.title}
            className="property-image"
            loading="lazy"
          />

          {/* Botón Favorito */}
          <button
            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
            onClick={handleFavorite}
            aria-label="Agregar a favoritos"
          >
            <FiHeart size={20} />
          </button>

          {/* Controles de imagen (solo si hay múltiples) */}
          {images.length > 1 && (
            <>
              <button
                className="image-nav-btn prev"
                onClick={handlePrevImage}
                aria-label="Imagen anterior"
              >
                ‹
              </button>
              <button
                className="image-nav-btn next"
                onClick={handleNextImage}
                aria-label="Siguiente imagen"
              >
                ›
              </button>
              {/* Indicadores */}
              <div className="image-indicators">
                {images.map((_, idx) => (
                  <span
                    key={idx}
                    className={`indicator ${idx === currentImageIndex ? 'active' : ''}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Contenido */}
        <div className="property-content">
          {/* Header con nombre y rating */}
          <div className="property-header">
            <h3 className="property-title">{property.title}</h3>
            <div className="property-rating">
              <FiStar size={14} className="star-icon" />
              <span className="rating-text">{rating}</span>
              {reviews > 0 && <span className="reviews-text">({reviews})</span>}
            </div>
          </div>

          {/* Ubicación */}
          {property.location && (
            <p className="property-location">{property.location}</p>
          )}

          {/* Specs */}
          {property.specs && (
            <div className="property-specs">
              {property.specs.rooms > 0 && (
                <span>{property.specs.rooms} hab.</span>
              )}
              {property.specs.bathrooms > 0 && (
                <span>{property.specs.bathrooms} baño(s)</span>
              )}
              {property.specs.area > 0 && (
                <span>{property.specs.area}m²</span>
              )}
            </div>
          )}

          {/* Descripción corta */}
          {property.description && (
            <p className="property-description">
              {property.description.substring(0, 60)}...
            </p>
          )}

          {/* Precio */}
          <div className="property-price">
            <span className="price-amount">
              ${property.price?.toLocaleString('es-CO') || 0}
            </span>
            <span className="price-period">
              {property.priceType || 'por mes'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
