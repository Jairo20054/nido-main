import React from 'react';

export function SiteFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="site-footer">
      <p className="site-footer__text">
        © {currentYear} Nido · Arriendo residencial · Bogotá · Medellín · Cali · Barranquilla
      </p>
    </footer>
  );
}
