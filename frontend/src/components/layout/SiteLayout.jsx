import React from 'react';
import { Outlet } from 'react-router-dom';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

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
