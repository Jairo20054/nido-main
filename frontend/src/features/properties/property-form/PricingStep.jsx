import React from 'react';
import { TextField, ToggleField } from './FormControls';

export function PricingStep({ errors, form, setField }) {
  return (
    <div className="form-step property-step">
      <div className="property-step__heading">
        <span>Precio y condiciones</span>
        <h3>Define el valor y la disponibilidad</h3>
        <p>Mostramos solo los campos que aplican para arriendo y ocultamos los que no hacen falta.</p>
      </div>

      <div className="field-grid">
        <TextField
          id="monthlyRent"
          label="Valor mensual del arriendo"
          required
          type="number"
          min="0"
          inputMode="numeric"
          value={form.monthlyRent}
          onChange={(value) => setField('monthlyRent', value)}
          error={errors.monthlyRent}
          placeholder="2500000"
        />
        <ToggleField
          id="administrationIncluded"
          label="Administración incluida"
          description="Si está incluida, no pediremos un valor adicional."
          checked={form.administrationIncluded}
          onChange={(value) =>
            setField('administrationIncluded', value, value ? { maintenanceFee: '' } : undefined)
          }
        />
      </div>

      {!form.administrationIncluded ? (
        <TextField
          id="maintenanceFee"
          label="Valor de administración"
          type="number"
          min="0"
          inputMode="numeric"
          value={form.maintenanceFee}
          onChange={(value) => setField('maintenanceFee', value)}
          error={errors.maintenanceFee}
          placeholder="350000"
          help="Dejalo en blanco si no aplica."
        />
      ) : null}

      <div className="field-grid">
        <ToggleField
          id="depositRequired"
          label="Requiere depósito"
          description="Actívalo solo si el propietario solicita depósito."
          checked={form.depositRequired}
          onChange={(value) => setField('depositRequired', value, value ? undefined : { securityDeposit: '' })}
        />
        {form.depositRequired ? (
          <TextField
            id="securityDeposit"
            label="Valor del depósito"
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

      <div className="field-grid">
        <TextField
          id="minLeaseMonths"
          label="Duración mínima del contrato"
          type="number"
          min="1"
          inputMode="numeric"
          value={form.minLeaseMonths}
          onChange={(value) => setField('minLeaseMonths', value)}
          error={errors.minLeaseMonths}
          help="En meses."
        />
        <ToggleField
          id="availableImmediately"
          label="Disponibilidad inmediata"
          description="Si está activa, no necesitas indicar fecha."
          checked={form.availableImmediately}
          onChange={(value) => setField('availableImmediately', value, value ? { availableFrom: '' } : undefined)}
        />
      </div>

      {!form.availableImmediately ? (
        <TextField
          id="availableFrom"
          label="Fecha disponible"
          type="date"
          value={form.availableFrom}
          onChange={(value) => setField('availableFrom', value)}
          error={errors.availableFrom}
        />
      ) : null}
    </div>
  );
}
