import React, { useEffect, useState } from 'react';
import { getFallbackPropertyImage, getPropertyPrimaryImage } from '../../lib/propertyPresentation';

export function PropertyImage({
  property,
  alt,
  className,
  loading = 'lazy',
}) {
  const preferredImage = getPropertyPrimaryImage(property);
  const fallbackImage = getFallbackPropertyImage(property?.propertyType);
  const [src, setSrc] = useState(preferredImage);

  useEffect(() => {
    setSrc(preferredImage);
  }, [preferredImage]);

  return (
    <img
      src={src}
      alt={alt || property?.title || 'Propiedad Nido'}
      className={className}
      loading={loading}
      onError={() => {
        if (src !== fallbackImage) {
          setSrc(fallbackImage);
        }
      }}
    />
  );
}
