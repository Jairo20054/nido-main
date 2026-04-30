import React from 'react';

// Vista de carga simple usada mientras una pagina o seccion espera datos remotos.
export function LoadingState({ label = 'Cargando...' }) {
  return (
    <div className="status-view">
      <div className="spinner" />
      <p>{label}</p>
    </div>
  );
}
