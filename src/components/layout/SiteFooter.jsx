import React from 'react';

// Pie de pagina minimalista con contexto de marca y cobertura geografica.
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <p>© 2026 Nido · Arriendo residencial</p>
        <div className="site-footer__cities">
          <span>Bogotá</span>
          <span>Medellín</span>
          <span>Cali</span>
          <span>Barranquilla</span>
        </div>
      </div>
    </footer>
  );
}
