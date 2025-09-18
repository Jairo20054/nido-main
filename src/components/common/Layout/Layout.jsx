import React from 'react';
import Header from '../Header/Header';
import LeftSidebar from '../../LeftSidebar/LeftSidebar';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Header />
      <div className="content-wrapper">
        <LeftSidebar />
        <main className="main-content-layout">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
