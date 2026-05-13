import React from 'react';

// Estado vacio reutilizable para listas y vistas sin datos.
export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) {
  return (
    <div className="status-card status-card--empty">
      <div className="empty-illustration" aria-hidden="true">
        <div className="empty-illustration__bird"></div>
        <div className="empty-illustration__house">
          <span></span>
        </div>
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && onAction ? (
        <div className="empty-state__actions">
          <button className="button button--secondary" type="button" onClick={onAction}>
            {actionLabel}
          </button>
          {secondaryActionLabel && onSecondaryAction ? (
            <button className="ghost-link" type="button" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
