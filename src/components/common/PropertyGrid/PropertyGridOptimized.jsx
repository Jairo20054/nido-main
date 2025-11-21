import React from 'react';
import PropertyCardOptimized from '../PropertyCard/PropertyCardOptimized';
import styles from './PropertyGridOptimized.module.css';

/**
 * PropertyGrid - GRID PERFECTO SIN LAYOUT SHIFTS
 * 
 * Características:
 * - Grid responsivo con columnas exactas
 * - Auto-fill vs repeat para control total
 * - Minmax consistente
 * - Aspect ratio controlado desde PropertyCard
 * - Skeleton loading consistente
 */

const PropertyGrid = ({ 
  properties = [], 
  isLoading = false,
  onCardClick,
  gridCols = { desktop: 4, tablet: 2, mobile: 1 }
}) => {
  // LOADING STATE
  if (isLoading) {
    return (
      <div className={styles.propertyGrid}>
        {Array.from({ length: 8 }).map((_, i) => (
          <PropertyCardOptimized key={`skeleton-${i}`} isLoading={true} />
        ))}
      </div>
    );
  }

  // EMPTY STATE
  if (!properties || properties.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No se encontraron propiedades</p>
      </div>
    );
  }

  return (
    <div className={styles.propertyGrid}>
      {properties.map((property) => (
        <PropertyCardOptimized
          key={property.id}
          property={property}
          onClick={() => onCardClick?.(property)}
        />
      ))}
    </div>
  );
};

export default PropertyGrid;
