import React from 'react';

export function InlineMessage({ tone = 'neutral', children }) {
  if (!children) {
    return null;
  }

  return <div className={`inline-message inline-message--${tone}`}>{children}</div>;
}
