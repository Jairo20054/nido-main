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
        <div className="sidebar-header">
          <div className="user-block">
            <img src="/api/placeholder/40/40" alt="Avatar" className="user-avatar" />
            {!isCollapsed && (
              <div className="user-info">
                <div className="user-name">Andres Castillo</div>
                <div className="user-subtitle">Ver tu perfil</div>
              </div>
            )}
          </div>

          {!isMobile && (
            <button
              className="sidebar-toggle"
              onClick={toggleSidebar}
              aria-label={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
            >
              {isCollapsed ? '›' : '‹'}
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
        </div>
      </nav>
    </>
  );
};

export default LeftSidebar;
