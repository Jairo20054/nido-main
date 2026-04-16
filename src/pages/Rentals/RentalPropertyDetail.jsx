import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { COLOMBIA_PROPERTIES, PROCESS_STAGES } from '../../features/rentals/data/properties';
import { formatCurrencyCOP } from '../../features/rentals/utils/rentalFormatters';
import './RentalPropertyDetail.css';

export default function RentalPropertyDetail() {
  const { id } = useParams();
  const [contactStatus, setContactStatus] = useState('idle');

  const property = useMemo(
    () => COLOMBIA_PROPERTIES.find(item => item.id === id),
    [id]
  );

  if (!property) {
    return (
      <div className="rental-detail-empty">
        <h1>Inmueble no encontrado</h1>
        <p>Este inmueble ya no está disponible o el enlace no es válido.</p>
      </div>
    );
  }

  return (
    <main className="rental-detail-page">
      <img src={property.image} alt={property.title} className="hero-image" />

      <section className="detail-main">
        <article className="detail-card">
          <h1>{property.title}</h1>
          <p>{property.city} · {property.neighborhood}</p>
          <strong>{formatCurrencyCOP(property.price)} / mes</strong>
          <p>Administración: {formatCurrencyCOP(property.adminFee)}</p>

          <h2>Condiciones del inmueble</h2>
          <ul>
            <li>{property.type}</li>
            <li>{property.area} m²</li>
            <li>{property.bedrooms} habitaciones</li>
            <li>{property.bathrooms} baños</li>
            <li>Estrato {property.estrato}</li>
            <li>{property.petFriendly ? 'Apto para mascotas' : 'No apto para mascotas'}</li>
          </ul>

          <h2>Servicios incluidos</h2>
          <ul>
            {property.services.map(service => (
              <li key={service}>{service}</li>
            ))}
          </ul>

          <h2>Descripción</h2>
          <p>{property.description}</p>
        </article>

        <aside className="detail-sidebar">
          <article>
            <h3>Indicadores de confianza</h3>
            <p>Score: <strong>{property.trust.score}/100</strong></p>
            <ul>
              <li>Arrendador verificado: {property.trust.verifiedOwner ? 'Sí' : 'Pendiente'}</li>
              <li>Documentos legales: {property.trust.legalDocs ? 'Completos' : 'Faltantes'}</li>
              <li>Control antifraude: {property.trust.antiFraud ? 'Activo' : 'Parcial'}</li>
            </ul>
          </article>

          <article>
            <h3>Solicitar arrendamiento</h3>
            <p>Envía tu interés y continúa con validación documental estandarizada.</p>
            <button
              type="button"
              onClick={() => setContactStatus('sent')}
              disabled={contactStatus === 'sent'}
            >
              {contactStatus === 'sent' ? 'Solicitud enviada' : 'Contactar arrendador'}
            </button>
          </article>
        </aside>
      </section>

      <section className="detail-process">
        <h2>Estados del proceso</h2>
        <ol>
          {PROCESS_STAGES.map(stage => (
            <li key={stage.key} className={property.processStatus === stage.key ? 'active' : ''}>
              <strong>{stage.label}</strong>
              <span>{stage.description}</span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
