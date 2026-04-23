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
        description: 'Tu aplicacion ya quedo registrada en el flujo del inmueble.',
        meta: request?.createdAt ? new Date(request.createdAt).toLocaleString('es-CO') : 'Lista',
      },
      {
        id: 'documents',
        status: 'done',
        title: 'Documentos listos',
        description: `${(draft.documentChecklist || []).filter((item) => item.status === 'uploaded').length} documentos marcados como listos para revision.`,
        meta: 'Con explicacion y formato visible',
      },
      {
        id: 'score',
        status: 'done',
        title: 'Score base generado',
        description: `Tu score base fue ${draft.prequalification?.score || 0}/100 con riesgo ${draft.prequalification?.riskBand || 'medio'}.`,
        meta: 'Motor de precalificacion inicial',
      },
      {
        id: 'review',
        status: request?.status === 'PENDING' || !request ? 'current' : 'done',
        title:
          request?.status === 'APPROVED'
            ? 'Revision completada'
            : request?.status === 'REJECTED'
              ? 'Revision cerrada'
              : 'En revision',
        description:
          request?.status === 'APPROVED'
            ? 'La solicitud fue aprobada en el MVP actual.'
            : request?.status === 'REJECTED'
              ? 'La solicitud fue cerrada por el propietario o el equipo revisor.'
              : 'Ahora sigue una validacion manual para confirmar consistencia y avanzar al siguiente paso.',
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
        description={error || 'La propiedad ya no esta disponible.'}
      />
    );
  }

  if (!draft?.prequalification || !request) {
    return (
      <EmptyState
        title="Aun no has enviado tu solicitud"
        description="Completa documentos y envia el caso para que podamos mostrarte el estado."
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
                  En este MVP, la revision final sigue siendo manual, pero ya conservamos
                  precalificacion, contexto y trazabilidad del caso.
                </p>
              </div>
              <ApplicationStatusBadge status={applicationStatus} />
            </div>

            <div className="content-card">
              <div className="application-banner">
                <Clock3 size={16} />
                <span>Tiempo estimado de revision inicial: 1 a 2 dias habiles.</span>
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
                      : 'Tu expediente ya esta en cola de revision'}
                </h2>
                <p>
                  {request.status === 'APPROVED'
                    ? 'El siguiente bloque del blueprint es contrato, firma y pago protegido.'
                    : request.status === 'REJECTED'
                      ? 'Puedes explorar otras opciones o ajustar presupuesto y respaldo.'
                      : 'Todavia no hay automatizacion de contrato en este stack, pero el flujo ya deja lista la entrada para esa fase.'}
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
