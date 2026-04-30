import React from 'react';
import { Outlet } from 'react-router-dom';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

/**
 * Componente de uso layout base.
 * Envuelve todas las rutas montadas dentro de `App.jsx` que deben compartir
 * header, footer y la region central donde React Router inyecta cada pantalla.
 */
export function SiteLayout() {
  return (
    <div className="shell">
      <SiteHeader />
      <main className="shell__content">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
