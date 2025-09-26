// ===== LeftSidebar.jsx =====
// No changes needed for the errors, but added improvements like useMemo for menuItems and better ARIA.

import React, { useState, useMemo, useEffect } from 'react';
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
  const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === 'true');

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isCollapsed);
  }, [isCollapsed]);

  const menuItems = useMemo(() => [
    { id: 1, icon: <FaSearch />, label: 'Buscar', path: '/search' },
    { id: 2, icon: <FaClipboardList />, label: 'Reservas', path: '/my-bookings' },
    { id: 3, icon: <FaComments />, label: 'Mensajes', path: '/messages' },
    { id: 4, icon: <FaBell />, label: 'Notificaciones', path: '/notifications' },
    { id: 5, icon: <FaHeart />, label: 'Favoritos', path: '/favorites' },
    { id: 6, icon: <FaHome />, label: 'Mis Propiedades', path: '/host/properties' },
    { id: 7, icon: <FaHardHat />, label: 'Remodelaciones', path: '/remodelations' },
    { id: 8, icon: <FaVideo />, label: 'Reels', path: '/reels' },
    { id: 9, icon: <FaUser />, label: 'Perfil', path: '/profile' },
  ], []);

  const handleItemClick = (path, label) => {
    if (path === '/search' && onExploreClick) return onExploreClick();
    if (label === 'Perfil' && onProfileClick) return onProfileClick();
    setActiveItem(path);
    navigate(path);
  };

  const toggleSidebar = () => setIsCollapsed(prev => !prev);

  return (
    <nav className={`left-sidebar ${isCollapsed ? 'collapsed' : ''}`} aria-label="Menú lateral principal">
      <div className="sidebar-header">
        <button 
          className="toggle-button" 
          onClick={toggleSidebar} 
          aria-label={isCollapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral'}
          aria-expanded={!isCollapsed}
          title={isCollapsed ? 'Expandir' : 'Colapsar'}
        >
          <FaBars />
        </button>
      </div>
      <ul className="sidebar-menu" role="menu">
        {menuItems.map(item => (
          <li 
            key={item.id} 
            className={`menu-item ${activeItem === item.path ? 'active' : ''}`}
            onClick={() => handleItemClick(item.path, item.label)}
            role="menuitem"
            tabIndex={0}
            aria-current={activeItem === item.path ? 'page' : undefined}
            data-label={item.label}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleItemClick(item.path, item.label);
              }
            }}
          >
            <span className="menu-icon">{item.icon}</span>
            {!isCollapsed && <span className="menu-label">{item.label}</span>}
          </li>
        ))}
      </ul>
      {!isCollapsed && (
        <footer className="sidebar-footer">
          <div className="footer-links">
            <a href="/privacy" aria-label="Política de Privacidad">Privacidad</a>
            <span aria-hidden="true">·</span>
            <a href="/terms" aria-label="Términos de Servicio">Términos</a>
            <span aria-hidden="true">·</span>
            <a href="/ads" aria-label="Publicidad">Publicidad</a>
          </div>
          <div className="copyright" aria-label="Copyright">
            © {new Date().getFullYear()} ViviendaSocial
          </div>
        </footer>
      )}
    </nav>
  );
};

export default LeftSidebar;