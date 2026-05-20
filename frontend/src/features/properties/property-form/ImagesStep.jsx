import React from 'react';
import { PropertyMediaManager } from '../PropertyMediaManager';

export function ImagesStep({ form, setField }) {
  return (
    <div className="form-step property-step">
      <div className="property-step__heading">
        <span>Imágenes</span>
        <h3>Sube fotos claras y ordenalas</h3>
        <p>La primera imagen será la portada. Puedes cambiar el orden antes de enviar la publicación.</p>
      </div>
      <PropertyMediaManager media={form.media} onChange={(value) => setField('media', value)} />
    </div>
  );
}
