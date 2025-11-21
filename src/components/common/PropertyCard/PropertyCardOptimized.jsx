import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import './PropertyCard.module.css';

/**
 * PropertyCard Optimizado - SIN LAYOUT SHIFTS
 * - Aspect ratio fijo 4/5
 * - Min-height garantizado
 * - object-cover en imágenes
 * - Skeleton loading consistente
 */

const PropertyCardSkeleton = () => (
  <div className="property-card skeleton">
    <div className="property-image-container">
      <div className="skeleton-loader"></div>
    </div>
    <div className="property-content">
      <div className="skeleton-text skeleton-title"></div>
      <div className="skeleton-text skeleton-location"></div>
      <div className="skeleton-text skeleton-price"></div>
    </div>
  </div>
);

const PropertyCard = ({ 
  property, 
  onClick, 
  isLoading = false 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (isLoading) return <PropertyCardSkeleton />;

  const images = property?.images || [];
  const hasImages = images.length > 0 && !imageError;
  const currentImage = hasImages ? images[currentImageIndex] : null;

  const handlePrevImage = useCallback((e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  }, [images.length]);

  const handleNextImage = useCallback((e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      (prev + 1) % images.length
    );
  }, [images.length]);

  const handleFavorite = useCallback((e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  }, [isFavorite]);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  return (
    <article 
      className="property-card"
      onClick={onClick}
      role="article"
      aria-label={`Propiedad: ${property?.title}`}
    >
      {/* IMAGE CONTAINER - FIXED ASPECT RATIO */}
      <div className="property-image-container">
        {hasImages ? (
          <>
            <img
              src={currentImage}
              alt={`${property?.title} - Imagen ${currentImageIndex + 1}`}
              className="property-image"
              loading="lazy"
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
            
            {/* IMAGE NAVIGATION */}
            {images.length > 1 && (
              <>
                <button
                  className="image-nav-btn prev"
                  onClick={handlePrevImage}
                  aria-label="Imagen anterior"
                  type="button"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  className="image-nav-btn next"
                  onClick={handleNextImage}
                  aria-label="Siguiente imagen"
                  type="button"
                >
                  <ChevronRight size={20} />
                </button>

                {/* IMAGE INDICATORS */}
                <div className="image-indicators">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                      aria-label={`Ir a imagen ${index + 1}`}
                      type="button"
                    />
                  ))}
                </div>
              </>
            )}

            {/* FAVORITE BUTTON */}
            <button
              className={`favorite-btn ${isFavorite ? 'active' : ''}`}
              onClick={handleFavorite}
              aria-label={isFavorite ? 'Remover de favoritos' : 'Agregar a favoritos'}
              type="button"
            >
              <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>

            {/* SUPERHOST BADGE */}
            {property?.superhost && (
              <div className="badge superhost">
                ⭐ Superanfitrión
              </div>
            )}
          </>
        ) : (
          <div className="image-placeholder">
            <span>Sin imágenes disponibles</span>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="property-content">
        {/* TITLE & RATING */}
        <div className="property-header">
          <h3 className="property-title">{property?.title}</h3>
          {property?.rating && (
            <div className="property-rating" aria-label={`Calificación: ${property.rating}`}>
              <span className="star">⭐</span>
              <span className="rating-value">{property.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* LOCATION */}
        {property?.city && (
          <p className="property-location">📍 {property.city}</p>
        )}

        {/* FEATURES */}
        {(property?.bedrooms || property?.bathrooms) && (
          <div className="property-features">
            {property?.bedrooms && <span>{property.bedrooms} hab</span>}
            {property?.bathrooms && <span>{property.bathrooms} baños</span>}
          </div>
        )}

        {/* PRICE */}
        <div className="property-price">
          <span className="price-amount">
            ${property?.price?.toLocaleString('es-CO')}
          </span>
          <span className="price-unit">
            {property?.pricePeriod || '/noche'}
          </span>
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;
