import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../../Header/Header';
import LeftSidebar from '../../LeftSidebar/LeftSidebar';
import BottomNav from '../../social/BottomNav';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const hideSidebarPaths = ['/host/properties'];

  const shouldHideSidebar = hideSidebarPaths.some(path => location.pathname.startsWith(path));

  return (
    <div className="layout">
      <Header />
      <div className="content-wrapper">
        {/* Desktop: mostrar sidebar lateral */}
        {!shouldHideSidebar && (
          <div className="desktop-sidebar">
            <LeftSidebar />
          </div>
        )}

        <main className="main-content-layout">
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
