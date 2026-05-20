import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { PROPERTY_TYPE_OPTIONS } from '../../../lib/constants';
import { SelectField, TextField, ToggleField } from './FormControls';

const CONTACT_PREFERENCE_OPTIONS = [
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'PHONE', label: 'Llamada' },
  { value: 'EMAIL', label: 'Correo electrónico' },
];

const formatCurrency = (value) =>
  value ? `$${Number(value).toLocaleString('es-CO')}` : 'Pendiente';

export function PreviewStep({ canPublishDirectly, completionChecks, errors, form, imageCount, setField }) {
  const coverImage = form.media.find((item) => item.type === 'IMAGE')?.url;
  const propertyType = PROPERTY_TYPE_OPTIONS.find((item) => item.value === form.propertyType)?.label || 'Sin definir';

  const summaryCards = [
    { label: 'Tipo', value: propertyType },
    { label: 'Operación', value: 'Arriendo' },
    { label: 'Ubicación', value: [form.city, form.department].filter(Boolean).join(', ') || 'Sin definir' },
    { label: 'Valor mensual', value: formatCurrency(form.monthlyRent) },
    { label: 'Area', value: form.areaM2 ? `${form.areaM2} m2` : 'Pendiente' },
    { label: 'Imágenes', value: String(imageCount) },
  ];

  return (
    <div className="form-step property-step">
      <div className="property-step__heading">
        <span>Vista previa y publicación</span>
        <h3>Revisa antes de enviar</h3>
        <p>Confirma los datos esenciales y el contacto que usará NIDO para validar la publicación.</p>
      </div>

      <div className="summary-grid">
        {summaryCards.map((item) => (
          <div key={item.label} className="summary-card">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>

      <div className="preview-card">
        {coverImage ? <img src={coverImage} alt={form.title || 'Imagen principal de la propiedad'} /> : null}
        <div>
          <span className="section__eyebrow">Vista previa</span>
          <h3>{form.title || 'Titulo pendiente'}</h3>
          <p>{form.summary || 'Agrega una descripción breve para que la propiedad se entienda rápido.'}</p>
          <strong>{formatCurrency(form.monthlyRent)} / mes</strong>
        </div>
      </div>

      <div className="publication-checklist">
        <h4>Estado de la publicación</h4>
        <div className="completion-list">
          {completionChecks.map((check) => (
            <div key={check.label} className={check.done ? 'completion-list__item completion-list__item--done' : 'completion-list__item'}>
              <CheckCircle2 size={16} />
              <span>{check.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="property-step__subsection">
        <div className="property-step__heading property-step__heading--compact">
          <span>Contacto para revisión</span>
          <h3>Datos privados del responsable</h3>
        </div>
        <div className="field-grid field-grid--triple">
          <TextField
            id="contactName"
            label="Nombre del responsable"
            value={form.contactName}
            onChange={(value) => setField('contactName', value)}
            error={errors.contactName}
            placeholder="Nombre y apellido"
          />
          <TextField
            id="contactPhone"
            label="Teléfono"
            value={form.contactPhone}
            onChange={(value) => setField('contactPhone', value)}
            error={errors.contactPhone}
            placeholder="+57 300 000 0000"
            autoComplete="tel"
          />
          <TextField
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
        <SelectField
          id="contactPreference"
          label="Preferencia de contacto"
          value={form.contactPreference}
          onChange={(value) => setField('contactPreference', value)}
          options={CONTACT_PREFERENCE_OPTIONS}
        />
        <ToggleField
          id="publishingAuthorization"
          label="Tengo autorización para publicar esta propiedad"
          description={canPublishDirectly ? 'La publicación podrá quedar visible directamente.' : 'La publicación será enviada a revisión.'}
          checked={form.publishingAuthorization}
          onChange={(value) => setField('publishingAuthorization', value)}
        />
        {errors.publishingAuthorization ? <small className="field-error">{errors.publishingAuthorization}</small> : null}
      </div>
    </div>
  );
}
