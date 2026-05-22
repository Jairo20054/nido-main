import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  DoorOpen,
  Home,
  MapPin,
  Ruler,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../app/providers/useAuth';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { NumberStepper } from '../../components/ui/NumberStepper';
import { PROPERTY_DRAFT_STORAGE_KEY } from '../../lib/constants';
import {
  MIN_IMAGE_COUNT_TO_PUBLISH,
  normalizeExistingMediaItem,
  sanitizeMediaForSubmission,
} from './propertyMediaService';
import { PropertyMediaManager } from './PropertyMediaManager';
import { getCitiesForDepartment, getDepartmentsForCountry, hasKnownCity, hasKnownDepartment, resolveLocationValues } from './property-form/locations';

const DEFAULT_COUNTRY = 'Colombia';

const STEPS = [
  { id: 'location', label: 'Tipo y ubicacion', helper: 'Lo esencial para ubicar la vivienda.' },
  { id: 'details', label: 'Detalles fisicos', helper: 'Datos comparables y faciles de validar.' },
  { id: 'pricing', label: 'Precio y condiciones', helper: 'Canon, servicios y disponibilidad.' },
  { id: 'review', label: 'Resumen final', helper: 'Revisa todo antes de publicar.' },
];

const STEP_FIELDS = {
  location: ['propertyType', 'department', 'city', 'addressLine', 'summary'],
  details: ['areaM2', 'bedrooms', 'bathrooms', 'floor', 'strata', 'parkingSpots'],
  pricing: ['monthlyRent', 'maintenanceFee', 'securityDeposit', 'minLeaseMonths', 'availableFrom'],
  review: ['contactName', 'contactPhone', 'contactEmail', 'publishingAuthorization', 'media'],
};

const PROPERTY_TYPE_OPTIONS = [
  {
    value: 'APARTMENT',
    label: 'Apartamento',
    description: 'Ideal para vivienda urbana o conjunto residencial.',
    icon: Building2,
  },
  {
    value: 'HOUSE',
    label: 'Casa',
    description: 'Perfecta para familias, patios o espacios independientes.',
    icon: Home,
  },
  {
    value: 'STUDIO',
    label: 'Estudio',
    description: 'Compacto, practico y facil de mantener.',
    icon: Sparkles,
  },
  {
    value: 'ROOM',
    label: 'Habitacion',
    description: 'Para renta por habitacion o vivienda compartida.',
    icon: DoorOpen,
  },
];

const SERVICE_OPTIONS = ['Agua', 'Energia', 'Gas', 'Internet'];

const FEATURE_OPTIONS = [
  { field: 'furnished', label: 'Amoblado' },
  { field: 'petsAllowed', label: 'Mascotas' },
  { field: 'balcony', label: 'Balcon' },
  { field: 'equippedKitchen', label: 'Cocina integral' },
  { field: 'elevator', label: 'Ascensor' },
  { field: 'doorman', label: 'Porteria' },
  { field: 'parkingSpots', label: 'Parqueadero', numeric: true },
  { field: 'laundryArea', label: 'Zona de ropas' },
];

const CONTACT_PREFERENCE_OPTIONS = [
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'PHONE', label: 'Llamada' },
  { value: 'EMAIL', label: 'Correo' },
];

const UNSAFE_TEXT_PATTERN = /<\s*\/?\s*[a-z][^>]*>|javascript:|data:text\/html/i;
const PHONE_PATTERN = /^\+?[0-9\s().-]{7,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emptyForm = {
  title: '',
  summary: '',
  description: '',
  operationType: 'RENT',
  propertyType: '',
  rentalType: 'FULL_HOME',
  status: 'DRAFT',
  country: DEFAULT_COUNTRY,
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
  administrationIncluded: true,
  maintenanceFee: '',
  depositRequired: false,
  securityDeposit: '',
  servicesIncluded: [],
  availableImmediately: true,
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

const normalizeLocation = (property) =>
  resolveLocationValues({
    country: property.country || DEFAULT_COUNTRY,
    department: property.department,
    city: property.city,
  });

const toFormState = (property) => {
  if (!property) return emptyForm;

  const resolvedLocation = normalizeLocation(property);

  return {
    ...emptyForm,
    title: property.title || '',
    summary: property.summary || '',
    description: property.description || '',
    propertyType: property.propertyType || '',
    rentalType: property.rentalType || 'FULL_HOME',
    status: property.status || 'DRAFT',
    country: resolvedLocation.country || DEFAULT_COUNTRY,
    city: resolvedLocation.city,
    department: resolvedLocation.department,
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
    availableImmediately: property.availableImmediately ?? true,
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
  Object.entries(form).some(([key, value]) => key !== 'media' && typeof value === 'string' && UNSAFE_TEXT_PATTERN.test(value));

const firstMessage = (errors) => Object.values(errors).find(Boolean) || '';
const toNumber = (value) => Number(value);
const isMissingNumber = (value) => value === '' || value === null || value === undefined || Number.isNaN(Number(value));
const normalizeNumber = (value, fallback = 0) => (isMissingNumber(value) ? fallback : Number(value));

const getPropertyTypeLabel = (value) =>
  PROPERTY_TYPE_OPTIONS.find((option) => option.value === value)?.label || 'Vivienda';

const buildGeneratedTitle = (form) => {
  const type = getPropertyTypeLabel(form.propertyType);
  const location = form.neighborhood || form.city || form.department;
  return [type, location ? `en ${location}` : 'lista para arrendar'].join(' ').trim();
};

const buildGeneratedDescription = (form) => {
  const location = [form.neighborhood, form.city, form.department].filter(Boolean).join(', ');
  const features = [
    form.areaM2 ? `${form.areaM2} m2` : '',
    `${form.bedrooms || 0} habitacion${Number(form.bedrooms) === 1 ? '' : 'es'}`,
    `${form.bathrooms || 1} bano${Number(form.bathrooms) === 1 ? '' : 's'}`,
    form.furnished ? 'amoblada' : '',
    form.petsAllowed ? 'acepta mascotas' : '',
  ].filter(Boolean);

  return [
    form.summary,
    location ? `Ubicada en ${location}.` : '',
    features.length ? `Cuenta con ${features.join(', ')}.` : '',
    form.servicesIncluded.length ? `Servicios incluidos o disponibles: ${form.servicesIncluded.join(', ')}.` : '',
    'Publicacion preparada para revision en NIDO.',
  ]
    .filter(Boolean)
    .join(' ');
};

const getScopedErrors = (errors, scope) => {
  if (!scope || !STEP_FIELDS[scope]) return errors;

  return STEP_FIELDS[scope].reduce((result, field) => {
    if (errors[field]) result[field] = errors[field];
    return result;
  }, {});
};

const validateForm = (form, { action = 'publish', scope = null } = {}) => {
  const errors = {};
  const add = (field, message) => {
    if (!errors[field]) errors[field] = message;
  };

  if (hasUnsafeText(form)) {
    add('form', 'No incluyas HTML, scripts ni enlaces potencialmente inseguros.');
  }

  if (!form.propertyType) add('propertyType', 'Selecciona el tipo de propiedad.');

  if (!form.department) {
    add('department', 'Selecciona el departamento.');
  } else if (!hasKnownDepartment(form.country || DEFAULT_COUNTRY, form.department)) {
    add('department', 'Selecciona un departamento disponible.');
  }

  if (!form.city) {
    add('city', 'Selecciona la ciudad.');
  } else if (!hasKnownCity(form.country || DEFAULT_COUNTRY, form.department, form.city)) {
    add('city', 'Selecciona una ciudad disponible para el departamento.');
  }

  if (!form.addressLine.trim()) add('addressLine', 'Ingresa una direccion o zona clara.');

  if (!form.summary.trim()) {
    add('summary', 'Agrega una descripcion corta.');
  } else if (form.summary.trim().length < 20) {
    add('summary', 'La descripcion debe tener al menos 20 caracteres.');
  }

  if (isMissingNumber(form.areaM2) || toNumber(form.areaM2) <= 0) {
    add('areaM2', 'Ingresa el area en m2.');
  } else if (toNumber(form.areaM2) < 10) {
    add('areaM2', 'El area debe ser de al menos 10 m2.');
  }

  if (toNumber(form.bedrooms) < 0) add('bedrooms', 'Las habitaciones no pueden ser negativas.');
  if (toNumber(form.bathrooms) < 1) add('bathrooms', 'Ingresa al menos un bano.');
  if (form.floor !== '' && toNumber(form.floor) < 0) add('floor', 'El piso no puede ser negativo.');
  if (form.strata !== '' && (toNumber(form.strata) < 1 || toNumber(form.strata) > 6)) {
    add('strata', 'El estrato debe estar entre 1 y 6.');
  }

  if (isMissingNumber(form.monthlyRent) || toNumber(form.monthlyRent) <= 0) {
    add('monthlyRent', 'Ingresa el precio mensual.');
  } else if (toNumber(form.monthlyRent) < 100000) {
    add('monthlyRent', 'El valor mensual debe ser de al menos $100.000.');
  }

  if (!form.administrationIncluded && form.maintenanceFee !== '' && toNumber(form.maintenanceFee) < 0) {
    add('maintenanceFee', 'La administracion no puede ser negativa.');
  }

  if (form.depositRequired && (isMissingNumber(form.securityDeposit) || toNumber(form.securityDeposit) <= 0)) {
    add('securityDeposit', 'Ingresa el valor del deposito.');
  }

  if (isMissingNumber(form.minLeaseMonths) || toNumber(form.minLeaseMonths) <= 0) {
    add('minLeaseMonths', 'Ingresa la duracion minima del contrato.');
  }

  if (!form.availableImmediately && !form.availableFrom) {
    add('availableFrom', 'Indica la fecha disponible.');
  }

  if (form.media.some((item) => item.uploadStatus === 'uploading')) {
    add('media', 'Espera a que terminen de cargarse las fotos.');
  }

  if (form.media.some((item) => item.uploadStatus === 'error')) {
    add('media', 'Corrige o elimina los archivos con error.');
  }

  const imageCount = form.media.filter((item) => item.type === 'IMAGE').length;
  if (action !== 'draft' && imageCount < MIN_IMAGE_COUNT_TO_PUBLISH) {
    add('media', `Agrega minimo ${MIN_IMAGE_COUNT_TO_PUBLISH} imagenes para enviar la propiedad a revision.`);
  }

  if (action !== 'draft') {
    if (!form.contactName.trim()) add('contactName', 'Completa el nombre del responsable.');
    if (form.contactPhone && !PHONE_PATTERN.test(form.contactPhone)) add('contactPhone', 'Ingresa un telefono valido.');
    if (form.contactEmail && !EMAIL_PATTERN.test(form.contactEmail)) add('contactEmail', 'Ingresa un correo valido.');
    if (!form.contactPhone && !form.contactEmail) add('contactPhone', 'Agrega telefono o correo de contacto.');
    if (!form.publishingAuthorization) add('publishingAuthorization', 'Confirma que tienes autorizacion para publicar.');
  }

  const scopedErrors = getScopedErrors(errors, scope);

  return {
    allErrors: errors,
    fieldErrors: scope ? scopedErrors : errors,
    message: scope ? firstMessage(scopedErrors) : firstMessage(errors),
  };
};

const normalizePayload = (form, targetStatus) => {
  const { country: _country, operationType: _operationType, ...payload } = form;
  const normalizedBedrooms = normalizeNumber(form.bedrooms, 0);
  const description = buildGeneratedDescription(form);

  return {
    ...payload,
    title: (form.title || buildGeneratedTitle(form)).slice(0, 100),
    summary: form.summary.trim(),
    description: description.length >= 80 ? description : `${description} Informacion verificada para una publicacion clara y confiable en NIDO.`,
    status: targetStatus,
    monthlyRent: Number(form.monthlyRent),
    maintenanceFee: form.administrationIncluded ? 0 : normalizeNumber(form.maintenanceFee, 0),
    securityDeposit: form.depositRequired ? normalizeNumber(form.securityDeposit, 0) : 0,
    bedrooms: normalizedBedrooms,
    bathrooms: Number(form.bathrooms),
    areaM2: Number(form.areaM2),
    floor: form.floor === '' ? null : Number(form.floor),
    parkingSpots: Number(form.parkingSpots || 0),
    strata: form.strata !== '' ? Number(form.strata) : null,
    maxOccupants: Math.max(1, Number(form.maxOccupants || 0), normalizedBedrooms + 1),
    minLeaseMonths: Number(form.minLeaseMonths),
    availableFrom: form.availableImmediately ? null : form.availableFrom,
    utilitiesIncluded: form.servicesIncluded.length > 0,
    contactWhatsapp: form.contactWhatsapp || form.contactPhone,
    amenities: parseList(form.amenities),
    media: sanitizeMediaForSubmission(form.media),
  };
};

const formatCurrency = (value) =>
  value && !Number.isNaN(Number(value)) ? `$${Number(value).toLocaleString('es-CO')}` : 'Pendiente';

function FormSection({ children, eyebrow, title, description }) {
  return (
    <section className="property-step" aria-labelledby={`${eyebrow.replace(/\s+/g, '-')}-title`}>
      <div className="property-step__heading">
        <span>{eyebrow}</span>
        <h3 id={`${eyebrow.replace(/\s+/g, '-')}-title`}>{title}</h3>
        {description ? <p>{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Field({ children, error, help, id, label, required = false }) {
  return (
    <div className="field-group property-field">
      <label htmlFor={id}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {children}
      {help ? <small className="field-help">{help}</small> : null}
      {error ? (
        <small className="field-error" id={`${id}-error`}>
          {error}
        </small>
      ) : null}
    </div>
  );
}

function TextInput({ error, help, id, label, multiline = false, onChange, required, rows = 4, value, ...props }) {
  const inputProps = {
    id,
    value,
    onChange: (event) => onChange(event.target.value),
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? `${id}-error` : undefined,
    ...props,
  };

  return (
    <Field error={error} help={help} id={id} label={label} required={required}>
      {multiline ? <textarea rows={rows} {...inputProps} /> : <input {...inputProps} />}
    </Field>
  );
}

function SelectInput({ disabled = false, error, help, id, label, onChange, options, placeholder, required, value }) {
  return (
    <Field error={error} help={help} id={id} label={label} required={required}>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Field>
  );
}

function Chip({ active, children, onClick }) {
  return (
    <button className={`select-chip ${active ? 'select-chip--active' : ''}`} type="button" aria-pressed={active} onClick={onClick}>
      {children}
    </button>
  );
}

function Toggle({ checked, description, id, label, onChange }) {
  return (
    <label className="form-toggle" htmlFor={id}>
      <input id={id} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="form-toggle__control" aria-hidden="true" />
      <span>
        <strong>{label}</strong>
        {description ? <small>{description}</small> : null}
      </span>
    </label>
  );
}

function StepIndicator({ currentStepIndex, onStepChange, steps }) {
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="property-step-progress" aria-label="Progreso del formulario">
      <div className="property-step-progress__summary">
        <span>
          Paso {currentStepIndex + 1} de {steps.length}
        </span>
        <strong>{steps[currentStepIndex].label}</strong>
      </div>
      <div className="property-step-progress__bar" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="stepper">
        {steps.map((step, index) => (
          <button
            key={step.id}
            className={`stepper__item ${index === currentStepIndex ? 'stepper__item--active' : ''} ${
              index < currentStepIndex ? 'stepper__item--done' : ''
            }`}
            type="button"
            onClick={() => onStepChange(index)}
          >
            <span>{index < currentStepIndex ? <CheckCircle2 size={14} /> : index + 1}</span>
            <strong>{step.label}</strong>
            <small>{step.helper}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <div className="summary-card">
      <span>
        {Icon ? <Icon size={15} aria-hidden="true" /> : null}
        {label}
      </span>
      <strong>{value || 'Pendiente'}</strong>
    </div>
  );
}

function TypeLocationStep({ cities, departments, errors, form, onDepartmentChange, setField }) {
  return (
    <FormSection
      eyebrow="Paso 1"
      title="Informacion basica y ubicacion"
      description="Primero define que se publica y donde esta. Esta informacion alimenta busqueda, filtros y revision operativa."
    >
      <div className="property-step__subsection property-step__subsection--first">
        <div className="property-step__heading property-step__heading--compact">
          <span>Informacion basica</span>
          <h3>Tipo de vivienda</h3>
        </div>
      <div className="property-type-grid" role="group" aria-label="Tipo de propiedad">
        {PROPERTY_TYPE_OPTIONS.map((option) => {
          const Icon = option.icon;
          const active = form.propertyType === option.value;

          return (
            <button
              key={option.value}
              className={`property-type-card ${active ? 'property-type-card--active' : ''}`}
              type="button"
              aria-pressed={active}
              onClick={() =>
                setField('propertyType', option.value, {
                  rentalType: option.value === 'ROOM' ? 'ROOM_ONLY' : 'FULL_HOME',
                })
              }
            >
              <Icon size={20} aria-hidden="true" />
              <strong>{option.label}</strong>
              <span>{option.description}</span>
            </button>
          );
        })}
      </div>
      {errors.propertyType ? <small className="field-error">{errors.propertyType}</small> : null}
      </div>

      <div className="property-step__subsection">
        <div className="property-step__heading property-step__heading--compact">
          <span>Ubicacion</span>
          <h3>Zona visible para los interesados</h3>
        </div>
      <div className="field-grid field-grid--triple">
        <SelectInput
          id="department"
          label="Departamento"
          required
          value={form.department}
          onChange={onDepartmentChange}
          options={departments.map((department) => department.name)}
          error={errors.department}
          placeholder="Selecciona departamento"
        />
        <SelectInput
          id="city"
          label="Ciudad"
          required
          value={form.city}
          onChange={(value) => setField('city', value)}
          options={cities}
          disabled={!form.department}
          error={errors.city}
          placeholder={form.department ? 'Selecciona ciudad' : 'Selecciona primero departamento'}
        />
        <TextInput
          id="neighborhood"
          label="Barrio"
          value={form.neighborhood}
          onChange={(value) => setField('neighborhood', value)}
          placeholder="Ej. Chico Norte"
          maxLength={80}
        />
      </div>

      <TextInput
        id="addressLine"
        label="Direccion o zona"
        required
        value={form.addressLine}
        onChange={(value) => setField('addressLine', value)}
        error={errors.addressLine}
        placeholder="Ej. Carrera 15 con Calle 93, zona Parque de la 93"
        help="Puedes mantener privada la direccion exacta. La zona debe ser suficiente para validar la publicacion."
        maxLength={160}
      />
      </div>

      <div className="property-step__subsection">
        <div className="property-step__heading property-step__heading--compact">
          <span>Descripcion</span>
          <h3>Mensaje corto de publicacion</h3>
        </div>
      <TextInput
        id="summary"
        label="Descripcion corta"
        required
        multiline
        rows={3}
        value={form.summary}
        onChange={(value) => setField('summary', value)}
        error={errors.summary}
        placeholder="Cuenta en una frase que hace especial esta vivienda."
        maxLength={180}
      />
      </div>
    </FormSection>
  );
}

function DetailsStep({ errors, form, setField }) {
  const toggleFeature = (option) => {
    if (option.numeric) {
      setField(option.field, Number(form[option.field] || 0) > 0 ? 0 : 1);
      return;
    }

    setField(option.field, !form[option.field]);
  };

  return (
    <FormSection
      eyebrow="Paso 2"
      title="Detalles fisicos de la vivienda"
      description="Usa datos concretos. Esto mejora filtros, comparacion y confianza."
    >
      <div className="field-grid field-grid--quad">
        <NumberStepper id="bedrooms" label="Habitaciones" min={0} max={20} value={form.bedrooms} onChange={(value) => setField('bedrooms', value)} error={errors.bedrooms} />
        <NumberStepper id="bathrooms" label="Banos" min={1} max={12} value={form.bathrooms} onChange={(value) => setField('bathrooms', value)} error={errors.bathrooms} />
        <TextInput
          id="areaM2"
          label="Area en m2"
          required
          type="number"
          min="10"
          inputMode="numeric"
          value={form.areaM2}
          onChange={(value) => setField('areaM2', value)}
          error={errors.areaM2}
          placeholder="64"
        />
        <NumberStepper
          id="floor"
          label="Piso"
          min={0}
          max={80}
          value={form.floor}
          onChange={(value) => setField('floor', value)}
          error={errors.floor}
          help="Usa 0 para primer piso o nivel de acceso."
        />
      </div>

      <div className="field-grid">
        <NumberStepper
          id="strata"
          label="Estrato"
          min={1}
          max={6}
          value={form.strata}
          onChange={(value) => setField('strata', value)}
          error={errors.strata}
          help="Rango valido en Colombia: 1 a 6."
        />
        <NumberStepper
          id="parkingSpots"
          label="Parqueaderos"
          min={0}
          max={10}
          value={form.parkingSpots}
          onChange={(value) => setField('parkingSpots', value)}
        />
      </div>

      <div className="field-group property-field">
        <span className="property-field__label">Caracteristicas</span>
        <div className="chip-group">
          {FEATURE_OPTIONS.map((option) => {
            const active = option.numeric ? Number(form[option.field] || 0) > 0 : Boolean(form[option.field]);
            return (
              <Chip key={option.label} active={active} onClick={() => toggleFeature(option)}>
                {option.label}
              </Chip>
            );
          })}
        </div>
      </div>
    </FormSection>
  );
}

function PricingStep({ errors, form, setField, toggleListValue }) {
  return (
    <FormSection
      eyebrow="Paso 3"
      title="Precio, servicios y disponibilidad"
      description="Haz que el costo total sea facil de entender desde el primer contacto."
    >
      <div className="field-grid">
        <TextInput
          id="monthlyRent"
          label="Precio mensual"
          required
          type="number"
          min="100000"
          inputMode="numeric"
          value={form.monthlyRent}
          onChange={(value) => setField('monthlyRent', value)}
          error={errors.monthlyRent}
          placeholder="2500000"
        />
        <NumberStepper
          id="minLeaseMonths"
          label="Duracion minima del contrato"
          min={1}
          max={60}
          value={form.minLeaseMonths}
          onChange={(value) => setField('minLeaseMonths', value)}
          error={errors.minLeaseMonths}
          help="En meses."
        />
      </div>

      <div className="toggle-panel">
        <Toggle
          id="administrationIncluded"
          label="Administracion incluida"
          description="Si esta activa, el canon ya incluye administracion."
          checked={form.administrationIncluded}
          onChange={(value) => setField('administrationIncluded', value, value ? { maintenanceFee: '' } : undefined)}
        />
        {!form.administrationIncluded ? (
          <TextInput
            id="maintenanceFee"
            label="Valor de administracion"
            type="number"
            min="0"
            inputMode="numeric"
            value={form.maintenanceFee}
            onChange={(value) => setField('maintenanceFee', value)}
            error={errors.maintenanceFee}
            placeholder="350000"
          />
        ) : null}
      </div>

      <div className="toggle-panel">
        <Toggle
          id="depositRequired"
          label="Deposito requerido"
          description="Activalo solo si el propietario solicita deposito."
          checked={form.depositRequired}
          onChange={(value) => setField('depositRequired', value, value ? undefined : { securityDeposit: '' })}
        />
        {form.depositRequired ? (
          <TextInput
            id="securityDeposit"
            label="Valor del deposito"
            type="number"
            min="0"
            inputMode="numeric"
            value={form.securityDeposit}
            onChange={(value) => setField('securityDeposit', value)}
            error={errors.securityDeposit}
            placeholder="2500000"
          />
        ) : null}
      </div>

      <div className="field-group property-field">
        <span className="property-field__label">Servicios incluidos</span>
        <div className="chip-group">
          {SERVICE_OPTIONS.map((service) => (
            <Chip key={service} active={form.servicesIncluded.includes(service)} onClick={() => toggleListValue('servicesIncluded', service)}>
              {service}
            </Chip>
          ))}
        </div>
      </div>

      <div className="toggle-panel">
        <Toggle
          id="availableImmediately"
          label="Disponibilidad inmediata"
          description="Si esta activa, no necesitas indicar fecha."
          checked={form.availableImmediately}
          onChange={(value) => setField('availableImmediately', value, value ? { availableFrom: '' } : undefined)}
        />
        {!form.availableImmediately ? (
          <TextInput
            id="availableFrom"
            label="Fecha disponible"
            type="date"
            value={form.availableFrom}
            onChange={(value) => setField('availableFrom', value)}
            error={errors.availableFrom}
          />
        ) : null}
      </div>
    </FormSection>
  );
}

function ReviewStep({ canPublishDirectly, completionChecks, errors, form, imageCount, publishMessage, setField }) {
  const featureLabels = FEATURE_OPTIONS.filter((option) =>
    option.numeric ? Number(form[option.field] || 0) > 0 : Boolean(form[option.field])
  ).map((option) => option.label);

  return (
    <FormSection
      eyebrow="Paso 4"
      title="Resumen final antes de publicar"
      description="Revisa la ficha como lo haria un equipo de operaciones antes de enviarla a revision."
    >
      <div className="summary-grid">
        <SummaryCard icon={Home} label="Tipo" value={getPropertyTypeLabel(form.propertyType)} />
        <SummaryCard icon={MapPin} label="Ubicacion" value={[form.city, form.department].filter(Boolean).join(', ')} />
        <SummaryCard icon={Ruler} label="Area" value={form.areaM2 ? `${form.areaM2} m2` : ''} />
        <SummaryCard icon={BedDouble} label="Habitaciones" value={String(form.bedrooms || 0)} />
        <SummaryCard icon={Bath} label="Banos" value={String(form.bathrooms || 0)} />
        <SummaryCard icon={CircleDollarSign} label="Precio" value={`${formatCurrency(form.monthlyRent)} / mes`} />
        <SummaryCard icon={CalendarDays} label="Disponibilidad" value={form.availableImmediately ? 'Inmediata' : form.availableFrom} />
        <SummaryCard icon={ShieldCheck} label="Fotos" value={`${imageCount} cargadas`} />
      </div>

      <div className="review-summary">
        <div>
          <span>Descripcion corta</span>
          <p>{form.summary || 'Pendiente'}</p>
        </div>
        <div>
          <span>Servicios</span>
          <p>{form.servicesIncluded.length ? form.servicesIncluded.join(', ') : 'Sin servicios marcados'}</p>
        </div>
        <div>
          <span>Caracteristicas</span>
          <p>{featureLabels.length ? featureLabels.join(', ') : 'Sin caracteristicas marcadas'}</p>
        </div>
      </div>

      <div className="property-step__subsection">
        <div className="property-step__heading property-step__heading--compact">
          <span>Fotos de la propiedad</span>
          <h3>Material para revision</h3>
          <p>El backend actual solicita minimo {MIN_IMAGE_COUNT_TO_PUBLISH} imagenes para publicar o enviar a revision.</p>
        </div>
        <PropertyMediaManager media={form.media} onChange={(value) => setField('media', value)} />
        {errors.media ? <small className="field-error">{errors.media}</small> : null}
      </div>

      <div className="publication-checklist">
        <h4>Estado de la publicacion</h4>
        <div className="completion-list">
          {completionChecks.map((check) => (
            <div key={check.label} className={check.done ? 'completion-list__item completion-list__item--done' : 'completion-list__item'}>
              <CheckCircle2 size={16} />
              <span>{check.label}</span>
            </div>
          ))}
        </div>
        {publishMessage ? <small className="field-error">{publishMessage}</small> : null}
      </div>

      <div className="property-step__subsection">
        <div className="property-step__heading property-step__heading--compact">
          <span>Contacto privado</span>
          <h3>Responsable de la publicacion</h3>
        </div>
        <div className="field-grid field-grid--triple">
          <TextInput
            id="contactName"
            label="Nombre del responsable"
            value={form.contactName}
            onChange={(value) => setField('contactName', value)}
            error={errors.contactName}
            placeholder="Nombre y apellido"
            autoComplete="name"
          />
          <TextInput
            id="contactPhone"
            label="Telefono"
            value={form.contactPhone}
            onChange={(value) => setField('contactPhone', value)}
            error={errors.contactPhone}
            placeholder="+57 300 000 0000"
            autoComplete="tel"
          />
          <TextInput
            id="contactEmail"
            label="Correo"
            type="email"
            value={form.contactEmail}
            onChange={(value) => setField('contactEmail', value)}
            error={errors.contactEmail}
            placeholder="correo@dominio.com"
            autoComplete="email"
          />
        </div>
        <Field id="contactPreference" label="Preferencia de contacto">
          <select id="contactPreference" value={form.contactPreference} onChange={(event) => setField('contactPreference', event.target.value)}>
            {CONTACT_PREFERENCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Toggle
          id="publishingAuthorization"
          label="Tengo autorizacion para publicar esta propiedad"
          description={canPublishDirectly ? 'La propiedad podra quedar visible directamente.' : 'La propiedad sera enviada a revision del equipo NIDO.'}
          checked={form.publishingAuthorization}
          onChange={(value) => setField('publishingAuthorization', value)}
        />
        {errors.publishingAuthorization ? <small className="field-error">{errors.publishingAuthorization}</small> : null}
      </div>
    </FormSection>
  );
}

export function PropertyForm({ property, submitting, onCancel, onSubmit, canPublishDirectly = false }) {
  const { user } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [draftStatus, setDraftStatus] = useState('');

  useEffect(() => {
    setFieldErrors({});
    setError('');
    setStepIndex(0);

    if (property) {
      setForm(toFormState(property));
      setDraftStatus('');
      return;
    }

    const stored = localStorage.getItem(PROPERTY_DRAFT_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setForm({
          ...buildEmptyForm(user),
          ...parsed,
          country: parsed.country || DEFAULT_COUNTRY,
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
    if (property) return undefined;

    setDraftStatus('Guardando cambios...');
    const timeout = window.setTimeout(() => {
      localStorage.setItem(PROPERTY_DRAFT_STORAGE_KEY, serializeDraftForm(form));
      setDraftStatus('Cambios guardados automaticamente');
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [form, property]);

  const currentStep = STEPS[stepIndex];
  const departments = useMemo(() => getDepartmentsForCountry(form.country || DEFAULT_COUNTRY), [form.country]);
  const cities = useMemo(
    () => (hasKnownDepartment(form.country || DEFAULT_COUNTRY, form.department) ? getCitiesForDepartment(form.country || DEFAULT_COUNTRY, form.department) : []),
    [form.country, form.department]
  );
  const imageCount = form.media.filter((item) => item.type === 'IMAGE').length;
  const hasPendingUploads = form.media.some((item) => item.uploadStatus === 'uploading');
  const publishValidation = useMemo(() => validateForm(form, { action: 'publish' }), [form]);
  const isPublishReady = !publishValidation.message && !hasPendingUploads;
  const title = property ? 'Editar propiedad' : 'Publicar propiedad';

  const completionChecks = useMemo(
    () => [
      { label: 'Tipo, departamento, ciudad y direccion completos', done: Boolean(form.propertyType && form.department && form.city && form.addressLine) },
      { label: 'Area y detalles fisicos principales listos', done: Boolean(form.areaM2 && Number(form.areaM2) >= 10) },
      { label: 'Precio mensual y disponibilidad definidos', done: Boolean(form.monthlyRent && (form.availableImmediately || form.availableFrom)) },
      { label: `Minimo ${MIN_IMAGE_COUNT_TO_PUBLISH} imagenes cargadas`, done: imageCount >= MIN_IMAGE_COUNT_TO_PUBLISH },
      { label: 'Contacto privado y autorizacion confirmados', done: Boolean(form.contactName && (form.contactPhone || form.contactEmail) && form.publishingAuthorization) },
    ],
    [form, imageCount]
  );

  const setField = useCallback((field, value, extraFields = undefined) => {
    setForm((current) => ({ ...current, [field]: value, ...(extraFields || {}) }));
    setFieldErrors((current) => {
      if (!current[field] && !extraFields) return current;

      const next = { ...current };
      delete next[field];
      Object.keys(extraFields || {}).forEach((key) => delete next[key]);
      return next;
    });
  }, []);

  const setFields = useCallback((updates) => {
    setForm((current) => ({ ...current, ...updates }));
    setFieldErrors((current) => {
      const next = { ...current };
      Object.keys(updates).forEach((key) => delete next[key]);
      return next;
    });
  }, []);

  const toggleListValue = useCallback((field, value) => {
    setForm((current) => {
      const currentValues = current[field] || [];
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];
      return { ...current, [field]: nextValues };
    });
  }, []);

  const applyValidation = useCallback(
    (action, scope = null) => {
      const result = validateForm(form, { action, scope });
      setFieldErrors(result.fieldErrors);
      setError(result.message);
      return !result.message;
    },
    [form]
  );

  const handleDepartmentChange = useCallback(
    (department) => {
      setFields({
        country: form.country || DEFAULT_COUNTRY,
        department,
        city: '',
      });
    },
    [form.country, setFields]
  );

  const goToStep = useCallback(
    (nextIndex) => {
      if (nextIndex <= stepIndex) {
        setStepIndex(nextIndex);
        setError('');
        return;
      }

      if (applyValidation('draft', currentStep.id)) {
        setStepIndex(nextIndex);
        setError('');
      }
    },
    [applyValidation, currentStep.id, stepIndex]
  );

  const handlePrevious = useCallback(() => {
    setError('');
    setStepIndex((current) => Math.max(current - 1, 0));
  }, []);

  const handleNext = useCallback(() => {
    goToStep(Math.min(stepIndex + 1, STEPS.length - 1));
  }, [goToStep, stepIndex]);

  const persistProperty = useCallback(
    async (targetStatus) => {
      const action = targetStatus === 'DRAFT' ? 'draft' : 'publish';

      if (!applyValidation(action)) return;

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
        setError(requestError.message || 'No pudimos guardar la propiedad. Revisa la informacion e intentalo nuevamente.');
      }
    },
    [applyValidation, form, onSubmit, property]
  );

  const handleSaveDraft = useCallback(() => persistProperty('DRAFT'), [persistProperty]);

  const handlePublish = useCallback(() => {
    const targetStatus = canPublishDirectly ? 'PUBLISHED' : 'PENDING';
    return persistProperty(targetStatus);
  }, [canPublishDirectly, persistProperty]);

  const stepProps = {
    errors: fieldErrors,
    form,
    setField,
  };

  return (
    <div className="property-form-wizard">
      <div className="form-card property-form-wizard__card">
        <div className="form-card__header property-form-header">
          <div>
            <span className="section__eyebrow">Panel arrendador</span>
            <h2>{title}</h2>
            <p>Publica una vivienda con un flujo guiado, datos verificables y una revision final clara antes de enviarla.</p>
          </div>
          {draftStatus ? <span className="draft-save-indicator">{draftStatus}</span> : null}
        </div>

        <StepIndicator currentStepIndex={stepIndex} onStepChange={goToStep} steps={STEPS} />

        <InlineMessage tone="danger">{error}</InlineMessage>

        {currentStep.id === 'location' ? (
          <TypeLocationStep
            {...stepProps}
            cities={cities}
            departments={departments}
            onDepartmentChange={handleDepartmentChange}
          />
        ) : null}
        {currentStep.id === 'details' ? <DetailsStep {...stepProps} /> : null}
        {currentStep.id === 'pricing' ? <PricingStep {...stepProps} toggleListValue={toggleListValue} /> : null}
        {currentStep.id === 'review' ? (
          <ReviewStep
            {...stepProps}
            canPublishDirectly={canPublishDirectly}
            completionChecks={completionChecks}
            imageCount={imageCount}
            publishMessage={publishValidation.message}
          />
        ) : null}

        <div className="form-card__actions">
          <div className="form-card__actions-left">
            {stepIndex > 0 ? (
              <button className="button button--secondary" type="button" onClick={handlePrevious}>
                <ArrowLeft size={16} />
                Atras
              </button>
            ) : null}
            {stepIndex < STEPS.length - 1 ? (
              <button className="button" type="button" onClick={handleNext}>
                Siguiente
                <ArrowRight size={16} />
              </button>
            ) : null}
          </div>

          <div className="form-card__actions-right">
            <button className="button button--secondary" type="button" disabled={submitting || hasPendingUploads} onClick={handleSaveDraft}>
              <Save size={16} />
              {hasPendingUploads ? 'Cargando fotos...' : 'Guardar borrador'}
            </button>
            {stepIndex === STEPS.length - 1 ? (
              <button
                className="button"
                type="button"
                disabled={submitting || !isPublishReady}
                title={!isPublishReady ? publishValidation.message : undefined}
                onClick={handlePublish}
              >
                <Send size={16} />
                {submitting ? 'Guardando...' : canPublishDirectly ? 'Publicar propiedad' : 'Enviar a revision'}
              </button>
            ) : null}
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
