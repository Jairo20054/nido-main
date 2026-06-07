import React from 'react';
import { PropertyCard } from './PropertyCard';
import { PropertyCardSkeleton } from './PropertyCardSkeleton';

export function PropertiesGrid({
  loading,
  properties,
  viewMode,
  onToggleFavorite,
  savingFavorite,
  selectedPropertyIds = [],
  onToggleCompare,
}) {
  if (loading) {
    return (
      <div className={`property-grid property-grid--results properties-grid--${viewMode}`}>
        <PropertyCardSkeleton count={viewMode === 'list' ? 5 : 9} variant="compact" />
      </div>
    );
  }

  return (
    <div className={`property-grid property-grid--results properties-grid--${viewMode}`}>
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          variant="compact"
          onToggleFavorite={onToggleFavorite}
          disabledFavorite={savingFavorite === property.id}
          selectedForCompare={selectedPropertyIds.includes(property.id)}
          onToggleCompare={onToggleCompare}
        />
      ))}
    </div>
  );
}
