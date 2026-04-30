import React from 'react';
import { getRequestStatusLabel, getRequestStatusTone } from '../../lib/formatters';

// Badge visual para solicitudes de arriendo.
export function RequestStatusBadge({ status }) {
  return <span className={`status-badge status-badge--${getRequestStatusTone(status)}`}>{getRequestStatusLabel(status)}</span>;
}
