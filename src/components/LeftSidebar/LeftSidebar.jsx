import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUiHost } from '../../context/UiHostProvider';
import './LeftSidebar.css';

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

/*
const RenovationIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);
*/

const UserIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

/*
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
*/

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

const MessageIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
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
      'mensajes': '/messages',
      'perfil': '/dashboard', // Asumiendo que perfil va al dashboard
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

  // ========== ITEMS DE NAVEGACIÓN FACEBOOK-LIKE ==========
   const navigationItems = [
     {
       id: 'rent-ai',
       icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m16.24-3.76l-4.24 4.24m-6-6L2.76 6.24"/></svg>,
       label: 'Rent AI',
       description: 'Asistente inteligente para alquileres'
     },
     {
       id: 'amigos',
       icon: <UserIcon />,
       label: 'Amigos',
       description: 'Conecta con otros usuarios'
     },
     {
       id: 'ofertas-pasadas',
       icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
       label: 'Ofertas Pasadas',
       description: 'Revisa ofertas anteriores'
     },
     {
       id: 'favoritas',
       icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>,
       label: 'Favoritas',
       description: 'Tus propiedades guardadas'
     },
     {
       id: 'grupos',
       icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
       label: 'Grupos',
       description: 'Comunidades de alquiler'
     },
     {
       id: 'paginas',
       icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>,
       label: 'Páginas',
       description: 'Páginas de inmobiliarias'
     },
     {
       id: 'feeds',
       icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>,
       label: 'Feeds',
       description: 'Novedades y actualizaciones'
     },
     {
       id: 'ver-mas',
       icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>,
       label: 'Ver más',
       description: 'Más opciones disponibles'
     }
   ];

   // ========== ACCESOS DIRECTOS ==========
   const shortcuts = [
     { id: 1, name: 'Apartamentos Bogotá', avatar: '/api/placeholder/32/32' },
     { id: 2, name: 'Casas Medellín', avatar: '/api/placeholder/32/32' },
     { id: 3, name: 'Oficinas Cali', avatar: '/api/placeholder/32/32' },
     { id: 4, name: 'Locales Cartagena', avatar: '/api/placeholder/32/32' },
     { id: 5, name: 'Habitaciones Barranquilla', avatar: '/api/placeholder/32/32' }
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
        {/* Header minimal */}
        <div className="sidebar-header">
          <h2 className="sidebar-title">RentHub</h2>
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

        {/* Accesos directos */}
        {!isCollapsed && (
          <div className="sidebar-shortcuts">
            <h3 className="shortcuts-title">Tus accesos directos</h3>
            <div className="shortcuts-list">
              {shortcuts.map((shortcut) => (
                <div key={shortcut.id} className="shortcut-item">
                  <img src={shortcut.avatar} alt={shortcut.name} className="shortcut-avatar" />
                  <span className="shortcut-name">{shortcut.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default LeftSidebar;