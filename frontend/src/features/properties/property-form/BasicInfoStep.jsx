import React from 'react';
import { PROPERTY_TYPE_OPTIONS, RENTAL_TYPE_OPTIONS } from '../../../lib/constants';
import { SelectField, TextField } from './FormControls';

export function BasicInfoStep({ errors, form, setField }) {
  return (
    <div className="form-step property-step">
      <div className="property-step__heading">
        <span>Informacion basica</span>
        <h3>Cuenta lo esencial de la vivienda</h3>
        <p>Usa un titulo concreto y una descripcion facil de leer. Lo demas lo completaremos por secciones.</p>
      </div>

      <TextField
        id="title"
        label="Titulo de la propiedad"
        required
        value={form.title}
        onChange={(value) => setField('title', value)}
        error={errors.title}
        placeholder="Ej. Apartamento iluminado cerca de la 93"
        maxLength={100}
      />

      <div className="field-grid field-grid--triple">
        <SelectField
          id="propertyType"
          label="Tipo de propiedad"
          required
          value={form.propertyType}
          onChange={(value) => setField('propertyType', value)}
          options={PROPERTY_TYPE_OPTIONS}
          error={errors.propertyType}
        />
        <SelectField
          id="rentalType"
          label="Modalidad"
          required
          value={form.rentalType}
          onChange={(value) => setField('rentalType', value)}
          options={RENTAL_TYPE_OPTIONS}
        />
        <TextField
          id="operationType"
          label="Operacion"
          value="Arriendo"
          onChange={() => undefined}
          disabled
          help="NIDO actualmente publica propiedades para arriendo."
        />
      </div>

      <TextField
        id="summary"
        label="Descripcion breve"
        required
        multiline
        rows={3}
        value={form.summary}
        onChange={(value) => setField('summary', value)}
        error={errors.summary}
        placeholder="Resume en una frase lo mas atractivo de la vivienda."
        maxLength={180}
      />

      <TextField
        id="description"
        label="Descripcion completa"
        required
        multiline
        rows={6}
        value={form.description}
        onChange={(value) => setField('description', value)}
        error={errors.description}
        placeholder="Describe distribucion, iluminacion, acabados, entorno y beneficios para quien va a vivir alli."
        maxLength={4000}
      />
    </div>
  );
}
