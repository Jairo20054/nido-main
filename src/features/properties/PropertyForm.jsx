import React, { useEffect, useMemo, useState } from 'react';
import { InlineMessage } from '../../components/ui/InlineMessage';
import {
  PROPERTY_DRAFT_STORAGE_KEY,
  PROPERTY_STATUS_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  RENTAL_TYPE_OPTIONS,
} from '../../lib/constants';
import { PropertyMediaManager } from './PropertyMediaManager';

// Pasos del wizard para dividir la captura de una propiedad en bloques manejables.
const STEPS = [
  { id: 'basica', label: 'Basica' },
  { id: 'ubicacion', label: 'Ubicacion' },
  { id: 'detalles', label: 'Caracteristicas' },
  { id: 'tenant', label: 'Condiciones' },
  { id: 'media', label: 'Medios' },
  { id: 'resumen', label: 'Resumen' },
];

const emptyForm = {
  title: '',
  summary: '',
  description: '',
  propertyType: 'APARTMENT',
  rentalType: 'FULL_HOME',
  status: 'DRAFT',
  city: '',
  neighborhood: '',
  addressLine: '',
  zoneReference: '',
  latitude: null,
  longitude: null,
  monthlyRent: '',
  maintenanceFee: '',
  securityDeposit: '',
  availableImmediately: false,
  availableFrom: '',
  bedrooms: 1,
  bathrooms: 1,
  areaM2: '',
  floor: '',
  parkingSpots: 0,
  strata: '',
  maxOccupants: 2,
  furnished: false,
  petsAllowed: false,
  utilitiesIncluded: false,
  minLeaseMonths: 12,
  amenities: '',
  rules: '',
  requirements: '',
  idealTenantProfile: '',
  specialConditions: '',
  contactMethod: '',
  verificationDetails: '',
  media: [],
};

// Convierte una propiedad existente al shape consumido por el formulario controlado.
const toFormState = (property) => {
  if (!property) {
    return emptyForm;
  }

  return {
    title: property.title || '',
    summary: property.summary || '',
    description: property.description || '',
    propertyType: property.propertyType || 'APARTMENT',
    rentalType: property.rentalType || 'FULL_HOME',
    status: property.status || 'DRAFT',
    city: property.city || '',
    neighborhood: property.neighborhood || '',
    addressLine: property.addressLine || '',
    zoneReference: property.zoneReference || '',
    monthlyRent: property.monthlyRent ?? '',
    latitude: property.latitude ?? null,
    longitude: property.longitude ?? null,
    maintenanceFee: property.maintenanceFee ?? '',
    securityDeposit: property.securityDeposit ?? '',
    availableImmediately: Boolean(property.availableImmediately),
    availableFrom: property.availableFrom?.slice(0, 10) || '',
    bedrooms: property.bedrooms ?? 1,
    bathrooms: property.bathrooms ?? 1,
    areaM2: property.areaM2 ?? '',
    floor: property.floor ?? '',
    parkingSpots: property.parkingSpots ?? 0,
    strata: property.strata ?? '',
    maxOccupants: property.maxOccupants ?? 2,
    furnished: Boolean(property.furnished),
    petsAllowed: Boolean(property.petsAllowed),
    utilitiesIncluded: Boolean(property.utilitiesIncluded),
    minLeaseMonths: property.minLeaseMonths ?? 12,
    amenities: (property.amenities || []).join(', '),
    rules: property.rules || '',
    requirements: property.requirements || '',
    idealTenantProfile: property.idealTenantProfile || '',
    specialConditions: property.specialConditions || '',
    contactMethod: property.contactMethod || '',
    verificationDetails: property.verificationDetails || '',
    media: property.media || [],
  };
};

// Normaliza el campo libre de amenidades hacia una lista apta para la API.
const parseAmenities = (value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

// Valida reglas de negocio del wizard antes de decidir si se guarda como borrador
// o se envia a revision/publicacion.
const validateForAction = (form, action) => {
  if (!form.title.trim()) return 'Ingresa un titulo para la vivienda';
  if (!form.city.trim()) return 'La ciudad es obligatoria';
  if (!form.addressLine.trim()) return 'La direccion es obligatoria';
  if (!form.monthlyRent) return 'El canon mensual es obligatorio';
  if (!form.description.trim() || form.description.trim().length < 80) {
    return 'La descripcion debe explicar bien la vivienda';
  }

  const imageCount = form.media.filter((item) => item.type === 'IMAGE').length;

  if (action !== 'draft' && imageCount < 4) {
    return 'Debes subir minimo 4 fotos antes de enviar o publicar';
  }

  if (!form.availableImmediately && !form.availableFrom) {
    return 'Indica si la vivienda esta disponible de inmediato o desde una fecha';
  }

  return '';
};

// Ajusta tipos y valores derivados para que el backend reciba un payload consistente.
const normalizePayload = (form, targetStatus) => ({
  ...form,
  status: targetStatus,
  monthlyRent: Number(form.monthlyRent),
  maintenanceFee: Number(form.maintenanceFee || 0),
  securityDeposit: Number(form.securityDeposit || 0),
  bedrooms: Number(form.bedrooms),
  bathrooms: Number(form.bathrooms),
  areaM2: Number(form.areaM2),
  floor: form.floor === '' ? null : Number(form.floor),
  parkingSpots: Number(form.parkingSpots || 0),
  strata: form.strata === '' ? null : Number(form.strata),
  maxOccupants: Number(form.maxOccupants),
  minLeaseMonths: Number(form.minLeaseMonths),
  availableFrom: form.availableImmediately ? null : form.availableFrom,
  amenities: parseAmenities(form.amenities),
});

/**
 * Componente de uso para crear o editar propiedades.
 * Reutiliza el mismo wizard en gestion y administracion para mantener una sola
 * fuente de verdad en validaciones, borradores locales y normalizacion del payload.
 */
export function PropertyForm({ property, submitting, onCancel, onSubmit, canPublishDirectly = false }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [savedDraftMessage, setSavedDraftMessage] = useState('');

  useEffect(() => {
    // En modo creacion se intenta recuperar el borrador local para evitar perdida
    // de informacion si el usuario cierra la pestana durante la captura.
    if (property) {
      setForm(toFormState(property));
      setSavedDraftMessage('');
      return;
    }

    const stored = localStorage.getItem(PROPERTY_DRAFT_STORAGE_KEY);
    if (stored) {
      try {
        setForm({ ...emptyForm, ...JSON.parse(stored) });
      } catch (_error) {
        setForm(emptyForm);
      }
    } else {
      setForm(emptyForm);
    }
  }, [property]);

  useEffect(() => {
    if (property) {
      return;
    }

    // El guardado local es oportunista: no bloquea la UI y solo aplica a nuevas publicaciones.
    localStorage.setItem(PROPERTY_DRAFT_STORAGE_KEY, JSON.stringify(form));
    setSavedDraftMessage('Borrador local guardado automaticamente');
  }, [form, property]);

  const title = useMemo(
    () => (property ? 'Editar publicacion' : 'Publicar vivienda paso a paso'),
    [property]
  );

  const summaryCards = useMemo(
    () => [
      { label: 'Tipo', value: PROPERTY_TYPE_OPTIONS.find((item) => item.value === form.propertyType)?.label },
      { label: 'Arriendo', value: RENTAL_TYPE_OPTIONS.find((item) => item.value === form.rentalType)?.label },
      { label: 'Ciudad', value: form.city || 'Sin definir' },
      { label: 'Canon', value: form.monthlyRent ? `$${Number(form.monthlyRent).toLocaleString('es-CO')}` : 'Sin definir' },
      { label: 'Fotos', value: String(form.media.filter((item) => item.type === 'IMAGE').length) },
      { label: 'Video', value: form.media.some((item) => item.type === 'VIDEO') ? 'Si' : 'No' },
    ],
    [form]
  );

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  // Centraliza la salida del wizard para que todas las acciones pasen por la misma validacion.
  const handleSubmit = async (targetStatus) => {
    const nextError = validateForAction(form, targetStatus === 'DRAFT' ? 'draft' : 'review');

    if (nextError) {
      setError(nextError);
      return;
    }

    setError('');
    await onSubmit(normalizePayload(form, targetStatus));

    if (!property && targetStatus === 'DRAFT') {
      localStorage.setItem(PROPERTY_DRAFT_STORAGE_KEY, JSON.stringify(form));
    }

    if (!property && targetStatus !== 'DRAFT') {
      localStorage.removeItem(PROPERTY_DRAFT_STORAGE_KEY);
    }
  };

  return (
    <div className="property-form-wizard">
      <div className="form-card">
        <div className="form-card__header">
          <h3>{title}</h3>
          <p>Un flujo claro para que el arrendador publique con informacion util y ordenada.</p>
        </div>

        <div className="stepper">
          {STEPS.map((step, index) => (
            <button
              key={step.id}
              className={`stepper__item ${index === stepIndex ? 'stepper__item--active' : ''} ${index < stepIndex ? 'stepper__item--done' : ''}`}
              type="button"
              onClick={() => setStepIndex(index)}
            >
              <span>{index + 1}</span>
              <strong>{step.label}</strong>
            </button>
          ))}
        </div>

        <InlineMessage tone="danger">{error}</InlineMessage>
        <InlineMessage tone="success">{savedDraftMessage}</InlineMessage>

        {stepIndex === 0 ? (
          <div className="form-step">
            <div className="field-group">
              <label htmlFor="title">Titulo de la propiedad</label>
              <input id="title" value={form.title} onChange={(event) => setField('title', event.target.value)} placeholder="Ej. Apartamento iluminado cerca a la 93" />
            </div>
            <div className="field-grid">
              <div className="field-group">
                <label htmlFor="propertyType">Tipo de inmueble</label>
                <select id="propertyType" value={form.propertyType} onChange={(event) => setField('propertyType', event.target.value)}>
                  {PROPERTY_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field-group">
                <label htmlFor="rentalType">Tipo de arriendo</label>
                <select id="rentalType" value={form.rentalType} onChange={(event) => setField('rentalType', event.target.value)}>
                  {RENTAL_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field-group">
              <label htmlFor="summary">Resumen corto</label>
              <textarea id="summary" rows="3" value={form.summary} onChange={(event) => setField('summary', event.target.value)} placeholder="Resume lo mas atractivo del inmueble en una frase clara." />
            </div>
            <div className="field-group">
              <label htmlFor="description">Descripcion general</label>
              <textarea id="description" rows="6" value={form.description} onChange={(event) => setField('description', event.target.value)} placeholder="Describe distribucion, ambiente, acabados y beneficios de vivir alli." />
            </div>
            <div className="field-grid field-grid--triple">
              <div className="field-group">
                <label htmlFor="monthlyRent">Canon mensual</label>
                <input id="monthlyRent" type="number" value={form.monthlyRent} onChange={(event) => setField('monthlyRent', event.target.value)} />
              </div>
              <div className="field-group">
                <label htmlFor="securityDeposit">Deposito</label>
                <input id="securityDeposit" type="number" value={form.securityDeposit} onChange={(event) => setField('securityDeposit', event.target.value)} />
              </div>
              <div className="field-group">
                <label htmlFor="maintenanceFee">Administracion</label>
                <input id="maintenanceFee" type="number" value={form.maintenanceFee} onChange={(event) => setField('maintenanceFee', event.target.value)} />
              </div>
            </div>
            <div className="field-grid">
              <label className="checkbox">
                <input type="checkbox" checked={form.availableImmediately} onChange={(event) => setField('availableImmediately', event.target.checked)} />
                Disponible de inmediato
              </label>
              <div className="field-group">
                <label htmlFor="availableFrom">Fecha disponible</label>
                <input id="availableFrom" type="date" disabled={form.availableImmediately} value={form.availableFrom} onChange={(event) => setField('availableFrom', event.target.value)} />
              </div>
            </div>
          </div>
        ) : null}

        {stepIndex === 1 ? (
          <div className="form-step">
            <div className="field-grid">
              <div className="field-group">
                <label htmlFor="city">Ciudad o municipio</label>
                <input id="city" value={form.city} onChange={(event) => setField('city', event.target.value)} placeholder="Bogota" />
              </div>
              <div className="field-group">
                <label htmlFor="neighborhood">Barrio</label>
                <input id="neighborhood" value={form.neighborhood} onChange={(event) => setField('neighborhood', event.target.value)} placeholder="Chico Norte" />
              </div>
            </div>
            <div className="field-group">
              <label htmlFor="addressLine">Direccion</label>
              <input id="addressLine" value={form.addressLine} onChange={(event) => setField('addressLine', event.target.value)} placeholder="Calle 100 # 10 - 20" />
            </div>
            <div className="field-group">
              <label htmlFor="zoneReference">Referencia de la zona</label>
              <textarea id="zoneReference" rows="4" value={form.zoneReference} onChange={(event) => setField('zoneReference', event.target.value)} placeholder="Cerca a parques, transporte, vias principales o comercio." />
            </div>
            <div className="field-grid">
              <div className="field-group">
                <label htmlFor="latitude">Latitud</label>
                <input id="latitude" type="number" value={form.latitude || ''} onChange={(event) => setField('latitude', event.target.value === '' ? null : Number(event.target.value))} />
              </div>
              <div className="field-group">
                <label htmlFor="longitude">Longitud</label>
                <input id="longitude" type="number" value={form.longitude || ''} onChange={(event) => setField('longitude', event.target.value === '' ? null : Number(event.target.value))} />
              </div>
            </div>
          </div>
        ) : null}

        {stepIndex === 2 ? (
          <div className="form-step">
            <div className="field-grid field-grid--triple">
              <div className="field-group">
                <label htmlFor="bedrooms">Habitaciones</label>
                <input id="bedrooms" type="number" value={form.bedrooms} onChange={(event) => setField('bedrooms', event.target.value)} />
              </div>
              <div className="field-group">
                <label htmlFor="bathrooms">Banos</label>
                <input id="bathrooms" type="number" value={form.bathrooms} onChange={(event) => setField('bathrooms', event.target.value)} />
              </div>
              <div className="field-group">
                <label htmlFor="areaM2">Area en m2</label>
                <input id="areaM2" type="number" value={form.areaM2} onChange={(event) => setField('areaM2', event.target.value)} />
              </div>
            </div>
            <div className="field-grid field-grid--quad">
              <div className="field-group">
                <label htmlFor="floor">Piso</label>
                <input id="floor" type="number" value={form.floor} onChange={(event) => setField('floor', event.target.value)} />
              </div>
              <div className="field-group">
                <label htmlFor="parkingSpots">Parqueaderos</label>
                <input id="parkingSpots" type="number" value={form.parkingSpots} onChange={(event) => setField('parkingSpots', event.target.value)} />
              </div>
              <div className="field-group">
                <label htmlFor="strata">Estrato</label>
                <input id="strata" type="number" value={form.strata} onChange={(event) => setField('strata', event.target.value)} />
              </div>
              <div className="field-group">
                <label htmlFor="maxOccupants">Maximo ocupantes</label>
                <input id="maxOccupants" type="number" value={form.maxOccupants} onChange={(event) => setField('maxOccupants', event.target.value)} />
              </div>
            </div>
            <div className="field-grid">
              <label className="checkbox">
                <input type="checkbox" checked={form.furnished} onChange={(event) => setField('furnished', event.target.checked)} />
                Amoblado
              </label>
              <label className="checkbox">
                <input type="checkbox" checked={form.petsAllowed} onChange={(event) => setField('petsAllowed', event.target.checked)} />
                Mascotas permitidas
              </label>
              <label className="checkbox">
                <input type="checkbox" checked={form.utilitiesIncluded} onChange={(event) => setField('utilitiesIncluded', event.target.checked)} />
                Servicios incluidos
              </label>
            </div>
            <div className="field-grid">
              <div className="field-group">
                <label htmlFor="minLeaseMonths">Minimo de meses</label>
                <input id="minLeaseMonths" type="number" value={form.minLeaseMonths} onChange={(event) => setField('minLeaseMonths', event.target.value)} />
              </div>
              <div className="field-group">
                <label htmlFor="amenities">Caracteristicas adicionales</label>
                <input id="amenities" value={form.amenities} onChange={(event) => setField('amenities', event.target.value)} placeholder="Balcon, estudio, porteria, gimnasio" />
              </div>
            </div>
          </div>
        ) : null}

        {stepIndex === 3 ? (
          <div className="form-step">
            <div className="field-group">
              <label htmlFor="rules">Normas de la vivienda</label>
              <textarea id="rules" rows="4" value={form.rules} onChange={(event) => setField('rules', event.target.value)} placeholder="Ej. no fiestas, horarios, condiciones para mascotas." />
            </div>
            <div className="field-group">
              <label htmlFor="requirements">Requisitos para arrendar</label>
              <textarea id="requirements" rows="4" value={form.requirements} onChange={(event) => setField('requirements', event.target.value)} placeholder="Documentos, ingresos, codeudor o poliza." />
            </div>
            <div className="field-group">
              <label htmlFor="idealTenantProfile">Perfil buscado</label>
              <textarea id="idealTenantProfile" rows="3" value={form.idealTenantProfile} onChange={(event) => setField('idealTenantProfile', event.target.value)} />
            </div>
            <div className="field-group">
              <label htmlFor="specialConditions">Condiciones especiales</label>
              <textarea id="specialConditions" rows="3" value={form.specialConditions} onChange={(event) => setField('specialConditions', event.target.value)} />
            </div>
            <div className="field-grid">
              <div className="field-group">
                <label htmlFor="contactMethod">Metodo de contacto</label>
                <input id="contactMethod" value={form.contactMethod} onChange={(event) => setField('contactMethod', event.target.value)} placeholder="WhatsApp, formulario o llamada" />
              </div>
              <div className="field-group">
                <label htmlFor="verificationDetails">Datos de verificacion</label>
                <input id="verificationDetails" value={form.verificationDetails} onChange={(event) => setField('verificationDetails', event.target.value)} placeholder="Reglamento, documentos, validaciones" />
              </div>
            </div>
          </div>
        ) : null}

        {stepIndex === 4 ? <PropertyMediaManager media={form.media} onChange={(value) => setField('media', value)} /> : null}

        {stepIndex === 5 ? (
          <div className="form-step">
            <div className="summary-grid">
              {summaryCards.map((item) => (
                <div key={item.label} className="summary-card">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
            <div className="content-card content-card--compact">
              <h3>Estado objetivo</h3>
              <p>El arrendador puede guardar borrador o enviar a revision. El administrador puede publicar directamente.</p>
              <div className="status-option-row">
                {PROPERTY_STATUS_OPTIONS.filter((item) => ['DRAFT', 'PENDING', 'PUBLISHED'].includes(item.value)).map((option) => (
                  <span key={option.value} className={`status-pill ${form.status === option.value ? 'status-pill--active' : ''}`}>
                    {option.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <div className="form-card__actions">
          <div className="form-card__actions-left">
            {stepIndex > 0 ? (
              <button className="button button--secondary" type="button" onClick={() => setStepIndex((current) => current - 1)}>
                Anterior
              </button>
            ) : null}
            {stepIndex < STEPS.length - 1 ? (
              <button className="button" type="button" onClick={() => setStepIndex((current) => current + 1)}>
                Siguiente
              </button>
            ) : null}
          </div>

          <div className="form-card__actions-right">
            <button className="button button--secondary" type="button" disabled={submitting} onClick={() => handleSubmit('DRAFT')}>
              Guardar borrador
            </button>
            <button className="button" type="button" disabled={submitting} onClick={() => handleSubmit(canPublishDirectly ? 'PUBLISHED' : 'PENDING')}>
              {submitting ? 'Guardando...' : canPublishDirectly ? 'Publicar ahora' : 'Enviar a revision'}
            </button>
            {onCancel ? (
              <button className="button button--ghost-danger" type="button" onClick={onCancel}>
                Cancelar
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
