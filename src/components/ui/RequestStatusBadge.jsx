import React from 'react';
import { getRequestStatusLabel, getRequestStatusTone } from '../../lib/formatters';

export function RequestStatusBadge({ status }) {
  return <span className={`status-badge status-badge--${getRequestStatusTone(status)}`}>{getRequestStatusLabel(status)}</span>;
}
