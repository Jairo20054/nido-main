import React from 'react';

// Mensaje inline para errores, confirmaciones o advertencias dentro de formularios y paneles.
export function InlineMessage({ className = '', reserveSpace = false, tone = 'neutral', children }) {
  if (!children) {
    if (!reserveSpace) return null;

    return (
      <div
        className={`inline-message inline-message--${tone} inline-message--reserved ${className}`.trim()}
        aria-hidden="true"
      />
    );
  }

  return (
    <div className={`inline-message inline-message--${tone} ${className}`.trim()} role="status" aria-live="polite">
      {children}
    </div>
  );
}
