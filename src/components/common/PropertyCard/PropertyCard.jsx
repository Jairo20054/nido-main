import React, { useState } from 'react';
import { Heart, ChevronLeft, ChevronRight, Star, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './PropertyCard.css';

const PropertyCard = ({ property, onFavoriteToggle }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(property?.isFavorite || false);
  const navigate = useNavigate();

  if (!property) return null;

  const images = property.images || [];
  const rating = property.rating || 4.5;
  const reviewCount = property.reviewCount || 128;
  const price = property.price || 0;

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const handleFavoriteToggle = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    if (onFavoriteToggle) {
      onFavoriteToggle(property.id, !isFavorite);
    }
  };

  const handleCardClick = () => {
    navigate(`/property/${property.id}`);
  };

  return (
    <div className="property-card" onClick={handleCardClick}>
      {/* GALERÍA DE IMÁGENES */}
      <div className="property-image-container">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentImageIndex]}
              alt={`${property.title} - Imagen ${currentImageIndex + 1}`}
              className="property-image"
              loading="lazy"
            />
            {images.length > 1 && (
              <>
                {/* Navegación de imágenes */}
                <button
                  className="property-nav-button property-nav-prev"
                  onClick={handlePrevImage}
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  className="property-nav-button property-nav-next"
                  onClick={handleNextImage}
                  aria-label="Siguiente imagen"
                >
                  <ChevronRight size={20} />
                </button>

                {/* Indicadores de imagen */}
                <div className="property-image-indicators">
                  {images.map((_, index) => (
                    <div
                      key={index}
                      className={`indicator ${
                        index === currentImageIndex ? 'active' : ''
                      }`}
                      aria-label={`Imagen ${index + 1} de ${images.length}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="property-image-placeholder">
            <span>Sin imagen disponible</span>
          </div>
        )}

        {/* BOTÓN FAVORITO */}
        <button
          className={`property-favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={handleFavoriteToggle}
          aria-label={isFavorite ? 'Remover de favoritos' : 'Añadir a favoritos'}
          aria-pressed={isFavorite}
        >
          <Heart
            size={24}
            className={isFavorite ? 'fill-current' : ''}
          />
        </button>
      </div>

      {/* INFORMACIÓN DE LA PROPIEDAD */}
      <div className="property-content">
        {/* Encabezado: Título y Ubicación */}
        <div className="property-header">
          <h3 className="property-title">{property.title}</h3>
          {property.type && (
            <p className="property-type">{property.type}</p>
          )}
        </div>

        {/* Ubicación */}
        {property.location && (
          <div className="property-location">
            <MapPin size={16} className="location-icon" />
            <span>{property.location}</span>
          </div>
        )}

        {/* Detalles (habitaciones, baños, m²) */}
        {(property.bedrooms || property.bathrooms || property.sqft) && (
          <div className="property-details">
            {property.bedrooms && (
              <span className="detail-item">
                {property.bedrooms} {property.bedrooms === 1 ? 'hab' : 'habs'}
              </span>
            )}
            {property.bathrooms && (
              <span className="detail-item">
                {property.bathrooms} {property.bathrooms === 1 ? 'baño' : 'baños'}
              </span>
            )}
            {property.sqft && (
              <span className="detail-item">{property.sqft} m²</span>
            )}
          </div>
        )}

        {/* Rating */}
        <div className="property-rating">
          <div className="stars">
            <Star size={16} className="fill-current" />
            <span className="rating-value">{rating}</span>
          </div>
          {reviewCount > 0 && (
            <span className="review-count">({reviewCount})</span>
          )}
        </div>

        {/* PRECIO */}
        <div className="property-price">
          <span className="price-amount">${price}</span>
          <span className="price-period">por mes</span>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
