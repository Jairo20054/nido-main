import React, { useMemo } from 'react';
import { SelectField, TextField, ToggleField } from './FormControls';
import { getCitiesForDepartment, getCountryOptions, getDepartmentsForCountry } from './locations';

export function LocationStep({ errors, form, onCountryChange, onDepartmentChange, setField }) {
  const countries = useMemo(() => getCountryOptions(), []);
  const departments = useMemo(() => getDepartmentsForCountry(form.country), [form.country]);
  const cities = useMemo(() => getCitiesForDepartment(form.country, form.department), [form.country, form.department]);

  return (
    <div className="form-step property-step">
      <div className="property-step__heading">
        <span>Ubicacion</span>
        <h3>Guia la busqueda por zona</h3>
        <p>La direccion exacta puede mantenerse privada. Para publicar basta con una zona clara y verificable.</p>
      </div>

      <div className="field-grid field-grid--triple">
        <SelectField
          id="country"
          label="Pais"
          required
          value={form.country}
          onChange={onCountryChange}
          options={countries}
          error={errors.country}
          placeholder="Selecciona el pais"
        />
        <SelectField
          id="department"
          label="Departamento / Estado"
          required
          value={form.department}
          onChange={onDepartmentChange}
          options={departments.map((department) => department.name)}
          disabled={!form.country}
          error={errors.department}
          placeholder={form.country ? 'Selecciona una opcion' : 'Selecciona primero el pais'}
        />
        <SelectField
          id="city"
          label="Ciudad"
          required
          value={form.city}
          onChange={(value) => setField('city', value)}
          options={cities}
          disabled={!form.department}
          error={errors.city}
          placeholder={form.department ? 'Selecciona la ciudad' : 'Selecciona primero el departamento'}
        />
      </div>

      <div className="field-grid">
        <TextField
          id="addressLine"
          label="Direccion aproximada o barrio / zona"
          required
          value={form.addressLine}
          onChange={(value) => setField('addressLine', value)}
          error={errors.addressLine}
          placeholder="Ej. Chico Norte, cerca del Parque de la 93"
          maxLength={160}
        />
        <TextField
          id="neighborhood"
          label="Barrio o sector especifico"
          value={form.neighborhood}
          onChange={(value) => setField('neighborhood', value)}
          placeholder="Ej. Chico Norte"
          maxLength={80}
        />
      </div>

      <div className="field-grid">
        <TextField
          id="addressDetail"
          label="Referencia privada opcional"
          value={form.addressDetail}
          onChange={(value) => setField('addressDetail', value)}
          placeholder="Torre, conjunto o indicacion interna"
          maxLength={160}
        />
        <ToggleField
          id="hideExactAddress"
          label="Ocultar direccion exacta"
          description="Solo se mostrara la zona general a los interesados."
          checked={form.hideExactAddress}
          onChange={(value) => setField('hideExactAddress', value)}
        />
      </div>

      <TextField
        id="zoneReference"
        label="Referencia cercana"
        multiline
        rows={3}
        value={form.zoneReference}
        onChange={(value) => setField('zoneReference', value)}
        placeholder="Cerca de transporte, parques, universidades, comercio o vias principales."
        maxLength={180}
      />
    </div>
  );
}
