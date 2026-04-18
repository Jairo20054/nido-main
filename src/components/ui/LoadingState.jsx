import React from 'react';

export function LoadingState({ label = 'Cargando...' }) {
  return (
    <div className="status-view">
      <div className="spinner" />
      <p>{label}</p>
    </div>
  );
}
