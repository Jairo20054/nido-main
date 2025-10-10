import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../Header/Header';
import LeftSidebar from '../../LeftSidebar/LeftSidebar';
import SidebarRight from '../SidebarRight/SidebarRight';
import BottomNav from '../../social/BottomNav';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const hideSidebarPaths = ['/host/properties'];

  const shouldHideSidebar = hideSidebarPaths.some(path => location.pathname.startsWith(path));

  return (
    <div className="layout">
      <Header />
      <div className="content-wrapper flex flex-row">
        {/* Sidebar lateral izquierda */}
        {!shouldHideSidebar && (
          <div className="sidebar-left w-60 flex-shrink-0">
            <LeftSidebar />
          </div>
        )}

        <main className="main-content-layout flex-1 px-4">
          {children}
        </main>

        {/* Sidebar lateral derecha */}
        {!shouldHideSidebar && (
          <div className="sidebar-right w-70 flex-shrink-0">
            <SidebarRight />
          </div>
        )}
      </div>

      {/* Mobile: mostrar navegación inferior */}
      <div className="mobile-nav">
        <BottomNav />
      </div>
    </div>
  );
};

export default Layout;
