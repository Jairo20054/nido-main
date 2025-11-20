import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../../Header/Header';
import LeftSidebar from '../../LeftSidebar/LeftSidebar';
import BottomNav from '../../social/BottomNav';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="layout">
      <Header />
      <div className="content-wrapper">
        {/* LeftSidebar removido - solo contenido principal */}
        <main className="main-content-layout full-width">
          {children}
        </main>
      </div>

      {/* Mobile: mostrar navegación inferior */}
      <div className="mobile-nav">
        <BottomNav />
      </div>
    </div>
  );
};

export default Layout;
