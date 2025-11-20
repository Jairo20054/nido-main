import React from 'react';
import './HomeLayout.css';

const HomeLayout = ({ children }) => {
  return (
    <div className="home-layout">
      {children}
    </div>
  );
};

export default HomeLayout;
