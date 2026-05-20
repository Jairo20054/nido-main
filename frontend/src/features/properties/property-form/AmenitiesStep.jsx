import React from 'react';
import { CheckboxGroup } from './FormControls';

const SERVICE_OPTIONS = ['Agua', 'Energía', 'Gas', 'Internet'];

const AMENITY_OPTIONS = [
  { field: 'elevator', label: 'Ascensor' },
  { field: 'guardedAccess', label: 'Portería / seguridad' },
  { field: 'balcony', label: 'Balcón' },
  { field: 'equippedKitchen', label: 'Cocina integral' },
  { field: 'laundryArea', label: 'Zona de ropas' },
];

export function AmenitiesStep({ form, setField, toggleListValue }) {
  const toggleAmenity = (field) => {
    if (field === 'guardedAccess') {
      const nextValue = !(form.doorman || form.security);
      setField('doorman', nextValue, { security: nextValue });
      return;
    }

    setField(field, !form[field]);
  };

  const isAmenityActive = (field) => {
    if (field === 'guardedAccess') {
      return form.doorman || form.security;
    }

    return Boolean(form[field]);
  };

  return (
    <div className="form-step property-step">
      <div className="property-step__heading">
        <span>Servicios y comodidades</span>
        <h3>Marca solo lo que realmente ayuda a decidir</h3>
        <p>Reducimos la lista a servicios básicos y comodidades fáciles de verificar.</p>
      </div>

      <CheckboxGroup
        label="Servicios disponibles"
        options={SERVICE_OPTIONS}
        selectedValues={form.servicesIncluded}
        onToggle={(value) => toggleListValue('servicesIncluded', value)}
      />

      <div className="field-group property-field">
        <span className="property-field__label">Comodidades principales</span>
        <div className="chip-group">
          {AMENITY_OPTIONS.map((option) => {
            const active = isAmenityActive(option.field);

            return (
              <button
                key={option.field}
                className={`select-chip ${active ? 'select-chip--active' : ''}`}
                type="button"
                aria-pressed={active}
                onClick={() => toggleAmenity(option.field)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
