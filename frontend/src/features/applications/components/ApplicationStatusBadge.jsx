import React from 'react';
import { getApplicationStatusContent, getDocumentStatusContent } from '../applicationConfig';

export function ApplicationStatusBadge({ status, kind = 'application' }) {
  const content =
    kind === 'document' ? getDocumentStatusContent(status) : getApplicationStatusContent(status);

  return <span className={`status-badge status-badge--${content.tone}`}>{content.label}</span>;
}
