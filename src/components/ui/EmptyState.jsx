import React from 'react';

// Estado vacio reutilizable para listas y vistas sin datos.
export function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="status-card">
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && onAction ? (
        <button className="button button--secondary" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
