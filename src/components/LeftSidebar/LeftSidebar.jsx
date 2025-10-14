// LeftSidebar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiSearch, FiVideo, FiMessageSquare, FiUser, FiMap, FiTrendingUp, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import './LeftSidebar.css';

const LS_KEY = 'nido_sidebar_collapsed';

const LeftSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(
    () => localStorage.getItem(LS_KEY) === 'true' || false
  );
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(null);
  const sidebarRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Mock user and badgeCounts for now
  const user = { name: 'Andres Castillo', avatar: null, subtitle: 'Ver tu perfil' };
  const badgeCounts = { reels: 0, mensajes: 0 };

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 900; // umbral más amplio
      setIsMobile(mobile);
      if (!mobile) setIsMobileOpen(false);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEY, isCollapsed ? 'true' : 'false');
  }, [isCollapsed]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (isMobileOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setIsMobileOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isMobileOpen) setIsMobileOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isMobileOpen]);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen((s) => !s);
    } else {
      setIsCollapsed((s) => !s);
    }
  };

  const handleItemClick = (path) => {
    navigate(path);
    if (isMobile) setIsMobileOpen(false);
  };

  // ========== ITEMS DE NAVEGACIÓN INNOVADORES ==========
  const navigationItems = [
    {
      id: 'busqueda',
      icon: <FiSearch />,
      label: 'Búscar',
      description: 'Encuentra propiedades ideales',
      path: '/search'
    },
    {
      id: 'reels',
      icon: <FiVideo />,
      label: 'Reels',
      description: 'Recorridos virtuales en video',
      badge: badgeCounts.reels || 0,
      path: '/reels'
    },
    {
      id: 'mensajes',
      icon: <FiMessageSquare />,
      label: 'Mensajes',
      description: 'Conversaciones y chats',
      badge: badgeCounts.mensajes || 0,
      path: '/messages'
    },
    {
      id: 'perfil',
      icon: <FiUser />,
      label: 'Mi Perfil',
      description: 'Gestiona tu cuenta',
      path: '/profile'
    },
    {
      id: 'mapa',
      icon: <FiMap />,
      label: 'Mapa Interactivo',
      description: 'Explora propiedades en mapa',
      path: '/map'
    },
    {
      id: 'tendencias',
      icon: <FiTrendingUp />,
      label: 'Tendencias',
      description: 'Descubre las últimas tendencias',
      path: '/trends'
    }
  ];

  return (
    <>
      {/* overlay móvil */}
      {isMobile && isMobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* botón hamburguesa fijo pero fuera del flujo */}
      {isMobile && (
        <button
          className="mobile-toggle-button"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Abrir menú"
        >
          ☰
        </button>
      )}

      <nav
        ref={sidebarRef}
        className={[
          'left-sidebar',
          isCollapsed ? 'collapsed' : '',
          isMobile ? 'mobile' : '',
          isMobileOpen ? 'mobile-open' : '',
        ].join(' ')}
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
              {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
            </button>
          )}
        </div>

        <ul className="sidebar-menu" role="menubar">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li
                key={item.id}
                className={`menu-item ${isActive ? 'active' : ''} ${
                  item.badge ? 'has-badge' : ''
                }`}
              >
                <button
                  type="button"
                  className="menu-item-content"
                  onClick={() => handleItemClick(item.path)}
                  onMouseEnter={() => isCollapsed && setTooltipVisible(item.id)}
                  onMouseLeave={() => setTooltipVisible(null)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="menu-icon" aria-hidden="true">
                    {item.icon}
                    {item.badge && (
                      <span className="badge" aria-label={`${item.badge} notificaciones`}>
                        {item.badge}
                      </span>
                    )}
                  </span>

                  {!isCollapsed && (
                    <div className="menu-text">
                      <span className="menu-label">{item.label}</span>
                    </div>
                  )}
                </button>

                {/* tooltip modo colapsado */}
                {isCollapsed && tooltipVisible === item.id && (
                  <div className="menu-tooltip" role="tooltip">
                    {item.label}
                  </div>
                )}
              </li>
            );
          })}
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
