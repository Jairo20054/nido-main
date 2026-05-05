import React from 'react';

export function PropertyCardSkeleton({ count = 1, variant = 'default' }) {
  return Array.from({ length: count }).map((_, index) => (
    <div
      key={`${variant}-${index}`}
      className={`property-card property-card--${variant} property-card--skeleton`}
      aria-hidden="true"
    >
      <div className="property-card__media property-card__media--skeleton">
        <div className="skeleton-block skeleton-block--media" />
      </div>
      <div className="property-card__body">
        <div className="skeleton-line skeleton-line--price" />
        <div className="skeleton-line skeleton-line--title" />
        <div className="skeleton-line skeleton-line--summary" />
        <div className="skeleton-line skeleton-line--summary-short" />
        <div className="property-card__stats">
          <div className="skeleton-pill" />
          <div className="skeleton-pill" />
          <div className="skeleton-pill" />
        </div>
        <div className="property-card__tags">
          <div className="skeleton-pill skeleton-pill--wide" />
          <div className="skeleton-pill" />
        </div>
      </div>
    </div>
  ));
}
