import React from 'react';

export const NIDO_LOGO_PATH = '/brand/nido-logo.png';

export function BrandLogo({ className = '', label = 'NIDO', size = 'default' }) {
  const classes = ['brand-logo', `brand-logo--${size}`, className].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      <img className="brand-logo__image" src={NIDO_LOGO_PATH} alt={label} width="1305" height="367" loading="eager" />
    </span>
  );
}
