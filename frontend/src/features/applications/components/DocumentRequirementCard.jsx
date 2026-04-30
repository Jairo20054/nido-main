import React from 'react';
import { CheckCircle2, FileCheck2, RefreshCw, UploadCloud } from 'lucide-react';
import { ApplicationStatusBadge } from './ApplicationStatusBadge';

const ACCEPTED_EXTENSIONS = {
  JPG: '.jpg,.jpeg',
  PNG: '.png',
  PDF: '.pdf',
};

const buildAccept = (formats) =>
  (formats || [])
    .map((format) => ACCEPTED_EXTENSIONS[format] || '')
    .filter(Boolean)
    .join(',');

export function DocumentRequirementCard({ document, onSelectFile, disabled = false }) {
  const isUploaded = document.status === 'uploaded';
  const needsCorrection = document.status === 'requires_correction';

  return (
    <div className={`document-card ${needsCorrection ? 'document-card--danger' : ''}`}>
      <div className="document-card__header">
        <div>
          <span className="section__eyebrow">Documento</span>
          <h3>{document.label}</h3>
        </div>
        <ApplicationStatusBadge status={document.status} kind="document" />
      </div>

      <p>{document.why}</p>

      <div className="document-card__meta">
        <div>
          <strong>Formato aceptado</strong>
          <span>{(document.formats || []).join(', ')}</span>
        </div>
        <div>
          <strong>Ejemplo visual</strong>
          <span>{document.exampleHint}</span>
        </div>
      </div>

      {document.fileName ? (
        <div className="document-card__uploaded">
          <FileCheck2 size={16} />
          <span>{document.fileName}</span>
        </div>
      ) : null}

      {document.validationMessage ? (
        <p className="document-card__validation">{document.validationMessage}</p>
      ) : null}

      <label className={`button ${isUploaded ? 'button--secondary' : ''} document-card__button`}>
        {isUploaded ? <RefreshCw size={16} /> : needsCorrection ? <UploadCloud size={16} /> : <CheckCircle2 size={16} />}
        {isUploaded ? 'Reemplazar archivo' : needsCorrection ? 'Corregir archivo' : 'Cargar archivo'}
        <input
          type="file"
          hidden
          accept={buildAccept(document.formats)}
          disabled={disabled}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              onSelectFile(document.id, file);
            }
            event.target.value = '';
          }}
        />
      </label>
    </div>
  );
}
