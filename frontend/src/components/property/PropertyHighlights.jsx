import { Car, Home, MapPin, PawPrint, ShieldCheck, Sparkles } from 'lucide-react';
import PropertySection from './PropertySection';

export default function PropertyHighlights({ property }) {
  const highlights = [
    property.furnished
      ? { icon: Home, title: 'Amoblado', subtitle: 'Listo para mudarte con menos friccion.' }
      : { icon: Sparkles, title: 'Sin amoblar', subtitle: 'Mas libertad para personalizar tu espacio.' },
    property.petsAllowed
      ? { icon: PawPrint, title: 'Mascotas bienvenidas', subtitle: 'La propiedad acepta mascotas.' }
      : { icon: ShieldCheck, title: 'Mascotas por confirmar', subtitle: 'Valida esta condicion antes de aplicar.' },
    property.parkingSpots
      ? { icon: Car, title: `${property.parkingSpots} parqueadero${property.parkingSpots > 1 ? 's' : ''}`, subtitle: 'Movilidad diaria mas sencilla.' }
      : { icon: MapPin, title: 'Sin parqueadero registrado', subtitle: 'Revisa transporte y opciones cercanas.' },
  ];

  return (
    <PropertySection title="Lo que mas destaca">
      <div className="nido-highlight-grid">
        {highlights.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="nido-highlight-card">
              <span className="nido-highlight-card__icon">
                <Icon size={20} aria-hidden="true" />
              </span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.subtitle}</p>
              </div>
            </article>
          );
        })}
      </div>
    </PropertySection>
  );
}
