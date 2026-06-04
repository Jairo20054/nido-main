import { CalendarDays, CheckCircle2, FileText, GraduationCap, PawPrint, Users, XCircle } from 'lucide-react';
import PropertySection from './PropertySection';
import { formatCurrency } from '../../lib/formatters';
import {
  formatBoolean,
  getAvailabilityLabel,
  getCurrency,
  getUniqueList,
  isPresent,
  splitListText,
} from './propertyDisplayUtils';

function ConditionRow({ icon: Icon, label, value, yes }) {
  if (!isPresent(value)) return null;

  const tone = yes === undefined ? '' : yes ? 'nido-condition-row--yes' : 'nido-condition-row--no';

  return (
    <div className={`nido-condition-row ${tone}`.trim()}>
      {Icon ? <Icon size={16} aria-hidden="true" /> : null}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function PropertyRentalConditions({ property }) {
  const documents = getUniqueList([
    ...splitListText(property.requirements),
    property.requiresRentalStudy ? 'Estudio de arriendo' : '',
    'Documento de identidad',
    property.requiresRentalStudy ? 'Soporte de ingresos' : '',
  ]);
  const services = property.servicesIncluded?.length ? property.servicesIncluded.join(', ') : 'Servicios por confirmar';

  return (
    <PropertySection title="Condiciones de arriendo">
      <div className="nido-conditions-grid">
        <article className="nido-info-card">
          <header>
            <FileText size={18} />
            <h3>Contrato</h3>
          </header>
          <ConditionRow label="Minimo" value={property.minLeaseMonths ? `${property.minLeaseMonths} meses` : 'Por confirmar'} />
          <ConditionRow label="Disponible" value={getAvailabilityLabel(property)} />
          <ConditionRow label="Codeudor" value={property.acceptsCosigner ? 'Acepta' : 'Por confirmar'} />
        </article>

        <article className="nido-info-card">
          <header>
            <Users size={18} />
            <h3>Reglas de convivencia</h3>
          </header>
          <ConditionRow icon={PawPrint} label="Mascotas" value={formatBoolean(property.petsAllowed)} yes={property.petsAllowed} />
          <ConditionRow icon={GraduationCap} label="Estudiantes" value={formatBoolean(property.acceptsStudents)} yes={property.acceptsStudents} />
          <ConditionRow icon={Users} label="Familias" value={formatBoolean(property.acceptsFamilies)} yes={property.acceptsFamilies} />
        </article>
      </div>

      <article className="nido-info-card nido-payment-card">
        <header>
          <CalendarDays size={18} />
          <h3>Pagos y servicios incluidos</h3>
        </header>
        <p>
          Deposito {property.depositRequired ? getCurrency(property.securityDeposit) : 'por confirmar'} · Admin{' '}
          {property.administrationIncluded ? 'incluida' : getCurrency(property.maintenanceFee)} · Incluye: {services} · Contrato minimo de{' '}
          {property.minLeaseMonths || 'N/A'} meses
        </p>
      </article>

      {documents.length ? (
        <div className="nido-document-chips" aria-label="Documentos requeridos">
          {documents.map((document) => (
            <span key={document} className="nido-document-chip">
              {document.toLowerCase().includes('estudio') ? <CheckCircle2 size={14} /> : <FileText size={14} />}
              {document}
            </span>
          ))}
        </div>
      ) : null}
    </PropertySection>
  );
}
