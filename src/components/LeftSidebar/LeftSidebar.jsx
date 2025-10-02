import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUiHost } from '../../context/UiHostProvider';
import './LeftSidebar.css';
import { HomeModernIcon } from '@heroicons/react/24/outline';

// ========== SISTEMA DE ICONOS MODERNOS ==========
const SearchIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.3-4.3"/>
  </svg>
);

const ReelsIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
    <line x1="7" y1="2" x2="7" y2="22"/>
    <line x1="17" y1="2" x2="17" y2="22"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <line x1="2" y1="7" x2="7" y2="7"/>
    <line x1="2" y1="17" x2="7" y2="17"/>
    <line x1="17" y1="17" x2="22" y2="17"/>
    <line x1="17" y1="7" x2="22" y2="7"/>
  </svg>
);

const RenovationIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);

const UserIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const SmartHomeIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="7.5 4.21 12 6.81 16.5 4.21"/>
    <polyline points="7.5 19.79 7.5 14.6 3 12"/>
    <polyline points="21 12 16.5 14.6 16.5 19.79"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

const TrendingIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

const MapIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
    <line x1="8" y1="2" x2="8" y2="18"/>
    <line x1="16" y1="6" x2="16" y2="22"/>
  </svg>
);

const MenuIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const ChevronLeftIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const ChevronRightIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const LeftSidebar = ({
  user = {
    name: 'Maria Rodriguez',
    subtitle: 'Host Verificado',
    avatar: null
  },
  onNavigate,
  activeItemId = 'busqueda',
  badgeCounts = {}
}) => {
  const { showSearch } = useUiHost();
  const navigate = useNavigate();

  // ========== ESTADOS Y REFERENCIAS ==========
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(null);
  const sidebarRef = useRef(null);

  // ========== DETECCIÓN DE DISPOSITIVO ==========
  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileOpen(false);
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // ========== MANEJADOR DE CLICK EXTERNO ==========
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        if (isMobileOpen) {
          setIsMobileOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileOpen]);

  // ========== TOGGLE DEL SIDEBAR ==========
  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  // ========== MANEJADOR DE NAVEGACIÓN ==========
  const handleItemClick = (id) => {
    if (id === 'busqueda') {
      showSearch();
      return;
    }

    // Navegación a rutas específicas
    const routeMap = {
      'reels': '/reels',
      'remodelaciones': '/remodelaciones',
      'tendencias': '/tendencias',
      'mapa': '/mapa',
      'perfil': '/dashboard' // Asumiendo que perfil va al dashboard
    };

    if (routeMap[id]) {
      navigate(routeMap[id]);
    } else if (onNavigate) {
      onNavigate(id);
    }

    if (isMobile) setIsMobileOpen(false);
  };

  // ========== NAVEGACIÓN POR TECLADO ==========
  const handleKeyDown = (e, id) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleItemClick(id);
    }
  };

  // ========== TOOLTIPS EN MODO COLAPSADO ==========
  const showTooltip = (id) => setTooltipVisible(id);
  const hideTooltip = () => setTooltipVisible(null);

  // ========== ITEMS DE NAVEGACIÓN INNOVADORES ==========
  const navigationItems = [
    { 
      id: 'busqueda', 
      icon: <SearchIcon />, 
      label: 'Búscar',
      description: 'Encuentra propiedades ideales'
    },
    { 
      id: 'reels', 
      icon: <ReelsIcon />, 
      label: 'Reels',
      description: 'Recorridos virtuales en video',
      badge: badgeCounts.reels || 0
    },
    { 
      id: 'ProyectosInmobiliarios', 
      icon: <HomeModernIcon />, 
      label: 'Proyectos inmobiliarios',
      description: 'Explora nuevas construcciones',
      badge: badgeCounts.reels || 0
    },
    { 
      id: 'remodelaciones', 
      icon: <RenovationIcon />, 
      label: 'Remodelaciones',
      description: 'Transforma tus espacios'
    },
    { 
      id: 'tendencias', 
      icon: <TrendingIcon />, 
      label: 'Tendencias',
      description: 'Mercado en tiempo real',
      badge: badgeCounts.trending || 0
    },

    { 
      id: 'mapa', 
      icon: <MapIcon />, 
      label: 'Mapa Interactivo',
      description: 'Ubicaciones estratégicas'
    },
    { 
      id: 'perfil', 
      icon: <UserIcon />, 
      label: 'Mi Perfil',
      description: 'Gestiona tu cuenta'
    }
  ];

  // ========== RENDERIZADO ==========
  return (
    <>
      {/* Overlay para móvil con animación */}
      {isMobile && isMobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Botón hamburguesa para móvil */}
      {isMobile && !isMobileOpen && (
        <button
          className="mobile-toggle-button"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Abrir menú de navegación"
        >
          <MenuIcon size={24} />
        </button>
      )}

      {/* Sidebar principal */}
      <nav
        ref={sidebarRef}
        className={`
          left-sidebar 
          ${isCollapsed ? 'collapsed' : ''} 
          ${isMobileOpen ? 'mobile-open' : ''}
          ${isMobile ? 'mobile' : ''}
        `}
        role="navigation"
        aria-label="Navegación principal"
      >
        {/* Header con información de usuario y toggle */}
        <div className="sidebar-header">
          <div className="user-block">
            <div className="user-avatar">
              <img
                src={user?.avatar || '/api/placeholder/48/48'}
                alt={`Avatar de ${user?.name}`}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiNGM0Y0RjYiLz4KPHBhdGggZD0iTTI0IDI2QzI3LjMxMzcgMjYgMzAgMjMuMzEzNyAzMCAyMEMzMCAxNi42ODYzIDI3LjMxMzcgMTQgMjQgMTRDMjAuNjg2MyAxNCAxOCAxNi42ODYzIDE4IDIwQzE4IDIzLjMxMzcgMjAuNjg2MyAyNiAyNCAyNlpNMjQgMjhDMTkuNTgyIDI4IDE2IDMxLjU4MiAxNiAzNkgyNEMzMiAzNig0MCAzNiA0MCAzNkM0MCAzMS41ODIgMzYuNDE4IDI4IDMyIDI4SDI0WiIgZmlsbD0iIzlBOUE5QSIvPgo8L3N2Zz4K';
                }}
              />
            </div>
            {(!isCollapsed || isMobile) && (
              <div className="user-info">
                <h3 className="user-name">{user?.name}</h3>
                <p className="user-subtitle">{user?.subtitle}</p>
              </div>
            )}
          </div>

          {/* Botón de toggle para desktop */}
          {!isMobile && (
            <button
              className="sidebar-toggle"
              onClick={toggleSidebar}
              aria-label={isCollapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
              aria-expanded={!isCollapsed}
            >
              {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </button>
          )}
        </div>

        {/* Menú de navegación principal */}
        <ul className="sidebar-menu" role="menubar">
          {navigationItems.map((item) => (
            <li
              key={item.id}
              className={`
                menu-item 
                ${activeItemId === item.id ? 'active' : ''}
                ${item.badge ? 'has-badge' : ''}
              `}
              onClick={() => handleItemClick(item.id)}
              onMouseEnter={() => isCollapsed && showTooltip(item.id)}
              onMouseLeave={hideTooltip}
              onFocus={() => isCollapsed && showTooltip(item.id)}
              onBlur={hideTooltip}
              role="menuitem"
              tabIndex={0}
              aria-current={activeItemId === item.id ? 'page' : undefined}
              aria-label={item.label}
              onKeyDown={(e) => handleKeyDown(e, item.id)}
            >
              <div className="menu-item-content">
                <span className="menu-icon">
                  {item.icon}
                  {item.badge > 0 && (
                    <span className="badge" aria-label={`${item.badge} notificaciones`}>
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </span>
                
                {(!isCollapsed || isMobile) && (
                  <div className="menu-text">
                    <span className="menu-label">{item.label}</span>
                    <span className="menu-description">{item.description}</span>
                  </div>
                )}
              </div>

              {/* Tooltip para modo colapsado */}
              {isCollapsed && tooltipVisible === item.id && (
                <div 
                  className="menu-tooltip" 
                  role="tooltip"
                  aria-hidden="true"
                >
                  <span className="tooltip-label">{item.label}</span>
                  <span className="tooltip-description">{item.description}</span>
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* Footer del sidebar */}
        <div className="sidebar-footer">
          {!isCollapsed && (
            <div className="sidebar-stats">
              
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default LeftSidebar;