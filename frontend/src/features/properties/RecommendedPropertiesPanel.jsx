import React from 'react';
import { ArrowRight, BadgeCheck, Bus, Heart, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PropertyImage } from '../../components/ui/PropertyImage';
import { formatCurrency } from '../../lib/formatters';
import { getPropertyLocationLabel } from '../../lib/propertyPresentation';
import { MapPreview } from './MapPreview';

const zoneSignals = [
  {
    icon: BadgeCheck,
    title: 'Buena ubicacion',
    text: 'Compara cercania a comercio, servicios y zonas de interes.',
  },
  {
    icon: TrendingUp,
    title: 'Alta demanda',
    text: 'Las propiedades con buen precio suelen recibir solicitudes rapido.',
  },
  {
    icon: Bus,
    title: 'Cerca de transporte',
    text: 'Valida rutas y tiempos antes de agendar una visita.',
  },
];

export function RecommendedPropertiesPanel({ location, properties, onViewMap }) {
  const recommendations = properties.slice(0, 2);

  return (
    <aside className="recommendations-panel" aria-label="Mapa y recomendaciones">
      <MapPreview location={location} properties={properties} />

      <section className="zone-summary">
        <div className="zone-summary__heading">
          <h2>Sobre {location || 'tu busqueda'}</h2>
          <button type="button" onClick={onViewMap}>
            Ver mas
          </button>
        </div>
        <div className="zone-summary__items">
          {zoneSignals.map(({ icon: Icon, title, text }) => (
            <div key={title} className="zone-summary__item">
              <span>
                <Icon size={16} aria-hidden="true" />
              </span>
              <div>
                <strong>{title}</strong>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
        <button type="button" className="zone-summary__cta" onClick={onViewMap}>
          Conocer mas sobre la zona
          <ArrowRight size={15} aria-hidden="true" />
        </button>
      </section>

      <section className="recommended-mini-list">
        <div className="recommended-mini-list__heading">
          <h2>Recomendaciones para ti</h2>
          <Link to="/properties">Ver todas</Link>
        </div>
        {recommendations.length ? (
          recommendations.map((property) => (
            <Link key={property.id} to={`/properties/${property.id}`} className="recommended-mini-card">
              <PropertyImage property={property} className="recommended-mini-card__image" alt={property.title} />
              <div>
                <strong>{property.title}</strong>
                <span>{formatCurrency(property.monthlyRent)} / mes</span>
                <small>{getPropertyLocationLabel(property)}</small>
              </div>
              <Heart size={17} aria-hidden="true" />
            </Link>
          ))
        ) : (
          <p className="recommended-mini-list__empty">Apareceran cuando existan resultados.</p>
        )}
      </section>
    </aside>
  );
}
