import React from 'react';
import { TextField, ToggleField } from './FormControls';

export function FeaturesStep({ errors, form, setField }) {
  const showStrata = form.country === 'Colombia';

  return (
    <div className="form-step property-step">
      <div className="property-step__heading">
        <span>Características principales</span>
        <h3>Describe la vivienda con datos comparables</h3>
        <p>Estos campos ayudan a filtrar y comparar propiedades sin sobrecargar la publicacion.</p>
      </div>

      <div className="field-grid field-grid--quad">
        <TextField
          id="bedrooms"
          label="Habitaciones"
          type="number"
          min="0"
          value={form.bedrooms}
          onChange={(value) => setField('bedrooms', value)}
          error={errors.bedrooms}
        />
        <TextField
          id="bathrooms"
          label="Baños"
          type="number"
          min="1"
          value={form.bathrooms}
          onChange={(value) => setField('bathrooms', value)}
          error={errors.bathrooms}
        />
        <TextField
          id="areaM2"
          label="Área en m²"
          required
          type="number"
          min="1"
          value={form.areaM2}
          onChange={(value) => setField('areaM2', value)}
          error={errors.areaM2}
        />
        <TextField
          id="parkingSpots"
          label="Parqueaderos"
          type="number"
          min="0"
          value={form.parkingSpots}
          onChange={(value) => setField('parkingSpots', value)}
          error={errors.parkingSpots}
        />
      </div>

      <div className="field-grid field-grid--triple">
        <TextField
          id="floor"
          label="Piso"
          type="number"
          min="0"
          value={form.floor}
          onChange={(value) => setField('floor', value)}
          error={errors.floor}
          placeholder="Opcional"
        />
        {showStrata ? (
          <TextField
            id="strata"
            label="Estrato"
            type="number"
            min="1"
            max="6"
            value={form.strata}
            onChange={(value) => setField('strata', value)}
            error={errors.strata}
            placeholder="Opcional"
          />
        ) : null}
        <ToggleField
          id="furnished"
          label="Amoblado"
          description="La vivienda se entrega con mobiliario principal."
          checked={form.furnished}
          onChange={(value) => setField('furnished', value)}
        />
      </div>

      <div className="toggle-list">
        <ToggleField
          id="petsAllowed"
          label="Mascotas permitidas"
          description="Indica si aceptas mascotas en la propiedad."
          checked={form.petsAllowed}
          onChange={(value) => setField('petsAllowed', value)}
        />
      </div>
    </div>
  );
}
