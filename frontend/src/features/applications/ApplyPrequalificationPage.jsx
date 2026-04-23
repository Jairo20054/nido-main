import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { EmptyState } from '../../components/ui/EmptyState';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { LoadingState } from '../../components/ui/LoadingState';
import { api } from '../../lib/apiClient';
import { ApplicationStepper } from './components/ApplicationStepper';
import { ApplicationPropertySummary } from './components/ApplicationPropertySummary';
import { BACKUP_OPTIONS, OCCUPATION_OPTIONS, getPrequalResultContent } from './applicationConfig';
import { getApplicationDraft, mergeApplicationDraft } from './applicationDraft';
import { usePropertyDetails } from './usePropertyDetails';

const initialForm = {
  occupationType: 'EMPLOYEE',
  monthlyIncome: '',
  occupants: 1,
  hasBackup: false,
  backupOption: 'NONE',
};

export function ApplyPrequalificationPage() {
  const navigate = useNavigate();
  const { id: propertyId } = useParams();
  const { property, loading, error } = usePropertyDetails(propertyId);
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const draft = getApplicationDraft(propertyId);

    if (draft?.prequalForm) {
      setForm((current) => ({
        ...current,
        ...draft.prequalForm,
      }));
    }

    if (draft?.prequalification) {
      setResult({
        prequalification: draft.prequalification,
        documentChecklist: draft.documentChecklist || [],
      });
    }
  }, [propertyId]);

  const resultContent = useMemo(
    () => (result ? getPrequalResultContent(result.prequalification.result) : null),
    [result]
  );

  if (loading) {
    return <LoadingState label="Cargando requisitos del inmueble..." />;
  }

  if (!property) {
    return (
      <EmptyState
        title="No pudimos cargar la precalificacion"
        description={error || 'La propiedad ya no esta disponible.'}
      />
    );
  }

  const handleEvaluate = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const response = await api.post(
        '/applications/prequalify',
        {
          propertyId,
          occupationType: form.occupationType,
          monthlyIncome: Number(form.monthlyIncome),
          occupants: Number(form.occupants),
          hasBackup: Boolean(form.hasBackup),
          backupOption: form.hasBackup ? form.backupOption : 'NONE',
        },
        { auth: false }
      );

      setResult(response.data);
      mergeApplicationDraft(propertyId, {
        propertyId,
        prequalForm: {
          ...form,
          monthlyIncome: Number(form.monthlyIncome),
          occupants: Number(form.occupants),
        },
        prequalification: response.data.prequalification,
        documentChecklist: response.data.documentChecklist.map((document) => ({
          ...document,
          status: 'pending',
          fileName: '',
          validationMessage: '',
        })),
        submittedRequest: null,
      });
    } catch (requestError) {
      setMessage(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page application-page">
      <section className="section">
        <ApplicationStepper currentStep="prequal" />

        <div className="application-layout">
          <div className="application-layout__main">
            <form className="form-card application-form-card" onSubmit={handleEvaluate}>
              <div className="form-card__header">
                <span className="section__eyebrow">Precalificacion</span>
                <h1>Ve si este inmueble encaja contigo</h1>
                <p>
                  Responde estas preguntas para darte una salida clara y sin cobro por revision.
                </p>
              </div>

              <InlineMessage tone="danger">{message}</InlineMessage>

              <div className="field-group">
                <label htmlFor="occupationType">Tipo de ocupacion</label>
                <div className="selector-grid">
                  {OCCUPATION_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`selector-card ${form.occupationType === option.value ? 'selector-card--active' : ''}`}
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          occupationType: option.value,
                        }))
                      }
                    >
                      <strong>{option.label}</strong>
                      <span>{option.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="field-grid">
                <div className="field-group">
                  <label htmlFor="monthlyIncome">Ingreso mensual aproximado</label>
                  <input
                    id="monthlyIncome"
                    type="number"
                    min="0"
                    placeholder="4200000"
                    value={form.monthlyIncome}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        monthlyIncome: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="occupants">Cuantas personas viviran aqui</label>
                  <input
                    id="occupants"
                    type="number"
                    min="1"
                    max={property.maxOccupants || 12}
                    value={form.occupants}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        occupants: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={form.hasBackup}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        hasBackup: event.target.checked,
                        backupOption: event.target.checked ? current.backupOption : 'NONE',
                      }))
                    }
                  />
                  Tengo codeudor o una alternativa de respaldo
                </label>
              </div>

              {form.hasBackup ? (
                <div className="field-group">
                  <label htmlFor="backupOption">Tipo de respaldo</label>
                  <select
                    id="backupOption"
                    value={form.backupOption}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        backupOption: event.target.value,
                      }))
                    }
                  >
                    {BACKUP_OPTIONS.filter((option) => option.value !== 'NONE').map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div className="application-actions">
                <Link to={`/properties/${property.id}/apply/start`} className="button button--secondary">
                  Volver
                </Link>
                <button className="button" type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <RefreshCw size={16} className="spinner-inline" />
                      Evaluando...
                    </>
                  ) : (
                    <>
                      Evaluar gratis
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>

            {result && resultContent ? (
              <div className={`content-card application-result application-result--${resultContent.tone}`}>
                <div className="application-result__header">
                  <span className="section__eyebrow">{resultContent.badge}</span>
                  <h2>{resultContent.title}</h2>
                  <p>{resultContent.description}</p>
                </div>

                <div className="application-result__grid">
                  <div>
                    <strong>Razones</strong>
                    <ul>
                      {result.prequalification.reasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong>Siguientes pasos</strong>
                    <ul>
                      {result.prequalification.recommendations.map((recommendation) => (
                        <li key={recommendation}>{recommendation}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="application-result__footer">
                  <div className="application-result__score">
                    <span>Score base</span>
                    <strong>{result.prequalification.score}/100</strong>
                  </div>

                  {result.prequalification.result === 'not_eligible' ? (
                    <div className="application-actions">
                      <Link to="/properties" className="button button--secondary">
                        Ver otros inmuebles
                      </Link>
                      <button
                        type="button"
                        className="button"
                        onClick={() => {
                          setForm((current) => ({
                            ...current,
                            hasBackup: true,
                            backupOption:
                              current.backupOption === 'NONE' ? 'CO_SIGNER' : current.backupOption,
                          }));
                        }}
                      >
                        Intentar con respaldo
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="button"
                      onClick={() => navigate(`/properties/${property.id}/apply/documents`)}
                    >
                      Continuar con documentos
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <ApplicationPropertySummary
            property={property}
            prequalification={result?.prequalification}
          />
        </div>
      </section>
    </div>
  );
}
