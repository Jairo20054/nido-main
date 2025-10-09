import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUiHost } from '../../context/UiHostProvider';
import './LeftSidebar.css';

// ========== SISTEMA DE ICONOS MEJORADOS Y COLORIDOS ==========
const SearchIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" 
          stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ReelsIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="4" stroke={color} strokeWidth="2"/>
    <path d="M8 2V22M16 2V22M2 8H8M2 16H8M16 8H22M16 16H22" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const UserIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2"/>
    <path d="M5.337 18.32C5.813 15.619 8.144 13.5 11 13.5H13C15.856 13.5 18.187 15.619 18.663 18.32C18.859 19.373 18.075 20.5 17 20.5H7C5.925 20.5 5.141 19.373 5.337 18.32Z" 
          stroke={color} strokeWidth="2"/>
  </svg>
);

const TrendingIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23 6L13.5 15.5L8.5 10.5L1 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 6H23V12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MapIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 4L3 7V20L9 17M9 4L15 7M9 4V17M15 7L21 4V17L15 20M15 7V20M15 20L9 17" 
          stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MessageIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 3.89 3.89 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" 
          stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MenuIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12H21M3 6H21M3 18H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronLeftIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 18L9 12L15 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronRightIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 18L15 12L9 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

    // Navegación a rutas específicas para arrendamiento de viviendas
    const routeMap = {
      'reels': '/reels',
      'mensajes': '/messages',
      'perfil': '/profile',
      'mapa': '/mapa',
      'tendencias': '/tendencias'
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

  // ========== ITEMS DE NAVEGACIÓN ESPECÍFICOS PARA ARRENDAMIENTO ==========
  const navigationItems = [
    {
      id: 'busqueda',
      icon: <SearchIcon />,
      label: 'Buscar Propiedades',
      description: 'Encuentra tu vivienda ideal'
    },
    {
      id: 'reels',
      icon: <ReelsIcon />,
      label: 'Tours Virtuales',
      description: 'Recorridos en video 360°',
      badge: badgeCounts.reels || 0
    },
    {
      id: 'mensajes',
      icon: <MessageIcon />,
      label: 'Mensajes',
      description: 'Chat con propietarios',
      badge: badgeCounts.mensajes || 0
    },
    {
      id: 'perfil',
      icon: <UserIcon />,
      label: 'Mi Perfil',
      description: 'Gestiona tu cuenta'
    },
    {
      id: 'mapa',
      icon: <MapIcon />,
      label: 'Mapa Interactivo',
      description: 'Propiedades en el mapa'
    },
    {
      id: 'tendencias',
      icon: <TrendingIcon />,
      label: 'Tendencias',
      description: 'Precios y mercado actual'
    }
  ];

  // ========== RENDERIZADO MEJORADO ==========
  return (
    <>
      {/* Overlay para móvil */}
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
          <MenuIcon size={20} />
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
        aria-label="Navegación principal de RentHome"
      >
        {/* Header con información de usuario */}
        <div className="sidebar-header">
          <div className="user-block">
            <div className="user-avatar">
              <img
                src={user?.avatar || '/api/placeholder/44/44'}
                alt={`Avatar de ${user?.name}`}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDQiIGhlaWdodD0iNDQiIHZpZXdCb3g9IjAgMCA0NCA0NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjIiIGN5PSIyMiIgcj0iMjIiIGZpbGw9IiNGM0Y0RjYiLz4KPHBhdGggZD0iTTIyIDI0QzI0LjIwOTEgMjQgMjYgMjIuMjA5MSAyNiAyMEMyNiAxNy43OTA5IDI0LjIwOTEgMTYgMjIgMTZDMTkuNzkwOSAxNiAxOCAxNy43OTA5IDE4IDIwQzE4IDIyLjIwOTEgMTkuNzkwOSAyNCAyMiAyNFpNMjIgMjZDMTguNjgzIDI2IDE2IDI4LjY4MyAxNiAzMkgyOEMzMiAzNiwzNCAzNiwzNCAzNkMzNCAzMS41ODIgMjkuNDE4IDI4IDI1IDI4SDIyWiIgZmlsbD0iIzlBOUE5QSIvPgo8L3N2Zz4K';
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
              aria-label={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
              aria-expanded={!isCollapsed}
            >
              {isCollapsed ? <ChevronRightIcon size={16} /> : <ChevronLeftIcon size={16} />}
            </button>
          )}
        </div>

        {/* Menú de navegación principal */}
        <ul className="sidebar-menu" role="menubar">
          {navigationItems.map((item) => (
            <li
              key={item.id}
              data-item={item.id}
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
              {/* Espacio para futuras estadísticas o información adicional */}
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default LeftSidebar;