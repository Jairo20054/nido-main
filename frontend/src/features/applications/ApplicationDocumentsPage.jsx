import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { EmptyState } from '../../components/ui/EmptyState';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { LoadingState } from '../../components/ui/LoadingState';
import { useAuth } from '../../app/providers/AuthProvider';
import { api } from '../../lib/apiClient';
import { ApplicationStepper } from './components/ApplicationStepper';
import { ApplicationPropertySummary } from './components/ApplicationPropertySummary';
import { DocumentRequirementCard } from './components/DocumentRequirementCard';
import { getApplicationDraft, mergeApplicationDraft } from './applicationDraft';
import { usePropertyDetails } from './usePropertyDetails';

const buildRequestMessage = (message, draft) => {
  const base = message.trim();
  const summary = [
    'Resumen NIDO',
    `resultado: ${draft.prequalification?.result || 'eligible'}`,
    `score: ${draft.prequalification?.score || 0}`,
    `ocupacion: ${draft.prequalForm?.occupationType || 'EMPLOYEE'}`,
    `documentos: ${(draft.documentChecklist || []).filter((item) => item.status === 'uploaded').length}/${(draft.documentChecklist || []).length}`,
    `respaldo: ${draft.prequalForm?.hasBackup ? draft.prequalForm?.backupOption || 'si' : 'no'}`,
  ].join(' | ');

  return `${base}\n\n${summary}`.slice(0, 1000);
};

const getExtension = (fileName = '') => fileName.split('.').pop()?.toUpperCase() || '';

const validateDocumentFile = (document, file) => {
  const extension = getExtension(file.name);
  const isAccepted = (document.formats || []).includes(extension);

  if (!isAccepted) {
    return {
      status: 'requires_correction',
      validationMessage: `Este archivo no coincide con los formatos aceptados: ${(document.formats || []).join(', ')}.`,
    };
  }

  if (file.size < 30_000) {
    return {
      status: 'requires_correction',
      validationMessage: 'La imagen o PDF parece incompleto. Intenta subir un archivo mas claro.',
    };
  }

  if (file.size > 15 * 1024 * 1024) {
    return {
      status: 'requires_correction',
      validationMessage: 'El archivo supera el maximo recomendado de 15 MB.',
    };
  }

  return {
    status: 'uploaded',
    validationMessage: 'Archivo listo para revision.',
  };
};

export function ApplicationDocumentsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { id: propertyId } = useParams();
  const { property, loading, error } = usePropertyDetails(propertyId);
  const [draft, setDraft] = useState(() => getApplicationDraft(propertyId));
  const [profile, setProfile] = useState({
    desiredMoveIn: '',
    leaseMonths: 12,
    phone: '',
    message: '',
    hasPets: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const nextDraft = getApplicationDraft(propertyId);
    setDraft(nextDraft);

    if (nextDraft?.applicantProfile) {
      setProfile((current) => ({
        ...current,
        ...nextDraft.applicantProfile,
      }));
    } else if (user?.phone) {
      setProfile((current) => ({
        ...current,
        phone: user.phone,
      }));
    }
  }, [propertyId, user?.phone]);

  const uploadedCount = useMemo(
    () => (draft?.documentChecklist || []).filter((item) => item.status === 'uploaded').length,
    [draft]
  );

  if (loading) {
    return <LoadingState label="Preparando checklist documental..." />;
  }

  if (!property) {
    return (
      <EmptyState
        title="No pudimos cargar este paso"
        description={error || 'La propiedad ya no esta disponible.'}
      />
    );
  }

  if (!draft?.prequalification) {
    return (
      <EmptyState
        title="Primero necesitamos tu precalificacion"
        description="Asi podemos pedirte solo los documentos correctos para este inmueble."
        actionLabel="Ir a precalificacion"
        onAction={() => navigate(`/properties/${property.id}/apply/prequal`)}
      />
    );
  }

  const updateDraft = (patch) => {
    const nextDraft = mergeApplicationDraft(propertyId, patch);
    setDraft(nextDraft);
  };

  const handleFileSelect = (documentId, file) => {
    const nextChecklist = (draft.documentChecklist || []).map((document) => {
      if (document.id !== documentId) {
        return document;
      }

      const validation = validateDocumentFile(document, file);

      return {
        ...document,
        fileName: file.name,
        status: validation.status,
        validationMessage: validation.validationMessage,
      };
    });

    updateDraft({ documentChecklist: nextChecklist });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      setMessage('Necesitas una cuenta para enviar documentos y dejar trazabilidad de la solicitud.');
      return;
    }

    if (!profile.desiredMoveIn || !profile.phone || profile.message.trim().length < 20) {
      setMessage('Completa fecha de ingreso, telefono y un mensaje claro de al menos 20 caracteres.');
      return;
    }

    const missingDocuments = (draft.documentChecklist || []).filter(
      (document) => document.status !== 'uploaded'
    );

    if (missingDocuments.length) {
      setMessage('Antes de enviar, carga todos los documentos obligatorios y revisa los que pidan correccion.');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const response = await api.post('/requests', {
        propertyId,
        desiredMoveIn: profile.desiredMoveIn,
        leaseMonths: Number(profile.leaseMonths),
        occupants: Number(draft.prequalForm.occupants),
        monthlyIncome: Number(draft.prequalForm.monthlyIncome),
        hasPets: profile.hasPets,
        phone: profile.phone,
        message: buildRequestMessage(profile.message, draft),
      });

      updateDraft({
        applicantProfile: profile,
        submittedRequest: response.data,
      });

      navigate(`/properties/${property.id}/apply/review`);
    } catch (requestError) {
      setMessage(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page application-page">
      <section className="section">
        <ApplicationStepper currentStep="documents" />

        <div className="application-layout">
          <div className="application-layout__main">
            {!isAuthenticated ? (
              <div className="content-card application-gate">
                <span className="section__eyebrow">Cuenta necesaria</span>
                <h1>Guarda tus documentos con trazabilidad</h1>
                <p>
                  Ya tienes tu precalificacion. Ahora necesitamos una cuenta para dejar la solicitud
                  asociada a tu identidad y mostrarte el estado del proceso.
                </p>
                <div className="application-actions">
                  <Link
                    to="/login"
                    className="button"
                    state={{
                      from: `/properties/${property.id}/apply/documents`,
                      applicationIntent: {
                        propertyId: property.id,
                        propertyTitle: property.title,
                        stage: 'documents',
                      },
                    }}
                  >
                    Ingresar para continuar
                  </Link>
                  <Link
                    to="/register"
                    className="button button--secondary"
                    state={{
                      from: `/properties/${property.id}/apply/documents`,
                      applicationIntent: {
                        propertyId: property.id,
                        propertyTitle: property.title,
                        stage: 'documents',
                      },
                    }}
                  >
                    Crear cuenta
                  </Link>
                </div>
              </div>
            ) : null}

            <form className="application-documents-stack" onSubmit={handleSubmit}>
              <div className="form-card">
                <div className="form-card__header">
                  <span className="section__eyebrow">Documentos</span>
                  <h1>Sube lo necesario, nada mas</h1>
                  <p>
                    Cada documento explica por que se pide, el formato aceptado y como corregirlo si
                    hace falta.
                  </p>
                </div>

                <InlineMessage tone="danger">{message}</InlineMessage>

                <div className="booking-summary">
                  <div>
                    <span>Documentos listos</span>
                    <strong>
                      {uploadedCount} / {draft.documentChecklist.length}
                    </strong>
                  </div>
                  <div>
                    <span>Resultado de entrada</span>
                    <strong>
                      {draft.prequalification.result === 'eligible'
                        ? 'Apto'
                        : draft.prequalification.result === 'eligible_with_backup'
                          ? 'Con respaldo'
                          : 'No apto'}
                    </strong>
                  </div>
                </div>

                {draft.prequalification.requiresBackup ? (
                  <div className="application-banner">
                    <ShieldCheck size={16} />
                    <span>
                      Esta solicitud puede continuar, pero necesitara respaldo para mantenerse dentro
                      del flujo estandar.
                    </span>
                  </div>
                ) : null}

                <div className="field-grid">
                  <div className="field-group">
                    <label htmlFor="desiredMoveIn">Fecha deseada de ingreso</label>
                    <input
                      id="desiredMoveIn"
                      type="date"
                      value={profile.desiredMoveIn}
                      onChange={(event) =>
                        setProfile((current) => ({
                          ...current,
                          desiredMoveIn: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="field-group">
                    <label htmlFor="leaseMonths">Duracion estimada</label>
                    <input
                      id="leaseMonths"
                      type="number"
                      min={property.minLeaseMonths || 1}
                      max="60"
                      value={profile.leaseMonths}
                      onChange={(event) =>
                        setProfile((current) => ({
                          ...current,
                          leaseMonths: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="field-grid">
                  <div className="field-group">
                    <label htmlFor="applicationPhone">Telefono</label>
                    <input
                      id="applicationPhone"
                      value={profile.phone}
                      onChange={(event) =>
                        setProfile((current) => ({
                          ...current,
                          phone: event.target.value,
                        }))
                      }
                      placeholder="+57 300 000 0000"
                    />
                  </div>
                  <div className="field-group">
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        checked={profile.hasPets}
                        onChange={(event) =>
                          setProfile((current) => ({
                            ...current,
                            hasPets: event.target.checked,
                          }))
                        }
                      />
                      Vivire con mascotas
                    </label>
                  </div>
                </div>

                <div className="field-group">
                  <label htmlFor="applicationMessage">Contexto para tu solicitud</label>
                  <textarea
                    id="applicationMessage"
                    rows="5"
                    value={profile.message}
                    onChange={(event) =>
                      setProfile((current) => ({
                        ...current,
                        message: event.target.value,
                      }))
                    }
                    placeholder="Cuentanos cuando quieres mudarte, quien vivira contigo y cualquier dato util para revisar la solicitud."
                  />
                </div>
              </div>

              <div className="document-card-grid">
                {draft.documentChecklist.map((document) => (
                  <DocumentRequirementCard
                    key={document.id}
                    document={document}
                    onSelectFile={handleFileSelect}
                    disabled={!isAuthenticated}
                  />
                ))}
              </div>

              <div className="application-actions">
                <Link to={`/properties/${property.id}/apply/prequal`} className="button button--secondary">
                  Volver a precalificacion
                </Link>
                <button className="button" type="submit" disabled={submitting || !isAuthenticated}>
                  {submitting ? 'Enviando a revision...' : (
                    <>
                      Enviar a revision
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
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
