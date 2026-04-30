import React from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingState } from '../../components/ui/LoadingState';
import { ApplicationStepper } from './components/ApplicationStepper';
import { ApplicationPropertySummary } from './components/ApplicationPropertySummary';
import { usePropertyDetails } from './usePropertyDetails';

export function ApplyStartPage() {
  const { id: propertyId } = useParams();
  const { property, loading, error } = usePropertyDetails(propertyId);

  if (loading) {
    return <LoadingState label="Preparando el flujo de arriendo..." />;
  }

  if (!property) {
    return (
      <EmptyState
        title="No pudimos abrir este flujo"
        description={error || 'La propiedad ya no esta disponible para aplicar.'}
      />
    );
  }

  return (
    <div className="page application-page">
      <section className="section">
        <ApplicationStepper currentStep="start" />

        <div className="application-layout">
          <div className="application-layout__main">
            <div className="content-card application-hero-card">
              <span className="section__eyebrow">Arrendar con NIDO</span>
              <h1>Un proceso claro desde el primer clic</h1>
              <p>
                Antes de pedir documentos, te mostramos costos, requisitos y el tiempo estimado del
                proceso. Aplicar es gratis y la evaluacion sigue reglas claras.
              </p>

              <div className="application-hero-card__checks">
                <div>
                  <ShieldCheck size={18} />
                  <span>No cobramos estudio de viabilidad.</span>
                </div>
                <div>
                  <ShieldCheck size={18} />
                  <span>Te diremos por que pedimos cada documento.</span>
                </div>
                <div>
                  <ShieldCheck size={18} />
                  <span>Si necesitas respaldo, lo veras desde el inicio.</span>
                </div>
              </div>
            </div>

            <div className="content-card">
              <span className="section__eyebrow">Que vas a ver</span>
              <div className="application-overview-list">
                <div>
                  <strong>1. Precalificacion instantanea</strong>
                  <p>Respondes 4 preguntas y obtienes resultado inmediato.</p>
                </div>
                <div>
                  <strong>2. Documentos segun tu perfil</strong>
                  <p>Solo pedimos lo necesario segun tu ocupacion y respaldo.</p>
                </div>
                <div>
                  <strong>3. Revision y trazabilidad</strong>
                  <p>Veras el estado del proceso sin arbitrariedad ni pasos ocultos.</p>
                </div>
              </div>

              <div className="application-actions">
                <Link to={`/properties/${property.id}`} className="button button--secondary">
                  <ArrowLeft size={16} />
                  Volver al inmueble
                </Link>
                <Link to={`/properties/${property.id}/apply/prequal`} className="button">
                  Ver si califico
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          <ApplicationPropertySummary property={property} />
        </div>
      </section>
    </div>
  );
}
