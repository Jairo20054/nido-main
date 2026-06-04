import { DollarSign, MapPin } from 'lucide-react';
import PropertySection from './PropertySection';
import { getApproximateAddress, getCurrency, getMonthlyTotal, isPresent } from './propertyDisplayUtils';
import { formatCurrency } from '../../lib/formatters';

function DetailRow({ label, value, strong = false }) {
  if (!isPresent(value)) return null;

  return (
    <div className={strong ? 'nido-detail-row nido-detail-row--total' : 'nido-detail-row'}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function PropertyPracticalDetails({ property }) {
  const monthlyTotal = getMonthlyTotal(property);

  return (
    <PropertySection title="Detalles practicos">
      <div className="nido-practical-grid">
        <article className="nido-info-card">
          <header>
            <DollarSign size={18} />
            <h3>Costos mensuales</h3>
          </header>
          <DetailRow label="Canon mensual" value={getCurrency(property.monthlyRent)} />
          <DetailRow
            label="Administracion"
            value={property.administrationIncluded ? 'Incluida en el canon' : getCurrency(property.maintenanceFee)}
          />
          <DetailRow label="Deposito" value={property.depositRequired ? getCurrency(property.securityDeposit) : 'Por confirmar'} />
          <DetailRow label="Total estimado" value={monthlyTotal ? formatCurrency(monthlyTotal) : 'Precio no disponible'} strong />
        </article>

        <article className="nido-info-card">
          <header>
            <MapPin size={18} />
            <h3>Ubicacion</h3>
          </header>
          <DetailRow label="Departamento" value={property.department} />
          <DetailRow label="Ciudad" value={property.city} />
          <DetailRow label="Barrio" value={property.neighborhood} />
          <DetailRow label="Zona" value={getApproximateAddress(property)} />
        </article>
      </div>
    </PropertySection>
  );
}
