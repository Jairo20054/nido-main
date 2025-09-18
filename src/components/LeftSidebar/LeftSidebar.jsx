import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaSearch, 
  FaClipboardList, 
  FaComments, 
  FaBell, 
  FaHeart, 
  FaHome, 
  FaHardHat, 
  FaVideo, 
  FaUser, 
  FaBars 
} from 'react-icons/fa';
import './LeftSidebar.css';

const LeftSidebar = ({ onExploreClick, onProfileClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(location.pathname);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 1, icon: <FaSearch />, label: 'Buscar', path: '/search' },
    { id: 2, icon: <FaClipboardList />, label: 'Reservas', path: '/my-bookings' },
    { id: 3, icon: <FaComments />, label: 'Mensajes', path: '/messages' },
    { id: 4, icon: <FaBell />, label: 'Notificaciones', path: '/messages' },
    { id: 5, icon: <FaHeart />, label: 'Favoritos', path: '/favorites' },
    { id: 6, icon: <FaHome />, label: 'Mis Propiedades', path: '/host/properties' },
    { id: 7, icon: <FaHardHat />, label: 'Remodelaciones', path: '/profile' },
    { id: 8, icon: <FaVideo />, label: 'Videos', path: '/profile' },
    { id: 9, icon: <FaUser />, label: 'Perfil', path: '/profile' },
  ];

  const handleItemClick = (path, label) => {
    if (path === '/search' && onExploreClick) {
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
    <nav className={`left-sidebar ${isCollapsed ? 'collapsed' : ''}`} aria-label="Menú lateral">
      <div className="sidebar-header">
        <button 
          className="toggle-button" 
          onClick={toggleSidebar} 
          aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
          title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          <FaBars />
        </button>
      </div>
      <div className="sidebar-menu" role="menu">
        {menuItems.map(item => (
          <div 
            key={item.id} 
            className={`menu-item ${activeItem === item.path ? 'active' : ''}`}
            onClick={() => handleItemClick(item.path, item.label)}
            role="menuitem"
            tabIndex={0}
            aria-current={activeItem === item.path ? 'page' : undefined}
            data-label={item.label}
            title={isCollapsed ? item.label : undefined}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleItemClick(item.path, item.label);
              }
            }}
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
    </nav>
  );
};

export default LeftSidebar;