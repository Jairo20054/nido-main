import React from 'react';
import { PropertyMediaManager } from '../PropertyMediaManager';

export function ImagesStep({ form, setField }) {
  return (
    <div className="form-step property-step">
      <div className="property-step__heading">
        <span>Imagenes</span>
        <h3>Sube fotos claras y ordenalas</h3>
        <p>La primera imagen sera la portada. Puedes cambiar el orden antes de enviar la publicacion.</p>
      </div>
      <PropertyMediaManager media={form.media} onChange={(value) => setField('media', value)} />
    </div>
  );
}
