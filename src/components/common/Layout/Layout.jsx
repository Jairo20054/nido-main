import React from 'react';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Header />
      <main className="main-content-layout">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
