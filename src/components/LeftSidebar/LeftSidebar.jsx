// src/components/LeftSidebar/LeftSidebar.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './LeftSidebar.css';

const LeftSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(location.pathname);

  const menuItems = [
    { id: 1, icon: '🏠', label: 'Inicio', path: '/' },
    { id: 2, icon: '🔍', label: 'Explorar', path: '/explore' },
    { id: 3, icon: '📋', label: 'Reservas', path: '/bookings' },
    { id: 4, icon: '💬', label: 'Mensajes', path: '/messages' },
    { id: 5, icon: '🔔', label: 'Notificaciones', path: '/notifications' },
    { id: 6, icon: '❤️', label: 'Favoritos', path: '/favorites' },
    { id: 7, icon: '🏘️', label: 'Mis Propiedades', path: '/my-properties' },
    { id: 8, icon: '👤', label: 'Perfil', path: '/profile' },
  ];

  const handleItemClick = (path) => {
    setActiveItem(path);
    navigate(path);
  };

  return (
    <div className="left-sidebar">
      <div className="sidebar-header">
        <h2>ViviendaSocial</h2>
      </div>
      
      <div className="sidebar-menu">
        {menuItems.map(item => (
          <div 
            key={item.id} 
            className={`menu-item ${activeItem === item.path ? 'active' : ''}`}
            onClick={() => handleItemClick(item.path)}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-label">{item.label}</span>
          </div>
        ))}
      </div>
      
      <div className="sidebar-footer">
        <div className="footer-links">
          <a href="#">Privacidad</a>
          <span>·</span>
          <a href="#">Términos</a>
          <span>·</span>
          <a href="#">Publicidad</a>
        </div>
        <div className="copyright">
          © {new Date().getFullYear()} ViviendaSocial
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;