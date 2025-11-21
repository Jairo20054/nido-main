import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import styles from './PropertyCardOptimized.module.css';

/**
 * PropertyCard Optimizado - SIN LAYOUT SHIFTS
 * - Aspect ratio fijo 4/5
 * - Min-height garantizado
 * - object-cover en imágenes
 * - Skeleton loading consistente
 */

const PropertyCardSkeleton = () => (
  <div className={styles.card}>
    <div className={styles.imageContainer}>
      <div className={styles.skeletonImage} />
    </div>
    <div className={styles.content}>
      <div className={styles.skeletonLine} />
      <div className={styles.skeletonLine} />
      <div className={styles.skeletonLine} />
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

  // Define hooks BEFORE any early returns
  const images = property?.images || ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=500&fit=crop'];
  const currentImage = images[currentImageIndex] || images[0];

  const handlePrevImage = useCallback((e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => prev === 0 ? images.length - 1 : prev - 1);
  }, [images.length]);

  const handleNextImage = useCallback((e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handleFavorite = useCallback((e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  }, [isFavorite]);

  // NOW we can have early returns
  if (isLoading) return <PropertyCardSkeleton />;
  if (!property) return null;

  return (
    <div 
      className={styles.card}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onClick?.()}
    >
      {/* IMAGE CONTAINER - FIXED ASPECT RATIO 4/5 */}
      <div className={styles.imageContainer}>
        <img
          src={currentImage}
          alt={`${property?.title || 'Property'} - Image ${currentImageIndex + 1}`}
          className={styles.image}
          loading="lazy"
        />
        
        {/* SUPERHOST BADGE */}
        {property?.superhost && (
          <div className={styles.superhostBadge}>
            ⭐ Superhost
          </div>
        )}
        
        {/* IMAGE NAVIGATION */}
        {images.length > 1 && (
          <>
            <button
              className={`${styles.navBtn} ${styles.prev}`}
              onClick={handlePrevImage}
              aria-label="Previous image"
              type="button"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className={`${styles.navBtn} ${styles.next}`}
              onClick={handleNextImage}
              aria-label="Next image"
              type="button"
            >
              <ChevronRight size={18} />
            </button>

            {/* IMAGE INDICATORS */}
            <div className={styles.indicators}>
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.indicator} ${index === currentImageIndex ? styles.active : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  type="button"
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* FAVORITE BUTTON */}
        <button
          className={`${styles.favoriteBtn} ${isFavorite ? styles.favorited : ''}`}
          onClick={handleFavorite}
          aria-label="Add to favorites"
          type="button"
        >
          <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* CONTENT */}
      <div className={styles.content}>
        <h3 className={styles.title}>{property?.title || 'Property'}</h3>
        
        <div className={styles.location}>
          📍 {property?.location || 'Location'}
        </div>

        <div className={styles.footer}>
          <div className={styles.price}>
            ${(property?.price || 0).toLocaleString('es-CO')}
            <span className={styles.period}>/noche</span>
          </div>
          
          {property?.rating && (
            <div className={styles.rating}>
              ⭐ {property.rating.toFixed(1)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
