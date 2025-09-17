// src/components/LeftSidebar/LeftSidebar.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './LeftSidebar.css';

const LeftSidebar = ({ onExploreClick, onProfileClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(location.pathname);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 2, icon: '🔍', label: 'Buscar', path: '/explore' },
    { id: 3, icon: '📋', label: 'Reservas', path: '/bookings' },
    { id: 4, icon: '💬', label: 'Mensajes', path: '/messages' },
    { id: 5, icon: '🔔', label: 'Notificaciones', path: '/notifications' },
    { id: 6, icon: '❤️', label: 'Favoritos', path: '/favorites' },
    { id: 7, icon: '🏘️', label: 'Mis Propiedades', path: '/my-properties' },
    { id: 8, icon: '👷', label: 'Remodelaciones', path: '/profile' },
    { id: 9, icon: '🎥', label: 'videos', path: '/profile' },
    { id: 10,icon: '👤', label: 'Perfil', path: '/profile' },
  ];

  const handleItemClick = (path, label) => {
    if (path === '/explore' && onExploreClick) {
      onExploreClick();
      return;
    }
    if (label === 'Perfil' && onProfileClick) {
      onProfileClick();
      return;
    }
    setActiveItem(path);
    navigate(path);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`left-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <button className="toggle-button" onClick={toggleSidebar}>
        {isCollapsed ? '▶' : '◀'}
      </button>
      <div className="sidebar-menu">
        {menuItems.map(item => (
          <div 
            key={item.id} 
            className={`menu-item ${activeItem === item.path ? 'active' : ''}`}
            onClick={() => handleItemClick(item.path, item.label)}
          >
            <span className="menu-icon">{item.icon}</span>
            {!isCollapsed && <span className="menu-label">{item.label}</span>}
          </div>
        ))}
      </div>
      
      {!isCollapsed && (
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
      )}
    </div>
  );
};

export default LeftSidebar;