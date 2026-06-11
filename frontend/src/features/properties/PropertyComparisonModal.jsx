import React, { useEffect } from 'react';
import { Bath, BedDouble, Car, Check, MapPin, Ruler, Star, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PropertyImage } from '../../components/ui/PropertyImage';
import { PropertyMap } from '../../components/map/PropertyMap';
import { formatCurrency } from '../../lib/formatters';
import { getPropertyLocationLabel } from '../../lib/propertyPresentation';
import { hasValidCoordinates } from '../../utils/geo';

const getValue = (value, fallback = 'No indicado') => {
  if (value === null || value === undefined || value === '') return fallback;
  return value;
};

const getRating = (property) => {
  const rating = Number(property.rating || property.averageRating);
  return Number.isFinite(rating) ? rating.toFixed(1) : 'Sin rating';
};

const getTotalMonthly = (property) => Number(property.monthlyRent || 0) + Number(property.maintenanceFee || 0);

function ComparisonSummaryCard({ property }) {
  const area = property.areaM2 || property.area;
  const highlights = [
    property.furnished ? 'Amoblado' : null,
    property.petsAllowed ? 'Mascotas' : null,
    Number(property.parkingSpots || 0) > 0 ? `${property.parkingSpots} parqueadero` : null,
  ].filter(Boolean);

  return (
    <article className="property-comparison-summary-card">
      <PropertyImage property={property} alt={property.title} className="property-comparison-summary-card__image" />
      <div className="property-comparison-summary-card__body">
        <strong>{property.title}</strong>
        <span>
          <MapPin size={14} aria-hidden="true" />
          {getPropertyLocationLabel(property)}
        </span>
        <p>{formatCurrency(getTotalMonthly(property))} total aprox.</p>
        <div className="property-comparison-summary-card__facts">
          <span>{getValue(property.bedrooms, '--')} hab.</span>
          <span>{getValue(property.bathrooms, '--')} banos</span>
          <span>{getValue(area, '--')} m2</span>
        </div>
        {highlights.length ? (
          <div className="property-comparison-summary-card__tags">
            {highlights.map((highlight) => (
              <span key={highlight}>{highlight}</span>
            ))}
          </div>
        ) : null}
        <Link className="property-comparison-summary-card__link" to={`/properties/${property.id}`}>
          Ver propiedad
        </Link>
      </div>
    </article>
  );
}

function BooleanValue({ active }) {
  return active ? (
    <span className="property-comparison-modal__yes">
      <Check size={14} aria-hidden="true" />
      Si
    </span>
  ) : (
    'No'
  );
}

function MobileComparisonCard({ property }) {
  const area = property.areaM2 || property.area;

  return (
    <article className="property-comparison-mobile-card">
      <PropertyImage property={property} alt={property.title} className="property-comparison-mobile-card__image" />
      <div className="property-comparison-mobile-card__body">
        <strong>{property.title}</strong>
        <p>{formatCurrency(property.monthlyRent)} / mes</p>
        <span>
          <MapPin size={14} aria-hidden="true" />
          {getPropertyLocationLabel(property)}
        </span>
        <div className="property-comparison-mobile-card__facts">
          <span>
            <BedDouble size={14} aria-hidden="true" />
            {getValue(property.bedrooms, '--')} hab.
          </span>
          <span>
            <Bath size={14} aria-hidden="true" />
            {getValue(property.bathrooms, '--')} banos
          </span>
          <span>
            <Ruler size={14} aria-hidden="true" />
            {getValue(area, '--')} m2
          </span>
          <span>
            <Car size={14} aria-hidden="true" />
            {Number(property.parkingSpots || 0) > 0 ? property.parkingSpots : 'Sin'} parq.
          </span>
        </div>
        <Link to={`/properties/${property.id}`}>Ver detalle</Link>
      </div>
    </article>
  );
}

export function PropertyComparisonModal({ open, properties, onClose }) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="property-comparison-modal" role="dialog" aria-modal="true" aria-label="Comparar propiedades">
      <button
        type="button"
        className="property-comparison-modal__backdrop"
        aria-label="Cerrar comparacion"
        onClick={onClose}
      />
      <section className="property-comparison-modal__panel">
        <header className="property-comparison-modal__header">
          <div>
            <span>Comparacion</span>
            <h2>{properties.length} opciones seleccionadas</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar comparacion">
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="property-comparison-modal__summary-grid">
          {properties.map((property) => (
            <ComparisonSummaryCard key={property.id} property={property} />
          ))}
        </div>

        <section className="nido-comparison-map-grid" aria-label="Ubicacion en mapa">
          {properties.map((property) => (
            <article key={property.id} className="nido-comparison-map-card">
              <strong>{property.title}</strong>
              <PropertyMap
                latitude={property.latitude}
                longitude={property.longitude}
                address={getPropertyLocationLabel(property)}
                title={property.title}
                zoom={14}
                heightClassName="nido-map--compare"
                compact
              />
              {!hasValidCoordinates(property.latitude, property.longitude) ? (
                <span>Sin ubicacion disponible</span>
              ) : null}
            </article>
          ))}
        </section>

        <div className="property-comparison-modal__table-wrap">
          <table className="property-comparison-modal__table">
            <thead>
              <tr>
                <th>Propiedad</th>
                {properties.map((property) => (
                  <th key={property.id}>
                    <PropertyImage property={property} alt={property.title} />
                    <strong>{property.title}</strong>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Precio mensual</td>
                {properties.map((property) => (
                  <td key={property.id}>{formatCurrency(property.monthlyRent)}</td>
                ))}
              </tr>
              <tr>
                <td>Ubicacion</td>
                {properties.map((property) => (
                  <td key={property.id}>{getPropertyLocationLabel(property)}</td>
                ))}
              </tr>
              <tr>
                <td>Habitaciones</td>
                {properties.map((property) => (
                  <td key={property.id}>{getValue(property.bedrooms, '--')}</td>
                ))}
              </tr>
              <tr>
                <td>Banos</td>
                {properties.map((property) => (
                  <td key={property.id}>{getValue(property.bathrooms, '--')}</td>
                ))}
              </tr>
              <tr>
                <td>Parqueadero</td>
                {properties.map((property) => (
                  <td key={property.id}>
                    {Number(property.parkingSpots || 0) > 0 ? `${property.parkingSpots}` : 'Sin parqueadero'}
                  </td>
                ))}
              </tr>
              <tr>
                <td>Area</td>
                {properties.map((property) => (
                  <td key={property.id}>{getValue(property.areaM2 || property.area, '--')} m2</td>
                ))}
              </tr>
              <tr>
                <td>Amoblado</td>
                {properties.map((property) => (
                  <td key={property.id}>
                    <BooleanValue active={property.furnished} />
                  </td>
                ))}
              </tr>
              <tr>
                <td>Mascotas</td>
                {properties.map((property) => (
                  <td key={property.id}>
                    <BooleanValue active={property.petsAllowed} />
                  </td>
                ))}
              </tr>
              <tr>
                <td>Rating</td>
                {properties.map((property) => (
                  <td key={property.id}>
                    <span className="property-comparison-modal__rating">
                      <Star size={14} aria-hidden="true" />
                      {getRating(property)}
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td>Accion</td>
                {properties.map((property) => (
                  <td key={property.id}>
                    <Link className="property-comparison-modal__link" to={`/properties/${property.id}`}>
                      Ver detalle
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="property-comparison-modal__mobile-list">
          {properties.map((property) => (
            <MobileComparisonCard key={property.id} property={property} />
          ))}
        </div>
      </section>
    </div>
  );
}
