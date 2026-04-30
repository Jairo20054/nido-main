import React from 'react';
import { getPropertyStatusLabel, getPropertyStatusTone } from '../../lib/formatters';

// Badge visual para uniformar la representacion del estado de una propiedad.
export function PropertyStatusBadge({ status }) {
  return <span className={`status-badge status-badge--${getPropertyStatusTone(status)}`}>{getPropertyStatusLabel(status)}</span>;
}
