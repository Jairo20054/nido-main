import React from 'react';

export function EmptyState({ title, description, actionLabel, onAction }) {
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
        <button className="button button--secondary" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
