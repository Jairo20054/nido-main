import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Home,
  Search,
  MapPin,
  Heart,
  MessageSquare,
  User,
  LogOut,
  Menu,
  ChevronRight,
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

  const menuItems = [
    { id: 'home', label: 'Inicio', icon: Home, path: '/' },
    { id: 'search', label: 'Buscar', icon: Search, path: '/search' },
    { id: 'explore', label: 'Explorar', icon: MapPin, path: '/mapa' },
    { id: 'favorites', label: 'Favoritos', icon: Heart, path: '/favorites' },
    { id: 'messages', label: 'Mensajes', icon: MessageSquare, path: '/messages' },
    { id: 'profile', label: 'Perfil', icon: User, path: '/profile' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {/* Toggle Button */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label="Toggle sidebar"
      >
        <Menu size={24} />
      </button>

      {/* Logo/Branding */}
      <div className="sidebar-brand">
        <div className="brand-icon">🏠</div>
        {isExpanded && <span className="brand-text">Nido</span>}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <a
            key={item.id}
            href={item.path}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            title={item.label}
          >
            <div className="nav-icon-wrapper">
              <item.icon size={24} />
            </div>
            {isExpanded && (
              <>
                <span className="nav-label">{item.label}</span>
                <ChevronRight size={16} className="nav-chevron" />
              </>
            )}
          </a>
        ))}
      </nav>

      {/* Spacer */}
      <div className="sidebar-spacer" />

      {/* Bottom Actions */}
      <div className="sidebar-bottom">
        {isExpanded && (
          <button className="sidebar-logout" title="Cerrar sesión">
            <LogOut size={20} />
            <span>Salir</span>
          </button>
        )}
      </div>

      {/* Overlay (para móvil) */}
      {isExpanded && <div className="sidebar-overlay" onClick={() => setIsExpanded(false)} />}
    </div>
  );
};

export default Sidebar;
