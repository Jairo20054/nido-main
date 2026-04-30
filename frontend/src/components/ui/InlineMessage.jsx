import React from 'react';

// Mensaje inline para errores, confirmaciones o advertencias dentro de formularios y paneles.
export function InlineMessage({ tone = 'neutral', children }) {
  if (!children) {
    return null;
  }

  return <div className={`inline-message inline-message--${tone}`}>{children}</div>;
}
