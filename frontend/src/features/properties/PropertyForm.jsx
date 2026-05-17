import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Save, Send } from 'lucide-react';
import { useAuth } from '../../app/providers/useAuth';
import { InlineMessage } from '../../components/ui/InlineMessage';
import {
  PROPERTY_DRAFT_STORAGE_KEY,
  PROPERTY_STATUS_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  RENTAL_TYPE_OPTIONS,
} from '../../lib/constants';
import { PropertyMediaManager } from './PropertyMediaManager';
import {
  MIN_IMAGE_COUNT_TO_PUBLISH,
  normalizeExistingMediaItem,
  sanitizeMediaForSubmission,
} from './propertyMediaService';

const STEPS = [
  { id: 'basica', label: 'Información básica' },
  { id: 'ubicacion', label: 'Ubicación' },
  { id: 'precio', label: 'Precio y condiciones' },
  { id: 'detalles', label: 'Características' },
  { id: 'media', label: 'Imágenes y video' },
  { id: 'responsable', label: 'Responsable y reglas' },
  { id: 'resumen', label: 'Vista previa' },
];

const SERVICES_OPTIONS = [
  'Agua',
  'Energía',
  'Gas',
  'Internet',
  'Televisión',
  'Aseo',
];

const FEATURE_OPTIONS = [
  { field: 'balcony', label: 'Balcón' },
  { field: 'equippedKitchen', label: 'Cocina integral' },
  { field: 'laundryArea', label: 'Zona de ropas' },
  { field: 'elevator', label: 'Ascensor' },
  { field: 'doorman', label: 'Portería' },
  { field: 'security', label: 'Seguridad' },
  { field: 'commonAreas', label: 'Zonas comunes' },
];

const CONTACT_RELATIONSHIP_OPTIONS = [
  { value: 'OWNER', label: 'Propietario' },
  { value: 'ADMINISTRATOR', label: 'Administrador' },
  { value: 'REAL_ESTATE', label: 'Inmobiliaria' },
  { value: 'ATTORNEY', label: 'Apoderado' },
  { value: 'OTHER', label: 'Otro responsable' },
];

const CONTACT_PREFERENCE_OPTIONS = [
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'PHONE', label: 'Llamada' },
  { value: 'EMAIL', label: 'Correo electrónico' },
];

const RULE_PREFERENCE_OPTIONS = [
  { field: 'acceptsStudents', label: 'Acepta estudiantes' },
  { field: 'acceptsFamilies', label: 'Acepta familias' },
  { field: 'acceptsCosigner', label: 'Acepta codeudor' },
  { field: 'requiresRentalStudy', label: 'Requiere estudio de arrendamiento' },
  { field: 'visitsAllowed', label: 'Permite visitas' },
];

const UNSAFE_TEXT_PATTERN = /<\s*\/?\s*[a-z][^>]*>|javascript:|data:text\/html/i;
const PHONE_PATTERN = /^\+?[0-9\s().-]{7,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emptyForm = {
  title: '',
  summary: '',
  description: '',
  propertyType: 'APARTMENT',
  rentalType: 'FULL_HOME',
  status: 'DRAFT',
  city: '',
  department: '',
  neighborhood: '',
  addressLine: '',
  addressDetail: '',
  hideExactAddress: true,
  zoneReference: '',
  latitude: null,
  longitude: null,
  monthlyRent: '',
  administrationIncluded: false,
  maintenanceFee: '',
  depositRequired: false,
  securityDeposit: '',
  servicesIncluded: [],
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
  balcony: false,
  equippedKitchen: false,
  laundryArea: false,
  elevator: false,
  doorman: false,
  security: false,
  commonAreas: false,
  minLeaseMonths: 12,
  amenities: '',
  rules: '',
  requirements: '',
  idealTenantProfile: '',
  specialConditions: '',
  contactMethod: '',
  verificationDetails: '',
  contactName: '',
  contactDocumentType: '',
  contactDocumentNumber: '',
  contactPhone: '',
  contactWhatsapp: '',
  contactEmail: '',
  contactRelationship: 'OWNER',
  contactHours: '',
  contactPreference: 'WHATSAPP',
  publishingAuthorization: false,
  acceptsStudents: false,
  acceptsFamilies: true,
  acceptsCosigner: false,
  requiresRentalStudy: true,
  visitsAllowed: true,
  visitHours: '',
  visitNotes: '',
  media: [],
};

const buildEmptyForm = (user) => ({
  ...emptyForm,
  contactName: user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
  contactEmail: user?.email || '',
  contactPhone: user?.phone || '',
  contactWhatsapp: user?.phone || '',
});

const toFormState = (property) => {
  if (!property) {
    return emptyForm;
  }

  return {
    ...emptyForm,
    title: property.title || '',
    summary: property.summary || '',
    description: property.description || '',
    propertyType: property.propertyType || 'APARTMENT',
    rentalType: property.rentalType || 'FULL_HOME',
    status: property.status || 'DRAFT',
    city: property.city || '',
    department: property.department || '',
    neighborhood: property.neighborhood || '',
    addressLine: property.addressLine || '',
    addressDetail: property.addressDetail || '',
    hideExactAddress: property.hideExactAddress ?? true,
    zoneReference: property.zoneReference || '',
    monthlyRent: property.monthlyRent ?? '',
    latitude: property.latitude ?? null,
    longitude: property.longitude ?? null,
    administrationIncluded: Boolean(property.administrationIncluded),
    maintenanceFee: property.maintenanceFee ?? '',
    depositRequired: Boolean(property.depositRequired),
    securityDeposit: property.securityDeposit ?? '',
    servicesIncluded: property.servicesIncluded || [],
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
    balcony: Boolean(property.balcony),
    equippedKitchen: Boolean(property.equippedKitchen),
    laundryArea: Boolean(property.laundryArea),
    elevator: Boolean(property.elevator),
    doorman: Boolean(property.doorman),
    security: Boolean(property.security),
    commonAreas: Boolean(property.commonAreas),
    minLeaseMonths: property.minLeaseMonths ?? 12,
    amenities: (property.amenities || []).join(', '),
    rules: property.rules || '',
    requirements: property.requirements || '',
    idealTenantProfile: property.idealTenantProfile || '',
    specialConditions: property.specialConditions || '',
    contactMethod: property.contactMethod || '',
    verificationDetails: property.verificationDetails || '',
    contactName: property.contactName || '',
    contactDocumentType: property.contactDocumentType || '',
    contactDocumentNumber: property.contactDocumentNumber || '',
    contactPhone: property.contactPhone || '',
    contactWhatsapp: property.contactWhatsapp || '',
    contactEmail: property.contactEmail || '',
    contactRelationship: property.contactRelationship || 'OWNER',
    contactHours: property.contactHours || '',
    contactPreference: property.contactPreference || 'WHATSAPP',
    publishingAuthorization: Boolean(property.publishingAuthorization),
    acceptsStudents: Boolean(property.acceptsStudents),
    acceptsFamilies: property.acceptsFamilies ?? true,
    acceptsCosigner: Boolean(property.acceptsCosigner),
    requiresRentalStudy: property.requiresRentalStudy ?? true,
    visitsAllowed: property.visitsAllowed ?? true,
    visitHours: property.visitHours || '',
    visitNotes: property.visitNotes || '',
    media: (property.media || []).map(normalizeExistingMediaItem),
  };
};

const serializeDraftForm = (form) =>
  JSON.stringify({
    ...form,
    media: form.media
      .filter((item) => item.uploadStatus !== 'uploading' && item.uploadStatus !== 'error')
      .map(({ sourceFile: _sourceFile, ...item }, index) => ({
        ...item,
        position: index,
        uploadStatus: 'uploaded',
        isPersisted: true,
      })),
  });

const parseList = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const hasUnsafeText = (form) =>
  Object.entries(form).some(([key, value]) => {
    if (key === 'media') return false;
    return typeof value === 'string' && UNSAFE_TEXT_PATTERN.test(value);
  });

const validateForAction = (form, action) => {
  if (hasUnsafeText(form)) {
    return 'No incluyas HTML, scripts ni enlaces potencialmente inseguros en la publicación.';
  }

  if (!form.title.trim()) return 'Ingresa un título claro para la propiedad.';
  if (!form.propertyType) return 'Selecciona el tipo de propiedad.';
  if (!form.summary.trim() || form.summary.trim().length < 20) {
    return 'Agrega una descripción corta de al menos 20 caracteres.';
  }
  if (!form.description.trim() || form.description.trim().length < 80) {
    return 'La descripción completa debe tener al menos 80 caracteres.';
  }
  if (!form.city.trim()) return 'La ciudad es obligatoria.';
  if (!form.addressLine.trim()) return 'La dirección es obligatoria.';
  if (!form.monthlyRent || Number(form.monthlyRent) <= 0) {
    return 'Ingresa un valor mensual de arriendo mayor que cero.';
  }
  if (!form.areaM2 || Number(form.areaM2) <= 0) {
    return 'Ingresa el área aproximada de la vivienda.';
  }
  if (!form.availableImmediately && !form.availableFrom) {
    return 'Indica si la vivienda está disponible de inmediato o desde una fecha.';
  }

  if (form.media.some((item) => item.uploadStatus === 'uploading')) {
    return 'Espera a que terminen de cargarse los archivos antes de guardar.';
  }

  if (form.media.some((item) => item.uploadStatus === 'error')) {
    return 'Corrige o elimina los archivos con error antes de continuar.';
  }

  const imageCount = form.media.filter((item) => item.type === 'IMAGE').length;

  if (action !== 'draft' && imageCount < MIN_IMAGE_COUNT_TO_PUBLISH) {
    return `Agrega mínimo ${MIN_IMAGE_COUNT_TO_PUBLISH} imágenes antes de enviar la propiedad a revisión.`;
  }

  if (action !== 'draft') {
    if (!form.contactName.trim()) {
      return 'Completa el nombre del propietario o responsable.';
    }

    if (form.contactPhone && !PHONE_PATTERN.test(form.contactPhone)) {
      return 'Ingresa un teléfono de contacto válido.';
    }

    if (form.contactWhatsapp && !PHONE_PATTERN.test(form.contactWhatsapp)) {
      return 'Ingresa un WhatsApp válido.';
    }

    if (form.contactEmail && !EMAIL_PATTERN.test(form.contactEmail)) {
      return 'Ingresa un correo electrónico de contacto válido.';
    }

    if (!form.contactPhone && !form.contactEmail) {
      return 'Agrega al menos un teléfono o correo electrónico de contacto.';
    }

    if (!form.publishingAuthorization) {
      return 'Confirma que tienes autorización para publicar esta propiedad.';
    }
  }

  return '';
};

const normalizeNumber = (value, fallback = 0) => (value === '' || value === null ? fallback : Number(value));

const normalizePayload = (form, targetStatus) => ({
  ...form,
  status: targetStatus,
  monthlyRent: Number(form.monthlyRent),
  maintenanceFee: form.administrationIncluded ? 0 : normalizeNumber(form.maintenanceFee, 0),
  securityDeposit: form.depositRequired ? normalizeNumber(form.securityDeposit, 0) : 0,
  bedrooms: Number(form.bedrooms),
  bathrooms: Number(form.bathrooms),
  areaM2: Number(form.areaM2),
  floor: form.floor === '' ? null : Number(form.floor),
  parkingSpots: Number(form.parkingSpots || 0),
  strata: form.strata === '' ? null : Number(form.strata),
  maxOccupants: Number(form.maxOccupants),
  minLeaseMonths: Number(form.minLeaseMonths),
  availableFrom: form.availableImmediately ? null : form.availableFrom,
  amenities: parseList(form.amenities),
  media: sanitizeMediaForSubmission(form.media),
});

export function PropertyForm({ property, submitting, onCancel, onSubmit, canPublishDirectly = false }) {
  const { user } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [savedDraftMessage, setSavedDraftMessage] = useState('');

  useEffect(() => {
    if (property) {
      setForm(toFormState(property));
      setSavedDraftMessage('');
      return;
    }

    const stored = localStorage.getItem(PROPERTY_DRAFT_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setForm({
          ...buildEmptyForm(user),
          ...parsed,
          media: (parsed.media || []).map(normalizeExistingMediaItem),
        });
      } catch (_error) {
        setForm(buildEmptyForm(user));
      }
    } else {
      setForm(buildEmptyForm(user));
    }
  }, [property, user]);

  useEffect(() => {
    if (property) {
      return;
    }

    localStorage.setItem(PROPERTY_DRAFT_STORAGE_KEY, serializeDraftForm(form));
    setSavedDraftMessage('Borrador local guardado automáticamente.');
  }, [form, property]);

  const title = useMemo(
    () => (property ? 'Editar propiedad' : 'Publicar propiedad'),
    [property]
  );

  const imageCount = form.media.filter((item) => item.type === 'IMAGE').length;
  const hasPendingUploads = form.media.some((item) => item.uploadStatus === 'uploading');
  const currentStep = STEPS[stepIndex];

  const summaryCards = useMemo(
    () => [
      { label: 'Tipo', value: PROPERTY_TYPE_OPTIONS.find((item) => item.value === form.propertyType)?.label },
      { label: 'Operación', value: 'Arriendo' },
      { label: 'Ciudad', value: form.city || 'Sin definir' },
      { label: 'Valor mensual', value: form.monthlyRent ? `$${Number(form.monthlyRent).toLocaleString('es-CO')}` : 'Sin definir' },
      { label: 'Imágenes', value: String(imageCount) },
      { label: 'Responsable', value: form.contactName || 'Sin definir' },
    ],
    [form, imageCount]
  );

  const completionChecks = useMemo(
    () => [
      { label: 'Información básica completa', done: Boolean(form.title && form.summary && form.description) },
      { label: 'Ubicación registrada', done: Boolean(form.city && form.addressLine) },
      { label: 'Precio y disponibilidad definidos', done: Boolean(form.monthlyRent && (form.availableImmediately || form.availableFrom)) },
      { label: `Mínimo ${MIN_IMAGE_COUNT_TO_PUBLISH} imágenes cargadas`, done: imageCount >= MIN_IMAGE_COUNT_TO_PUBLISH },
      { label: 'Responsable de contacto validado', done: Boolean(form.contactName && (form.contactPhone || form.contactEmail)) },
      { label: 'Autorización de publicación confirmada', done: Boolean(form.publishingAuthorization) },
    ],
    [form, imageCount]
  );

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const toggleBoolean = (field) => setField(field, !form[field]);
  const toggleListValue = (field, value) =>
    setForm((current) => {
      const currentValues = current[field] || [];
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];
      return { ...current, [field]: nextValues };
    });

  const handleSubmit = async (targetStatus) => {
    const nextError = validateForAction(form, targetStatus === 'DRAFT' ? 'draft' : 'review');

    if (nextError) {
      setError(nextError);
      return;
    }

    try {
      setError('');
      await onSubmit(normalizePayload(form, targetStatus));

      if (!property && targetStatus === 'DRAFT') {
        localStorage.setItem(PROPERTY_DRAFT_STORAGE_KEY, serializeDraftForm(form));
      }

      if (!property && targetStatus !== 'DRAFT') {
        localStorage.removeItem(PROPERTY_DRAFT_STORAGE_KEY);
      }
    } catch (requestError) {
      setError(requestError.message || 'No pudimos guardar la propiedad. Revisa la información e inténtalo nuevamente.');
    }
  };

  return (
    <div className="property-form-wizard">
      <div className="form-card property-form-wizard__card">
        <div className="form-card__header">
          <span className="section__eyebrow">Panel arrendador</span>
          <h2>{title}</h2>
          <p>
            Completa la información por secciones. Podrás guardar un borrador o enviar la propiedad
            para revisión antes de que esté visible en NIDO.
          </p>
        </div>

        <div className="form-progress">
          <span>Paso {stepIndex + 1} de {STEPS.length}</span>
          <strong>{currentStep.label}</strong>
        </div>

        <div className="stepper">
          {STEPS.map((step, index) => (
            <button
              key={step.id}
              className={`stepper__item ${index === stepIndex ? 'stepper__item--active' : ''} ${index < stepIndex ? 'stepper__item--done' : ''}`}
              type="button"
              onClick={() => setStepIndex(index)}
            >
              <span>{index < stepIndex ? <CheckCircle2 size={16} /> : index + 1}</span>
              <strong>{step.label}</strong>
            </button>
          ))}
        </div>

        <InlineMessage tone="danger">{error}</InlineMessage>
        <InlineMessage tone="success">{savedDraftMessage}</InlineMessage>

        {stepIndex === 0 ? (
          <div className="form-step">
            <div className="field-group">
              <label htmlFor="title">Título de la propiedad</label>
              <input id="title" value={form.title} onChange={(event) => setField('title', event.target.value)} placeholder="Ej. Apartamento iluminado cerca de la 93" />
            </div>
            <div className="field-grid">
              <div className="field-group">
                <label htmlFor="propertyType">Tipo de propiedad</label>
                <select id="propertyType" value={form.propertyType} onChange={(event) => setField('propertyType', event.target.value)}>
                  {PROPERTY_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field-group">
                <label htmlFor="rentalType">Modalidad de arriendo</label>
                <select id="rentalType" value={form.rentalType} onChange={(event) => setField('rentalType', event.target.value)}>
                  {RENTAL_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field-grid">
              <div className="field-group">
                <label htmlFor="operationType">Tipo de operación</label>
                <input id="operationType" value="Arriendo" disabled />
              </div>
              <div className="field-group">
                <label htmlFor="maxOccupants">Capacidad sugerida</label>
                <input id="maxOccupants" type="number" min="1" value={form.maxOccupants} onChange={(event) => setField('maxOccupants', event.target.value)} />
              </div>
            </div>
            <div className="field-group">
              <label htmlFor="summary">Descripción corta</label>
              <textarea id="summary" rows="3" value={form.summary} onChange={(event) => setField('summary', event.target.value)} placeholder="Resume lo más atractivo de la propiedad en una frase clara." />
            </div>
            <div className="field-group">
              <label htmlFor="description">Descripción completa</label>
              <textarea id="description" rows="6" value={form.description} onChange={(event) => setField('description', event.target.value)} placeholder="Describe distribución, iluminación, acabados, entorno y beneficios de vivir allí." />
            </div>
          </div>
        ) : null}

        {stepIndex === 1 ? (
          <div className="form-step">
            <div className="field-grid">
              <div className="field-group">
                <label htmlFor="department">Departamento</label>
                <input id="department" value={form.department} onChange={(event) => setField('department', event.target.value)} placeholder="Cundinamarca" />
              </div>
              <div className="field-group">
                <label htmlFor="city">Ciudad o municipio</label>
                <input id="city" value={form.city} onChange={(event) => setField('city', event.target.value)} placeholder="Bogotá" />
              </div>
            </div>
            <div className="field-grid">
              <div className="field-group">
                <label htmlFor="neighborhood">Barrio o zona</label>
                <input id="neighborhood" value={form.neighborhood} onChange={(event) => setField('neighborhood', event.target.value)} placeholder="Chicó Norte" />
              </div>
              <div className="field-group">
                <label htmlFor="addressLine">Dirección</label>
                <input id="addressLine" value={form.addressLine} onChange={(event) => setField('addressLine', event.target.value)} placeholder="Calle 100 # 10 - 20" />
              </div>
            </div>
            <div className="field-grid">
              <div className="field-group">
                <label htmlFor="addressDetail">Detalle adicional de ubicación</label>
                <input id="addressDetail" value={form.addressDetail} onChange={(event) => setField('addressDetail', event.target.value)} placeholder="Torre, interior, conjunto o indicación privada" />
              </div>
              <label className="checkbox checkbox--card">
                <input type="checkbox" checked={form.hideExactAddress} onChange={() => toggleBoolean('hideExactAddress')} />
                No mostrar la dirección exacta públicamente
              </label>
            </div>
            <div className="field-group">
              <label htmlFor="zoneReference">Referencia cercana</label>
              <textarea id="zoneReference" rows="4" value={form.zoneReference} onChange={(event) => setField('zoneReference', event.target.value)} placeholder="Cerca de parques, transporte, vías principales, colegios o comercio." />
            </div>
          </div>
        ) : null}

        {stepIndex === 2 ? (
          <div className="form-step">
            <div className="field-grid field-grid--triple">
              <div className="field-group">
                <label htmlFor="monthlyRent">Valor mensual del arriendo</label>
                <input id="monthlyRent" type="number" min="0" value={form.monthlyRent} onChange={(event) => setField('monthlyRent', event.target.value)} />
              </div>
              <label className="checkbox checkbox--card">
                <input type="checkbox" checked={form.administrationIncluded} onChange={() => toggleBoolean('administrationIncluded')} />
                Administración incluida
              </label>
              <div className="field-group">
                <label htmlFor="maintenanceFee">Valor de administración</label>
                <input id="maintenanceFee" type="number" min="0" disabled={form.administrationIncluded} value={form.maintenanceFee} onChange={(event) => setField('maintenanceFee', event.target.value)} />
              </div>
            </div>
            <div className="field-grid field-grid--triple">
              <label className="checkbox checkbox--card">
                <input type="checkbox" checked={form.depositRequired} onChange={() => toggleBoolean('depositRequired')} />
                Requiere depósito
              </label>
              <div className="field-group">
                <label htmlFor="securityDeposit">Valor del depósito</label>
                <input id="securityDeposit" type="number" min="0" disabled={!form.depositRequired} value={form.securityDeposit} onChange={(event) => setField('securityDeposit', event.target.value)} />
              </div>
              <div className="field-group">
                <label htmlFor="minLeaseMonths">Duración mínima del contrato</label>
                <input id="minLeaseMonths" type="number" min="1" value={form.minLeaseMonths} onChange={(event) => setField('minLeaseMonths', event.target.value)} />
              </div>
            </div>
            <div className="field-grid">
              <label className="checkbox checkbox--card">
                <input type="checkbox" checked={form.availableImmediately} onChange={(event) => setField('availableImmediately', event.target.checked)} />
                Disponibilidad inmediata
              </label>
              <div className="field-group">
                <label htmlFor="availableFrom">Fecha disponible</label>
                <input id="availableFrom" type="date" disabled={form.availableImmediately} value={form.availableFrom} onChange={(event) => setField('availableFrom', event.target.value)} />
              </div>
            </div>
            <div className="field-group">
              <label>Servicios incluidos</label>
              <div className="choice-grid">
                {SERVICES_OPTIONS.map((service) => (
                  <label key={service} className="checkbox checkbox--compact">
                    <input type="checkbox" checked={form.servicesIncluded.includes(service)} onChange={() => toggleListValue('servicesIncluded', service)} />
                    {service}
                  </label>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {stepIndex === 3 ? (
          <div className="form-step">
            <div className="field-grid field-grid--quad">
              <div className="field-group">
                <label htmlFor="bedrooms">Habitaciones</label>
                <input id="bedrooms" type="number" min="0" value={form.bedrooms} onChange={(event) => setField('bedrooms', event.target.value)} />
              </div>
              <div className="field-group">
                <label htmlFor="bathrooms">Baños</label>
                <input id="bathrooms" type="number" min="1" value={form.bathrooms} onChange={(event) => setField('bathrooms', event.target.value)} />
              </div>
              <div className="field-group">
                <label htmlFor="areaM2">Área en m²</label>
                <input id="areaM2" type="number" min="1" value={form.areaM2} onChange={(event) => setField('areaM2', event.target.value)} />
              </div>
              <div className="field-group">
                <label htmlFor="parkingSpots">Parqueaderos</label>
                <input id="parkingSpots" type="number" min="0" value={form.parkingSpots} onChange={(event) => setField('parkingSpots', event.target.value)} />
              </div>
            </div>
            <div className="field-grid field-grid--triple">
              <div className="field-group">
                <label htmlFor="floor">Piso</label>
                <input id="floor" type="number" value={form.floor} onChange={(event) => setField('floor', event.target.value)} />
              </div>
              <div className="field-group">
                <label htmlFor="strata">Estrato</label>
                <input id="strata" type="number" min="0" max="6" value={form.strata} onChange={(event) => setField('strata', event.target.value)} />
              </div>
              <label className="checkbox checkbox--card">
                <input type="checkbox" checked={form.furnished} onChange={() => toggleBoolean('furnished')} />
                Amoblado
              </label>
            </div>
            <div className="choice-grid">
              <label className="checkbox checkbox--compact">
                <input type="checkbox" checked={form.petsAllowed} onChange={() => toggleBoolean('petsAllowed')} />
                Mascotas permitidas
              </label>
              <label className="checkbox checkbox--compact">
                <input type="checkbox" checked={form.utilitiesIncluded} onChange={() => toggleBoolean('utilitiesIncluded')} />
                Servicios incluidos en el canon
              </label>
              {FEATURE_OPTIONS.map((feature) => (
                <label key={feature.field} className="checkbox checkbox--compact">
                  <input type="checkbox" checked={form[feature.field]} onChange={() => toggleBoolean(feature.field)} />
                  {feature.label}
                </label>
              ))}
            </div>
            <div className="field-group">
              <label htmlFor="amenities">Características adicionales</label>
              <input id="amenities" value={form.amenities} onChange={(event) => setField('amenities', event.target.value)} placeholder="Estudio, gimnasio, terraza, salón social" />
              <small className="field-help">Separa cada característica con coma.</small>
            </div>
          </div>
        ) : null}

        {stepIndex === 4 ? <PropertyMediaManager media={form.media} onChange={(value) => setField('media', value)} /> : null}

        {stepIndex === 5 ? (
          <div className="form-step">
            <div className="form-section-note">
              Esta información nos ayuda a validar la publicación y facilitar el contacto con
              personas interesadas. Algunos datos pueden mantenerse privados según la configuración
              de la plataforma.
            </div>
            <div className="field-grid">
              <div className="field-group">
                <label htmlFor="contactName">Nombre completo</label>
                <input id="contactName" value={form.contactName} onChange={(event) => setField('contactName', event.target.value)} />
              </div>
              <div className="field-group">
                <label htmlFor="contactRelationship">Relación con la propiedad</label>
                <select id="contactRelationship" value={form.contactRelationship} onChange={(event) => setField('contactRelationship', event.target.value)}>
                  {CONTACT_RELATIONSHIP_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field-grid field-grid--quad">
              <div className="field-group">
                <label htmlFor="contactDocumentType">Tipo de documento</label>
                <input id="contactDocumentType" value={form.contactDocumentType} onChange={(event) => setField('contactDocumentType', event.target.value)} placeholder="CC, CE o NIT" />
              </div>
              <div className="field-group">
                <label htmlFor="contactDocumentNumber">Número de documento</label>
                <input id="contactDocumentNumber" value={form.contactDocumentNumber} onChange={(event) => setField('contactDocumentNumber', event.target.value)} />
              </div>
              <div className="field-group">
                <label htmlFor="contactPhone">Teléfono</label>
                <input id="contactPhone" value={form.contactPhone} onChange={(event) => setField('contactPhone', event.target.value)} autoComplete="tel" />
              </div>
              <div className="field-group">
                <label htmlFor="contactWhatsapp">WhatsApp</label>
                <input id="contactWhatsapp" value={form.contactWhatsapp} onChange={(event) => setField('contactWhatsapp', event.target.value)} autoComplete="tel" />
              </div>
            </div>
            <div className="field-grid field-grid--triple">
              <div className="field-group">
                <label htmlFor="contactEmail">Correo electrónico</label>
                <input id="contactEmail" type="email" value={form.contactEmail} onChange={(event) => setField('contactEmail', event.target.value)} autoComplete="email" />
              </div>
              <div className="field-group">
                <label htmlFor="contactHours">Horario de contacto</label>
                <input id="contactHours" value={form.contactHours} onChange={(event) => setField('contactHours', event.target.value)} placeholder="Lunes a viernes, 8:00 a. m. a 6:00 p. m." />
              </div>
              <div className="field-group">
                <label htmlFor="contactPreference">Preferencia de contacto</label>
                <select id="contactPreference" value={form.contactPreference} onChange={(event) => setField('contactPreference', event.target.value)}>
                  {CONTACT_PREFERENCE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <label className="checkbox checkbox--card">
              <input type="checkbox" checked={form.publishingAuthorization} onChange={() => toggleBoolean('publishingAuthorization')} />
              Confirmo que tengo autorización para publicar esta propiedad en NIDO.
            </label>

            <div className="field-group">
              <label>Reglas y preferencias</label>
              <div className="choice-grid">
                {RULE_PREFERENCE_OPTIONS.map((option) => (
                  <label key={option.field} className="checkbox checkbox--compact">
                    <input type="checkbox" checked={form[option.field]} onChange={() => toggleBoolean(option.field)} />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="field-grid">
              <div className="field-group">
                <label htmlFor="visitHours">Horarios de visita</label>
                <input id="visitHours" value={form.visitHours} onChange={(event) => setField('visitHours', event.target.value)} disabled={!form.visitsAllowed} />
              </div>
              <div className="field-group">
                <label htmlFor="contactMethod">Método de contacto visible</label>
                <input id="contactMethod" value={form.contactMethod} onChange={(event) => setField('contactMethod', event.target.value)} placeholder="WhatsApp, formulario de NIDO o llamada" />
              </div>
            </div>
            <div className="field-grid">
              <div className="field-group">
                <label htmlFor="rules">Reglas de la vivienda</label>
                <textarea id="rules" rows="4" value={form.rules} onChange={(event) => setField('rules', event.target.value)} placeholder="Ej. no fiestas, horarios, condiciones para mascotas." />
              </div>
              <div className="field-group">
                <label htmlFor="requirements">Requisitos para arrendar</label>
                <textarea id="requirements" rows="4" value={form.requirements} onChange={(event) => setField('requirements', event.target.value)} placeholder="Documentos, ingresos, codeudor, póliza o estudio de arrendamiento." />
              </div>
            </div>
            <div className="field-grid">
              <div className="field-group">
                <label htmlFor="idealTenantProfile">Perfil recomendado del arrendatario</label>
                <textarea id="idealTenantProfile" rows="3" value={form.idealTenantProfile} onChange={(event) => setField('idealTenantProfile', event.target.value)} />
              </div>
              <div className="field-group">
                <label htmlFor="specialConditions">Observaciones adicionales</label>
                <textarea id="specialConditions" rows="3" value={form.specialConditions} onChange={(event) => setField('specialConditions', event.target.value)} />
              </div>
            </div>
            <div className="field-group">
              <label htmlFor="verificationDetails">Información para validación interna</label>
              <textarea id="verificationDetails" rows="3" value={form.verificationDetails} onChange={(event) => setField('verificationDetails', event.target.value)} placeholder="Documentos, soporte de propiedad, reglamento o datos que ayuden a validar la publicación." />
            </div>
          </div>
        ) : null}

        {stepIndex === 6 ? (
          <div className="form-step">
            <div className="summary-grid">
              {summaryCards.map((item) => (
                <div key={item.label} className="summary-card">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
            <div className="preview-card">
              {form.media.find((item) => item.type === 'IMAGE')?.url ? (
                <img src={form.media.find((item) => item.type === 'IMAGE')?.url} alt={form.title || 'Imagen principal de la propiedad'} />
              ) : null}
              <div>
                <span className="section__eyebrow">Vista previa</span>
                <h3>{form.title || 'Título pendiente'}</h3>
                <p>{form.summary || 'Agrega una descripción corta para que la propiedad se entienda rápidamente.'}</p>
                <strong>{form.monthlyRent ? `$${Number(form.monthlyRent).toLocaleString('es-CO')} / mes` : 'Valor pendiente'}</strong>
              </div>
            </div>
            <div className="content-card content-card--compact">
              <h3>Estado de información completa</h3>
              <div className="completion-list">
                {completionChecks.map((check) => (
                  <div key={check.label} className={check.done ? 'completion-list__item completion-list__item--done' : 'completion-list__item'}>
                    <CheckCircle2 size={16} />
                    <span>{check.label}</span>
                  </div>
                ))}
              </div>
              <p>
                Al publicar, la propiedad quedará pendiente de revisión. Nuestro equipo validará la
                información para mantener la calidad y seguridad de las publicaciones.
              </p>
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
                <ArrowLeft size={16} />
                Anterior
              </button>
            ) : null}
            {stepIndex < STEPS.length - 1 ? (
              <button className="button" type="button" onClick={() => setStepIndex((current) => current + 1)}>
                Siguiente
                <ArrowRight size={16} />
              </button>
            ) : null}
          </div>

          <div className="form-card__actions-right">
            <button className="button button--secondary" type="button" disabled={submitting || hasPendingUploads} onClick={() => handleSubmit('DRAFT')}>
              <Save size={16} />
              {hasPendingUploads ? 'Cargando archivos...' : 'Guardar como borrador'}
            </button>
            <button className="button" type="button" disabled={submitting || hasPendingUploads} onClick={() => handleSubmit(canPublishDirectly ? 'PUBLISHED' : 'PENDING')}>
              <Send size={16} />
              {submitting ? 'Guardando...' : hasPendingUploads ? 'Cargando archivos...' : canPublishDirectly ? 'Publicar propiedad' : 'Enviar a revisión'}
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
