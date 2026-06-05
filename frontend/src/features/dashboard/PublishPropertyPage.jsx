import React, { useMemo, useState } from 'react';
import { CheckCircle2, FileText, ImagePlus, ShieldCheck } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { useAuth } from '../../app/providers/useAuth';
import { api } from '../../lib/apiClient';
import { PropertyForm } from '../properties/PropertyForm';

function PublishGuidanceCard({ icon: Icon, title, description }) {
  return (
    <article className="publish-guidance-card">
      <span>
        <Icon size={18} aria-hidden="true" />
      </span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </article>
  );
}

export function PublishPropertyPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const editingProperty = location.state?.property || null;
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState('success');

  const copy = useMemo(
    () =>
      editingProperty
        ? {
            eyebrow: 'Edicion de publicacion',
            title: 'Editar propiedad',
            description:
              'Actualiza la informacion de tu inmueble y guarda los cambios para mantener la publicacion clara y confiable.',
          }
        : {
            eyebrow: 'Panel arrendador',
            title: 'Publicar propiedad',
            description:
              'Completa la informacion de tu inmueble para que los usuarios puedan conocerlo y reservarlo con confianza.',
          },
    [editingProperty]
  );

  const handleSubmitProperty = async (payload) => {
    setSubmitting(true);
    setMessage('');

    try {
      const isPublicationSubmit = payload.status && payload.status !== 'DRAFT';
      const response = editingProperty
        ? await api.patch(`/properties/${editingProperty.id}`, payload)
        : await api.post('/properties', payload);

      const successMessage = editingProperty
        ? 'Propiedad actualizada correctamente.'
        : response.message || 'Publicacion guardada correctamente.';

      setMessageTone('success');
      setMessage(successMessage);

      if (isPublicationSubmit || editingProperty) {
        navigate('/manage', {
          state: {
            tone: 'success',
            message: isPublicationSubmit
              ? 'Publicacion enviada correctamente. Puedes revisar su estado aqui.'
              : successMessage,
          },
        });
      }

      return true;
    } catch (requestError) {
      setMessageTone('danger');
      setMessage(requestError.message);
      throw requestError;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page page--publish">
      <section className="section">
        <div className="section__heading landlord-page-heading">
          <div>
            <span className="section__eyebrow">{copy.eyebrow}</span>
            <h1>{copy.title}</h1>
            <p>{copy.description}</p>
          </div>
          <Link className="button button--secondary" to="/manage">
            Mis propiedades
          </Link>
        </div>

        <InlineMessage tone={messageTone}>{message}</InlineMessage>

        <div className="dashboard-layout publish-layout">
          <div className="dashboard-layout__form publish-layout__form">
            <PropertyForm
              property={editingProperty}
              submitting={submitting}
              onCancel={() => navigate('/manage')}
              onSubmit={handleSubmitProperty}
              canPublishDirectly={isAdmin}
            />
          </div>

          <aside className="publish-layout__aside publish-guidance" aria-label="Guia de publicacion">
            <PublishGuidanceCard
              icon={FileText}
              title="Informacion completa"
              description="El titulo, la ubicacion, el precio y las reglas ayudan a reducir preguntas repetidas."
            />
            <PublishGuidanceCard
              icon={ImagePlus}
              title="Fotos verificables"
              description="Sube minimo tres imagenes. La primera foto queda como imagen principal de la publicacion."
            />
            <PublishGuidanceCard
              icon={ShieldCheck}
              title="Revision segura"
              description="Los arrendadores envian propiedades a revision; el equipo NIDO valida antes de publicar."
            />
            <div className="publish-guidance-note">
              <CheckCircle2 size={18} aria-hidden="true" />
              <span>El borrador se guarda temporalmente en este navegador mientras completas el formulario.</span>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
