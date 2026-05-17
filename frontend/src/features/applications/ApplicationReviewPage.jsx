import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Clock3, ShieldCheck } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingState } from '../../components/ui/LoadingState';
import { ApplicationStepper } from './components/ApplicationStepper';
import { ApplicationPropertySummary } from './components/ApplicationPropertySummary';
import { ApplicationStatusBadge } from './components/ApplicationStatusBadge';
import { ReviewTimeline } from './components/ReviewTimeline';
import { getApplicationDraft } from './applicationDraft';
import { usePropertyDetails } from './usePropertyDetails';

const mapRequestStatusToApplicationStatus = (requestStatus) => {
  if (requestStatus === 'APPROVED') {
    return 'approved';
  }

  if (requestStatus === 'REJECTED') {
    return 'rejected';
  }

  return 'in_review';
};

export function ApplicationReviewPage() {
  const navigate = useNavigate();
  const { id: propertyId } = useParams();
  const { property, loading, error } = usePropertyDetails(propertyId);
  const [draft, setDraft] = useState(() => getApplicationDraft(propertyId));

  useEffect(() => {
    setDraft(getApplicationDraft(propertyId));
  }, [propertyId]);

  const request = draft?.submittedRequest || null;
  const applicationStatus = mapRequestStatusToApplicationStatus(request?.status);

  const timelineItems = useMemo(() => {
    if (!draft) {
      return [];
    }

    return [
      {
        id: 'received',
        status: 'done',
        title: 'Solicitud recibida',
        description: 'Tu postulación ya quedó registrada en el flujo de la propiedad.',
        meta: request?.createdAt ? new Date(request.createdAt).toLocaleString('es-CO') : 'Lista',
      },
      {
        id: 'documents',
        status: 'done',
        title: 'Documentos listos',
        description: `${(draft.documentChecklist || []).filter((item) => item.status === 'uploaded').length} documentos marcados como listos para revisión.`,
        meta: 'Con explicacion y formato visible',
      },
      {
        id: 'score',
        status: 'done',
        title: 'Score base generado',
        description: `Tu score base fue ${draft.prequalification?.score || 0}/100 con riesgo ${draft.prequalification?.riskBand || 'medio'}.`,
        meta: 'Motor de precalificación inicial',
      },
      {
        id: 'review',
        status: request?.status === 'PENDING' || !request ? 'current' : 'done',
        title:
          request?.status === 'APPROVED'
            ? 'Revision completada'
            : request?.status === 'REJECTED'
              ? 'Revision cerrada'
              : 'En revisión',
        description:
          request?.status === 'APPROVED'
            ? 'La solicitud fue aprobada en el MVP actual.'
            : request?.status === 'REJECTED'
              ? 'La solicitud fue cerrada por el propietario o el equipo revisor.'
              : 'Ahora sigue una validación manual para confirmar consistencia y avanzar al siguiente paso.',
        meta: 'Trazabilidad visible en este panel',
      },
    ];
  }, [draft, request]);

  if (loading) {
    return <LoadingState label="Cargando estado de tu solicitud..." />;
  }

  if (!property) {
    return (
      <EmptyState
        title="No pudimos cargar el estado"
        description={error || 'La propiedad ya no está disponible.'}
      />
    );
  }

  if (!draft?.prequalification || !request) {
    return (
      <EmptyState
        title="Aun no has enviado tu solicitud"
        description="Completa documentos y envía el caso para que podamos mostrarte el estado."
        actionLabel="Ir a documentos"
        onAction={() => navigate(`/properties/${property.id}/apply/documents`)}
      />
    );
  }

  return (
    <div className="page application-page">
      <section className="section">
        <ApplicationStepper currentStep="review" />

        <div className="application-layout">
          <div className="application-layout__main">
            <div className="content-card application-review-hero">
              <div>
                <span className="section__eyebrow">Estado de la solicitud</span>
                <h1>Seguimiento claro y sin pasos ocultos</h1>
                <p>
                  En este MVP, la revisión final sigue siendo manual, pero ya conservamos
                  precalificación, contexto y trazabilidad del caso.
                </p>
              </div>
              <ApplicationStatusBadge status={applicationStatus} />
            </div>

            <div className="content-card">
              <div className="application-banner">
                <Clock3 size={16} />
                <span>Tiempo estimado de revisión inicial: 1 a 2 días hábiles.</span>
              </div>

              <ReviewTimeline items={timelineItems} />
            </div>

            <div className="content-card application-next-step-card">
              <div>
                <span className="section__eyebrow">Siguiente paso</span>
                <h2>
                  {request.status === 'APPROVED'
                    ? 'Tu solicitud ya fue aprobada'
                    : request.status === 'REJECTED'
                      ? 'Esta solicitud se cerro'
                      : 'Tu expediente ya está en cola de revisión'}
                </h2>
                <p>
                  {request.status === 'APPROVED'
                    ? 'El siguiente bloque del blueprint es contrato, firma y pago protegido.'
                    : request.status === 'REJECTED'
                      ? 'Puedes explorar otras opciones o ajustar presupuesto y respaldo.'
                      : 'Todavía no hay automatización de contrato en este stack, pero el flujo ya deja lista la entrada para esa fase.'}
                </p>
              </div>

              <div className="application-next-step-card__actions">
                <div className="application-banner">
                  <ShieldCheck size={16} />
                  <span>Aplicar sigue siendo gratis y con contexto guardado.</span>
                </div>

                {request.status === 'REJECTED' ? (
                  <Link to="/properties" className="button">
                    Ver otras propiedades
                  </Link>
                ) : (
                  <Link to="/account" className="button">
                    Ir a mi cuenta
                    <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            </div>
          </div>

          <ApplicationPropertySummary
            property={property}
            prequalification={draft.prequalification}
          />
        </div>
      </section>
    </div>
  );
}
