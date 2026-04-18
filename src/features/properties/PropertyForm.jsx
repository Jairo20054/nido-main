import React, { useEffect, useMemo, useState } from 'react';
import { PROPERTY_TYPE_OPTIONS } from '../../lib/constants';
import { InlineMessage } from '../../components/ui/InlineMessage';

const emptyForm = {
  title: '',
  summary: '',
  description: '',
  propertyType: 'APARTMENT',
  status: 'PUBLISHED',
  city: '',
  neighborhood: '',
  addressLine: '',
  monthlyRent: '',
  maintenanceFee: '',
  securityDeposit: '',
  bedrooms: 1,
  bathrooms: 1,
  areaM2: '',
  parkingSpots: 0,
  maxOccupants: 2,
  furnished: false,
  petsAllowed: false,
  availableFrom: '',
  minLeaseMonths: 12,
  amenities: '',
  images: '',
};

const toFormState = (property) => {
  if (!property) return emptyForm;

  return {
    title: property.title,
    summary: property.summary,
    description: property.description,
    propertyType: property.propertyType,
    status: property.status,
    city: property.city,
    neighborhood: property.neighborhood || '',
    addressLine: property.addressLine,
    monthlyRent: property.monthlyRent,
    maintenanceFee: property.maintenanceFee,
    securityDeposit: property.securityDeposit,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    areaM2: property.areaM2,
    parkingSpots: property.parkingSpots,
    maxOccupants: property.maxOccupants,
    furnished: property.furnished,
    petsAllowed: property.petsAllowed,
    availableFrom: property.availableFrom?.slice(0, 10) || '',
    minLeaseMonths: property.minLeaseMonths,
    amenities: property.amenities.join(', '),
    images: property.images.map((image) => image.url).join('\n'),
  };
};

export function PropertyForm({ property, submitting, onCancel, onSubmit }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(toFormState(property));
    setError('');
  }, [property]);

  const heading = useMemo(() => (property ? 'Editar propiedad' : 'Publicar nueva propiedad'), [property]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.title.trim().length < 8 || form.summary.trim().length < 20 || form.description.trim().length < 80) {
      setError('Completa titulo, resumen y descripcion con suficiente contexto.');
      return;
    }

    if (!form.images.split('\n').map((item) => item.trim()).filter(Boolean).length) {
      setError('Agrega al menos una imagen URL para publicar la propiedad.');
      return;
    }

    setError('');
    await onSubmit({
      ...form,
      monthlyRent: Number(form.monthlyRent),
      maintenanceFee: Number(form.maintenanceFee || 0),
      securityDeposit: Number(form.securityDeposit || 0),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      areaM2: Number(form.areaM2),
      parkingSpots: Number(form.parkingSpots || 0),
      maxOccupants: Number(form.maxOccupants),
      minLeaseMonths: Number(form.minLeaseMonths),
      amenities: form.amenities
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      images: form.images
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),
    });
  };

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="form-card__header">
        <h3>{heading}</h3>
        <p>Solo dejamos los campos necesarios para publicar un arriendo claro y accionable.</p>
      </div>
      <InlineMessage tone="danger">{error}</InlineMessage>

      <div className="field-group">
        <label htmlFor="title">Titulo</label>
        <input id="title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
      </div>

      <div className="field-group">
        <label htmlFor="summary">Resumen</label>
        <textarea
          id="summary"
          rows="3"
          value={form.summary}
          onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))}
        />
      </div>

      <div className="field-group">
        <label htmlFor="description">Descripcion</label>
        <textarea
          id="description"
          rows="6"
          value={form.description}
          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
        />
      </div>

      <div className="field-grid field-grid--triple">
        <div className="field-group">
          <label htmlFor="propertyType">Tipo</label>
          <select
            id="propertyType"
            value={form.propertyType}
            onChange={(event) => setForm((current) => ({ ...current, propertyType: event.target.value }))}
          >
            {PROPERTY_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field-group">
          <label htmlFor="status">Estado</label>
          <select id="status" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
            <option value="PUBLISHED">Publicada</option>
            <option value="DRAFT">Borrador</option>
            <option value="RENTED">Arrendada</option>
            <option value="ARCHIVED">Archivada</option>
          </select>
        </div>
        <div className="field-group">
          <label htmlFor="availableFrom">Disponible desde</label>
          <input
            id="availableFrom"
            type="date"
            value={form.availableFrom}
            onChange={(event) => setForm((current) => ({ ...current, availableFrom: event.target.value }))}
          />
        </div>
      </div>

      <div className="field-grid field-grid--triple">
        <div className="field-group">
          <label htmlFor="city">Ciudad</label>
          <input id="city" value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} />
        </div>
        <div className="field-group">
          <label htmlFor="neighborhood">Barrio</label>
          <input
            id="neighborhood"
            value={form.neighborhood}
            onChange={(event) => setForm((current) => ({ ...current, neighborhood: event.target.value }))}
          />
        </div>
        <div className="field-group">
          <label htmlFor="addressLine">Direccion</label>
          <input
            id="addressLine"
            value={form.addressLine}
            onChange={(event) => setForm((current) => ({ ...current, addressLine: event.target.value }))}
          />
        </div>
      </div>

      <div className="field-grid field-grid--triple">
        <div className="field-group">
          <label htmlFor="monthlyRent">Canon</label>
          <input
            id="monthlyRent"
            type="number"
            value={form.monthlyRent}
            onChange={(event) => setForm((current) => ({ ...current, monthlyRent: event.target.value }))}
          />
        </div>
        <div className="field-group">
          <label htmlFor="maintenanceFee">Administracion</label>
          <input
            id="maintenanceFee"
            type="number"
            value={form.maintenanceFee}
            onChange={(event) => setForm((current) => ({ ...current, maintenanceFee: event.target.value }))}
          />
        </div>
        <div className="field-group">
          <label htmlFor="securityDeposit">Deposito</label>
          <input
            id="securityDeposit"
            type="number"
            value={form.securityDeposit}
            onChange={(event) => setForm((current) => ({ ...current, securityDeposit: event.target.value }))}
          />
        </div>
      </div>

      <div className="field-grid field-grid--quad">
        <div className="field-group">
          <label htmlFor="bedrooms">Habitaciones</label>
          <input id="bedrooms" type="number" value={form.bedrooms} onChange={(event) => setForm((current) => ({ ...current, bedrooms: event.target.value }))} />
        </div>
        <div className="field-group">
          <label htmlFor="bathrooms">Banos</label>
          <input id="bathrooms" type="number" value={form.bathrooms} onChange={(event) => setForm((current) => ({ ...current, bathrooms: event.target.value }))} />
        </div>
        <div className="field-group">
          <label htmlFor="areaM2">Area m2</label>
          <input id="areaM2" type="number" value={form.areaM2} onChange={(event) => setForm((current) => ({ ...current, areaM2: event.target.value }))} />
        </div>
        <div className="field-group">
          <label htmlFor="maxOccupants">Max. ocupantes</label>
          <input
            id="maxOccupants"
            type="number"
            value={form.maxOccupants}
            onChange={(event) => setForm((current) => ({ ...current, maxOccupants: event.target.value }))}
          />
        </div>
      </div>

      <div className="field-grid">
        <div className="field-group">
          <label htmlFor="parkingSpots">Parqueaderos</label>
          <input
            id="parkingSpots"
            type="number"
            value={form.parkingSpots}
            onChange={(event) => setForm((current) => ({ ...current, parkingSpots: event.target.value }))}
          />
        </div>
        <div className="field-group">
          <label htmlFor="minLeaseMonths">Minimo de meses</label>
          <input
            id="minLeaseMonths"
            type="number"
            value={form.minLeaseMonths}
            onChange={(event) => setForm((current) => ({ ...current, minLeaseMonths: event.target.value }))}
          />
        </div>
      </div>

      <div className="field-grid">
        <label className="checkbox">
          <input
            type="checkbox"
            checked={form.furnished}
            onChange={(event) => setForm((current) => ({ ...current, furnished: event.target.checked }))}
          />
          Amoblado
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={form.petsAllowed}
            onChange={(event) => setForm((current) => ({ ...current, petsAllowed: event.target.checked }))}
          />
          Acepta mascotas
        </label>
      </div>

      <div className="field-group">
        <label htmlFor="amenities">Amenidades separadas por coma</label>
        <input
          id="amenities"
          value={form.amenities}
          onChange={(event) => setForm((current) => ({ ...current, amenities: event.target.value }))}
          placeholder="Porteria 24/7, Balcon, Cowork"
        />
      </div>

      <div className="field-group">
        <label htmlFor="images">URLs de imagen, una por linea</label>
        <textarea
          id="images"
          rows="5"
          value={form.images}
          onChange={(event) => setForm((current) => ({ ...current, images: event.target.value }))}
        />
      </div>

      <div className="form-card__actions">
        <button className="button" type="submit" disabled={submitting}>
          {submitting ? 'Guardando...' : property ? 'Guardar cambios' : 'Publicar propiedad'}
        </button>
        {onCancel ? (
          <button className="button button--secondary" type="button" onClick={onCancel}>
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  );
}
