import {
  ArrowUpDown,
  Car,
  Droplets,
  Dumbbell,
  Eye,
  Flame,
  Globe,
  Laptop,
  Shield,
  Tv,
  WashingMachine,
  Wifi,
  Wind,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import PropertySection from './PropertySection';
import { getUniqueList } from './propertyDisplayUtils';

const amenityIcons = {
  wifi: Wifi,
  internet: Globe,
  tv: Tv,
  lavadora: WashingMachine,
  zona_ropas: WashingMachine,
  gimnasio: Dumbbell,
  ascensor: ArrowUpDown,
  zona_trabajo: Laptop,
  estudio: Laptop,
  aire_acondicionado: Wind,
  calentador: Flame,
  parqueadero: Car,
  seguridad: Shield,
  vigilancia: Eye,
  porteria: Shield,
  agua: Droplets,
  gas: Flame,
};

const normalizeKey = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/(^_|_$)/g, '');

const getIconForAmenity = (label) => {
  const key = normalizeKey(label);
  const Icon = amenityIcons[key] || amenityIcons[Object.keys(amenityIcons).find((item) => key.includes(item))];
  return Icon || Shield;
};

const categorizeAmenity = (label) => {
  const key = normalizeKey(label);

  if (/wifi|internet|tv/.test(key)) return 'Conectividad';
  if (/cocina|lavadora|ropa|amoblado|balcon|patio|aire|calentador|servicios/.test(key)) return 'Comodidad';
  if (/gimnasio|ascensor|zona|comun|parqueadero|estudio/.test(key)) return 'Edificio';
  if (/seguridad|vigilancia|porteria/.test(key)) return 'Seguridad';
  return 'Comodidad';
};

const buildAmenities = (property) =>
  getUniqueList([
    ...(property.amenities || []),
    ...(property.servicesIncluded || []),
    property.furnished ? 'Amoblado' : '',
    property.equippedKitchen ? 'Cocina integral' : '',
    property.laundryArea ? 'Zona de ropas' : '',
    property.elevator ? 'Ascensor' : '',
    property.doorman ? 'Porteria' : '',
    property.security ? 'Vigilancia' : '',
    property.commonAreas ? 'Zonas comunes' : '',
    property.balcony ? 'Balcon' : '',
    property.parkingSpots ? 'Parqueadero' : '',
    property.utilitiesIncluded ? 'Servicios incluidos' : '',
  ]);

export default function PropertyAmenities({ property }) {
  const [showAll, setShowAll] = useState(false);
  const amenities = useMemo(() => buildAmenities(property), [property]);
  const visibleAmenities = showAll ? amenities : amenities.slice(0, 8);
  const grouped = visibleAmenities.reduce((groups, amenity) => {
    const category = categorizeAmenity(amenity);
    return {
      ...groups,
      [category]: [...(groups[category] || []), amenity],
    };
  }, {});

  return (
    <PropertySection title="Amenidades">
      {amenities.length ? (
        <>
          <div className="nido-amenities-groups">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="nido-amenity-group">
                <h3>{category}</h3>
                <div className="nido-amenity-pills">
                  {items.map((amenity) => {
                    const Icon = getIconForAmenity(amenity);
                    return (
                      <span key={amenity} className="nido-amenity-pill">
                        <Icon size={14} aria-hidden="true" />
                        {amenity}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {amenities.length > 8 ? (
            <button type="button" className="nido-text-button nido-text-button--right" onClick={() => setShowAll((current) => !current)}>
              {showAll ? 'Ver menos amenidades' : `Ver todas las amenidades (${amenities.length})`}
            </button>
          ) : null}
        </>
      ) : (
        <p className="nido-detail-empty">Esta propiedad aun no tiene amenidades registradas.</p>
      )}
    </PropertySection>
  );
}
