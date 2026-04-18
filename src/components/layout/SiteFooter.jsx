import React from 'react';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div>
          <strong>NIDO</strong>
          <p>Una plataforma sobria para descubrir, guardar y gestionar arriendos con claridad.</p>
        </div>
        <div className="site-footer__meta">
          <span>Busqueda clara</span>
          <span>Solicitudes trazables</span>
          <span>Gestion sin ruido</span>
        </div>
      </div>
    </footer>
  );
}
