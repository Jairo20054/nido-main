import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Save, Send } from 'lucide-react';
import { useAuth } from '../../app/providers/useAuth';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { PROPERTY_DRAFT_STORAGE_KEY } from '../../lib/constants';
import {
  MIN_IMAGE_COUNT_TO_PUBLISH,
  normalizeExistingMediaItem,
  sanitizeMediaForSubmission,
} from './propertyMediaService';
import { AmenitiesStep } from './property-form/AmenitiesStep';
import { BasicInfoStep } from './property-form/BasicInfoStep';
import { FeaturesStep } from './property-form/FeaturesStep';
import { ImagesStep } from './property-form/ImagesStep';
import { LocationStep } from './property-form/LocationStep';
import { PreviewStep } from './property-form/PreviewStep';
import { PricingStep } from './property-form/PricingStep';
import { StepProgress } from './property-form/StepProgress';
import { hasKnownCity, hasKnownCountry, hasKnownDepartment, resolveLocationValues } from './property-form/locations';

const STEPS = [
  { id: 'basic', label: 'Básica' },
  { id: 'location', label: 'Ubicación' },
  { id: 'pricing', label: 'Precio' },
  { id: 'features', label: 'Características' },
  { id: 'amenities', label: 'Comodidades' },
  { id: 'media', label: 'Imágenes' },
  { id: 'preview', label: 'Publicar' },
];

const STEP_FIELDS = {
  basic: ['title', 'propertyType', 'summary', 'description'],
  location: ['country', 'department', 'city', 'addressLine'],
  pricing: ['monthlyRent', 'maintenanceFee', 'securityDeposit', 'minLeaseMonths', 'availableFrom'],
  features: ['bedrooms', 'bathrooms', 'areaM2', 'parkingSpots', 'floor', 'strata'],
  media: ['media'],
  preview: ['contactName', 'contactPhone', 'contactEmail', 'publishingAuthorization'],
};

const UNSAFE_TEXT_PATTERN = /<\s*\/?\s*[a-z][^>]*>|javascript:|data:text\/html/i;
const PHONE_PATTERN = /^\+?[0-9\s().-]{7,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emptyForm = {
  title: '',
  summary: '',
  description: '',
  operationType: 'RENT',
  propertyType: 'APARTMENT',
  rentalType: 'FULL_HOME',
  status: 'DRAFT',
  country: '',
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

const toFormState = (property) => {
  if (!property) {
    return emptyForm;
  }

  const resolvedLocation = resolveLocationValues({
    country: property.country,
    department: property.department,
    city: property.city,
  });

  return {
    ...emptyForm,
    title: property.title || '',
    summary: property.summary || '',
    description: property.description || '',
    propertyType: property.propertyType || 'APARTMENT',
    rentalType: property.rentalType || 'FULL_HOME',
    status: property.status || 'DRAFT',
    country: resolvedLocation.country,
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
  Object.entries(form).some(([key, value]) => {
    if (key === 'media') return false;
    return typeof value === 'string' && UNSAFE_TEXT_PATTERN.test(value);
  });

const toNumber = (value) => Number(value);
const isMissingNumber = (value) => value === '' || value === null || value === undefined || Number.isNaN(Number(value));
const normalizeNumber = (value, fallback = 0) => (isMissingNumber(value) ? fallback : Number(value));

const firstMessage = (errors) => Object.values(errors).find(Boolean) || '';

const scopedErrors = (errors, scope) => {
  if (!scope || !STEP_FIELDS[scope]) {
    return errors;
  }

  return STEP_FIELDS[scope].reduce((result, field) => {
    if (errors[field]) {
      result[field] = errors[field];
    }

    return result;
  }, {});
};

const validateForAction = (form, action, scope = null) => {
  const errors = {};
  const add = (field, message) => {
    if (!errors[field]) {
      errors[field] = message;
    }
  };

  if (hasUnsafeText(form)) {
    add('form', 'No incluyas HTML, scripts ni enlaces potencialmente inseguros en la publicación.');
  }

  if (!form.title.trim()) add('title', 'Ingresa un título claro para la propiedad.');
  else if (form.title.trim().length < 8) add('title', 'El título debe tener al menos 8 caracteres.');

  if (!form.propertyType) add('propertyType', 'Selecciona el tipo de propiedad.');

  if (!form.summary.trim()) add('summary', 'Agrega una descripción breve.');
  else if (form.summary.trim().length < 20) add('summary', 'La descripción breve debe tener al menos 20 caracteres.');

  if (!form.description.trim()) add('description', 'Agrega una descripción completa.');
  else if (form.description.trim().length < 80) add('description', 'La descripción completa debe tener al menos 80 caracteres.');

  if (!form.country) {
    add('country', 'Selecciona el país de la propiedad.');
  } else if (!hasKnownCountry(form.country)) {
    add('country', 'Selecciona un país disponible en la lista.');
  }

  if (!form.department) {
    add('department', 'Selecciona el departamento o estado.');
  } else if (!hasKnownDepartment(form.country, form.department)) {
    add('department', 'Selecciona un departamento o estado disponible para ese país.');
  }

  if (!form.city) {
    add('city', 'Selecciona la ciudad.');
  } else if (!hasKnownCity(form.country, form.department, form.city)) {
    add('city', 'Selecciona una ciudad disponible para ese departamento.');
  }
  if (!form.addressLine.trim()) add('addressLine', 'Ingresa una direccion aproximada, barrio o zona.');

  if (isMissingNumber(form.monthlyRent) || toNumber(form.monthlyRent) <= 0) {
    add('monthlyRent', 'Ingresa un valor mensual válido para el arriendo.');
  } else if (toNumber(form.monthlyRent) < 100000) {
    add('monthlyRent', 'El valor mensual debe ser de al menos $100.000.');
  }

  if (!form.administrationIncluded && form.maintenanceFee !== '' && toNumber(form.maintenanceFee) < 0) {
    add('maintenanceFee', 'La administración no puede ser negativa.');
  }

  if (form.depositRequired && (isMissingNumber(form.securityDeposit) || toNumber(form.securityDeposit) <= 0)) {
    add('securityDeposit', 'Ingresa un valor de depósito válido.');
  }

  if (isMissingNumber(form.minLeaseMonths) || toNumber(form.minLeaseMonths) <= 0) {
    add('minLeaseMonths', 'Ingresa una duración mínima válida.');
  }

  if (!form.availableImmediately && !form.availableFrom) {
    add('availableFrom', 'Indica una fecha disponible o marca disponibilidad inmediata.');
  }

  if (isMissingNumber(form.areaM2) || toNumber(form.areaM2) <= 0) {
    add('areaM2', 'Ingresa un área en m² válida.');
  } else if (toNumber(form.areaM2) < 10) {
    add('areaM2', 'El área debe ser de al menos 10 m².');
  }

  if (toNumber(form.bedrooms) < 0) add('bedrooms', 'Las habitaciones no pueden ser negativas.');
  if (toNumber(form.bathrooms) < 1) add('bathrooms', 'Ingresa al menos un baño.');
  if (toNumber(form.parkingSpots) < 0) add('parkingSpots', 'Los parqueaderos no pueden ser negativos.');
  if (form.floor !== '' && toNumber(form.floor) < 0) add('floor', 'El piso no puede ser negativo.');
  if (form.country === 'Colombia' && form.strata !== '' && (toNumber(form.strata) < 1 || toNumber(form.strata) > 6)) {
    add('strata', 'El estrato debe estar entre 1 y 6.');
  }

  if (form.media.some((item) => item.uploadStatus === 'uploading')) {
    add('media', 'Espera a que terminen de cargarse los archivos antes de guardar.');
  }

  if (form.media.some((item) => item.uploadStatus === 'error')) {
    add('media', 'Corrige o elimina los archivos con error antes de continuar.');
  }

  const imageCount = form.media.filter((item) => item.type === 'IMAGE').length;
  if (action !== 'draft' && imageCount < MIN_IMAGE_COUNT_TO_PUBLISH) {
    add('media', `Agrega mínimo ${MIN_IMAGE_COUNT_TO_PUBLISH} imágenes antes de enviar la propiedad a revisión.`);
  }

  if (action !== 'draft') {
    if (!form.contactName.trim()) {
      add('contactName', 'Completa el nombre del propietario o responsable.');
    }

    if (form.contactPhone && !PHONE_PATTERN.test(form.contactPhone)) {
      add('contactPhone', 'Ingresa un teléfono de contacto válido.');
    }

    if (form.contactWhatsapp && !PHONE_PATTERN.test(form.contactWhatsapp)) {
      add('contactPhone', 'Ingresa un WhatsApp valido.');
    }

    if (form.contactEmail && !EMAIL_PATTERN.test(form.contactEmail)) {
      add('contactEmail', 'Ingresa un correo electrónico válido.');
    }

    if (!form.contactPhone && !form.contactEmail) {
      add('contactPhone', 'Agrega al menos un teléfono o correo de contacto.');
    }

    if (!form.publishingAuthorization) {
      add('publishingAuthorization', 'Confirma que tienes autorización para publicar esta propiedad.');
    }
  }

  const visibleErrors = scopedErrors(errors, scope);

  return {
    fieldErrors: visibleErrors,
    message: firstMessage(visibleErrors) || firstMessage(errors),
  };
};

const normalizePayload = (form, targetStatus) => {
  const { country: _country, operationType: _operationType, ...payload } = form;
  const normalizedBedrooms = normalizeNumber(form.bedrooms, 0);

  return {
    ...payload,
    status: targetStatus,
    monthlyRent: Number(form.monthlyRent),
    maintenanceFee: form.administrationIncluded ? 0 : normalizeNumber(form.maintenanceFee, 0),
    securityDeposit: form.depositRequired ? normalizeNumber(form.securityDeposit, 0) : 0,
    bedrooms: normalizedBedrooms,
    bathrooms: Number(form.bathrooms),
    areaM2: Number(form.areaM2),
    floor: form.floor === '' ? null : Number(form.floor),
    parkingSpots: Number(form.parkingSpots || 0),
    strata: form.country === 'Colombia' && form.strata !== '' ? Number(form.strata) : null,
    maxOccupants: Math.max(1, Number(form.maxOccupants || 0), normalizedBedrooms + 1),
    minLeaseMonths: Number(form.minLeaseMonths),
    availableFrom: form.availableImmediately ? null : form.availableFrom,
    utilitiesIncluded: form.servicesIncluded.length > 0,
    contactWhatsapp: form.contactWhatsapp || form.contactPhone,
    amenities: parseList(form.amenities),
    media: sanitizeMediaForSubmission(form.media),
  };
};

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
      return undefined;
    }

    setDraftStatus('Guardando cambios...');
    const timeout = window.setTimeout(() => {
      localStorage.setItem(PROPERTY_DRAFT_STORAGE_KEY, serializeDraftForm(form));
      setDraftStatus('Cambios guardados automáticamente');
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [form, property]);

  const title = property ? 'Editar propiedad' : 'Publicar propiedad';
  const currentStep = STEPS[stepIndex];
  const imageCount = form.media.filter((item) => item.type === 'IMAGE').length;
  const hasPendingUploads = form.media.some((item) => item.uploadStatus === 'uploading');

  const completionChecks = useMemo(
    () => [
      { label: 'Información básica completa', done: Boolean(form.title && form.summary && form.description) },
      { label: 'Ubicación con país, departamento y ciudad', done: Boolean(form.country && form.department && form.city) },
      { label: 'Precio y disponibilidad definidos', done: Boolean(form.monthlyRent && (form.availableImmediately || form.availableFrom)) },
      { label: 'Características principales completas', done: Boolean(form.areaM2 && form.bathrooms !== '') },
      { label: `Mínimo ${MIN_IMAGE_COUNT_TO_PUBLISH} imágenes cargadas`, done: imageCount >= MIN_IMAGE_COUNT_TO_PUBLISH },
      { label: 'Contacto y autorización listos', done: Boolean(form.contactName && (form.contactPhone || form.contactEmail) && form.publishingAuthorization) },
    ],
    [form, imageCount]
  );

  const setField = (field, value, extraFields = undefined) => {
    setForm((current) => ({ ...current, [field]: value, ...(extraFields || {}) }));
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const setFields = (updates) => {
    setForm((current) => ({ ...current, ...updates }));
    setFieldErrors((current) => {
      const next = { ...current };
      Object.keys(updates).forEach((key) => {
        delete next[key];
      });
      return next;
    });
  };

  const toggleListValue = (field, value) =>
    setForm((current) => {
      const currentValues = current[field] || [];
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];
      return { ...current, [field]: nextValues };
    });

  const applyValidation = (action, scope = null) => {
    const result = validateForAction(form, action, scope);
    setFieldErrors(result.fieldErrors);
    setError(result.message);
    return !result.message;
  };

  const handleCountryChange = (country) => {
    setFields({
      country,
      department: '',
      city: '',
      strata: country === 'Colombia' ? form.strata : '',
    });
  };

  const handleDepartmentChange = (department) => {
    setFields({
      department,
      city: '',
    });
  };

  const goToStep = (nextIndex) => {
    if (nextIndex <= stepIndex) {
      setStepIndex(nextIndex);
      setError('');
      return;
    }

    if (applyValidation('draft', currentStep.id)) {
      setStepIndex(nextIndex);
      setError('');
    }
  };

  const handleNext = () => goToStep(Math.min(stepIndex + 1, STEPS.length - 1));
  const handlePrevious = () => {
    setError('');
    setStepIndex((current) => Math.max(current - 1, 0));
  };

  const handleSubmit = async (targetStatus) => {
    const action = targetStatus === 'DRAFT' ? 'draft' : 'review';

    if (!applyValidation(action)) {
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
            <p>Un flujo más corto para publicar viviendas con datos claros, buenas fotos y validación simple.</p>
          </div>
          {draftStatus ? <span className="draft-save-indicator">{draftStatus}</span> : null}
        </div>

        <StepProgress currentStepIndex={stepIndex} onStepChange={goToStep} steps={STEPS} />

        <InlineMessage tone="danger">{error}</InlineMessage>

        {currentStep.id === 'basic' ? <BasicInfoStep {...stepProps} /> : null}
        {currentStep.id === 'location' ? (
          <LocationStep
            {...stepProps}
            onCountryChange={handleCountryChange}
            onDepartmentChange={handleDepartmentChange}
          />
        ) : null}
        {currentStep.id === 'pricing' ? <PricingStep {...stepProps} /> : null}
        {currentStep.id === 'features' ? <FeaturesStep {...stepProps} /> : null}
        {currentStep.id === 'amenities' ? (
          <AmenitiesStep form={form} setField={setField} toggleListValue={toggleListValue} />
        ) : null}
        {currentStep.id === 'media' ? <ImagesStep form={form} setField={setField} /> : null}
        {currentStep.id === 'preview' ? (
          <PreviewStep
            {...stepProps}
            canPublishDirectly={canPublishDirectly}
            completionChecks={completionChecks}
            imageCount={imageCount}
          />
        ) : null}

        <div className="form-card__actions">
          <div className="form-card__actions-left">
            {stepIndex > 0 ? (
              <button className="button button--secondary" type="button" onClick={handlePrevious}>
                <ArrowLeft size={16} />
                Anterior
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
            <button
              className="button button--secondary"
              type="button"
              disabled={submitting || hasPendingUploads}
              onClick={() => handleSubmit('DRAFT')}
            >
              <Save size={16} />
              {hasPendingUploads ? 'Cargando archivos...' : 'Guardar borrador'}
            </button>
            <button
              className="button"
              type="button"
              disabled={submitting || hasPendingUploads}
              onClick={() => handleSubmit(canPublishDirectly ? 'PUBLISHED' : 'PENDING')}
            >
              <Send size={16} />
              {submitting
                ? 'Guardando...'
                : hasPendingUploads
                  ? 'Cargando archivos...'
                : canPublishDirectly
                  ? 'Publicar propiedad'
                    : 'Enviar a revisión'}
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
