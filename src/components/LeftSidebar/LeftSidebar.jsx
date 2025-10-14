// LeftSidebar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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

  const navigationItems = [
    { id: 'profile', icon: '👤', label: 'Andres Castillo', path: '/profile' },
    { id: 'amigos', icon: '👥', label: 'Amigos', path: '/friends', badge: 3 },
    { id: 'recuerdos', icon: '🕒', label: 'Recuerdos', path: '/memories' },
    { id: 'guardado', icon: '💾', label: 'Guardado', path: '/saved' },
    { id: 'grupos', icon: '👪', label: 'Grupos', path: '/groups', badge: 5 },
    { id: 'reels', icon: '🎬', label: 'Reels', path: '/reels' },
    { id: 'feeds', icon: '📰', label: 'Feeds', path: '/feeds' },
    { id: 'ver-mas', icon: '⋮', label: 'Ver más', path: '/more' },
  ];

  const shortcuts = [
    { id: 1, name: 'Apuestas Colombia', icon: '🎰' },
    { id: 2, name: '8 Ball Pool', icon: '🎱' },
    { id: 3, name: 'ASMR TOTAL', icon: '🎧' },
    { id: 4, name: 'Astro Garden', icon: '🌌' },
    { id: 5, name: 'Baby Adopter', icon: '👶' },
  ];

<<<<<<< HEAD
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
      id: 'mensajes',
      icon: <MessageIcon />,
      label: 'Mensajes',
      description: 'Conversaciones y chats',
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
      description: 'Explora propiedades en mapa'
    },
    {
      id: 'tendencias',
      icon: <TrendingIcon />,
      label: 'Tendencias',
      description: 'Descubre las últimas tendencias'
    }
  ];

  // ========== RENDERIZADO ==========
=======
>>>>>>> 7d6191872e2e6da6771f24bf058649816f527586
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
<<<<<<< HEAD
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
=======
        <div className="sidebar-header">
          <div className="user-block">
            <img src="/api/placeholder/40/40" alt="Avatar" className="user-avatar" />
            {!isCollapsed && (
              <div className="user-info">
                <div className="user-name">Andres Castillo</div>
                <div className="user-subtitle">Ver tu perfil</div>
>>>>>>> 7d6191872e2e6da6771f24bf058649816f527586
              </div>
            )}
          </div>

<<<<<<< HEAD
          {/* Botón de toggle para desktop */}
=======
>>>>>>> 7d6191872e2e6da6771f24bf058649816f527586
          {!isMobile && (
            <button
              className="sidebar-toggle"
              onClick={toggleSidebar}
<<<<<<< HEAD
              aria-label={isCollapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
              aria-expanded={!isCollapsed}
            >
              {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
=======
              aria-label={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
            >
              {isCollapsed ? '›' : '‹'}
>>>>>>> 7d6191872e2e6da6771f24bf058649816f527586
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

<<<<<<< HEAD
        {/* Footer del sidebar */}
        <div className="sidebar-footer">
          {!isCollapsed && (
            <div className="sidebar-stats">
              
            </div>
          )}
=======
        <div className="sidebar-divider" />

        {!isCollapsed && (
          <div className="sidebar-shortcuts" aria-label="Accesos directos">
            <h3 className="shortcuts-title">Tus accesos directos</h3>
            <div className="shortcuts-list">
              {shortcuts.map((s) => (
                <button
                  key={s.id}
                  className="shortcut-item"
                  onClick={() => console.log('Acceso directo:', s.name)}
                >
                  <span className="shortcut-icon" aria-hidden="true">
                    {s.icon}
                  </span>
                  <span className="shortcut-name">{s.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="sidebar-footer">
          <div className="sidebar-copyright">Nido © {new Date().getFullYear()}</div>
>>>>>>> 7d6191872e2e6da6771f24bf058649816f527586
        </div>
      </nav>
    </>
  );
};

export default LeftSidebar;
