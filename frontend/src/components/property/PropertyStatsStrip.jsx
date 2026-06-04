import { Bath, Bed, Building2, Home, Ruler, Star } from 'lucide-react';
import { getPropertyType, isPresent } from './propertyDisplayUtils';

export default function PropertyStatsStrip({ property }) {
  const stats = [
    { icon: Home, value: getPropertyType(property), label: 'Tipo' },
    { icon: Bed, value: isPresent(property.bedrooms) ? property.bedrooms : '--', label: 'Hab.' },
    { icon: Bath, value: isPresent(property.bathrooms) ? property.bathrooms : '--', label: 'Banos' },
    { icon: Ruler, value: property.areaM2 ? `${property.areaM2} m2` : '--', label: 'Area' },
    { icon: Building2, value: isPresent(property.floor) ? property.floor : '--', label: 'Piso' },
    { icon: Star, value: isPresent(property.strata) ? property.strata : '--', label: 'Estrato' },
  ];

  return (
    <div className="nido-stats-strip" aria-label="Datos rapidos de la propiedad">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="nido-stat-chip">
            <Icon size={18} aria-hidden="true" />
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        );
      })}
    </div>
  );
}
