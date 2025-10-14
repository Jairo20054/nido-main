<<<<<<< HEAD
import { useState, useEffect, useCallback, useMemo, useRef, useLayoutEffect } from 'react';
=======
// src/components/Header/Header.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef, useLayoutEffect } from 'react';
>>>>>>> 7d6191872e2e6da6771f24bf058649816f527586
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import {
  MagnifyingGlassIcon,
  Bars3Icon,
<<<<<<< HEAD
  XMarkIcon
=======
  XMarkIcon,
  HomeModernIcon,
  WrenchScrewdriverIcon,
  HeartIcon,
  UserPlusIcon,
  UserCircleIcon
>>>>>>> 7d6191872e2e6da6771f24bf058649816f527586
} from '@heroicons/react/24/outline';
import './Header.css';

// Función throttle optimizada
function throttle(func, limit) {
  let lastFunc;
  let lastRan;
  return function() {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  }
}

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showMobileHeader, setShowMobileHeader] = useState(true);
  const headerRef = useRef(null);

  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Navegación central - Elementos principales
  const centerNavItems = useMemo(
    () => [
      {
<<<<<<< HEAD
        id: "remodelaciones",
        label: "Remodelaciones",
        shortLabel: "Remodelaciones",
        path: "/remodelaciones",
        icon: HomeIcon,
        hasNovedad: false,
      },
      {
        id: "marketplace",
        label: "Marketplace",
        shortLabel: "Marketplace",
        path: "/marketplace",
        icon: BellIcon,
        hasNovedad: false,
      },
      {
        id: "services",
        label: "Servicios",
        shortLabel: "Servicios",
        path: "/services",
        icon: BellIcon,
        hasNovedad: false,
=======
        id: "alojamientos",
        path: "/alojamientos",
        icon: HomeModernIcon,
        label: "Alojamientos",
        ariaLabel: "Buscar alojamientos"
      },
      {
        id: "experiencias",
        path: "/experiencias",
        icon: UserCircleIcon,
        label: "Experiencias",
        ariaLabel: "Experiencias únicas"
>>>>>>> 7d6191872e2e6da6771f24bf058649816f527586
      },
      {
        id: "servicios",
        path: "/servicios",
        icon: WrenchScrewdriverIcon,
        label: "Servicios",
        ariaLabel: "Servicios adicionales"
      }
    ],
    []
  );

  // Íconos de navegación derecha
  const rightNavIcons = useMemo(
    () => [
      {
        id: "favorites",
        path: "/favorites",
        icon: HeartIcon,
        label: "Favoritos",
        ariaLabel: "Tus propiedades favoritas",
        badge: 3
      }
    ],
    []
  );

  // Manejo del scroll optimizado
  const handleScroll = useCallback(
    throttle(() => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);

      if (window.innerWidth < 769) {
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setShowMobileHeader(false);
        } else if (currentScrollY < lastScrollY || currentScrollY <= 100) {
          setShowMobileHeader(true);
        }
      }

      setLastScrollY(currentScrollY);
    }, 16),
    [lastScrollY]
  );

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Reset estados en cambio de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchExpanded(false);
  }, [location.pathname]);

  // Manejo de Escape y overflow
  useLayoutEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsSearchExpanded(false);
      }
    };

    if (isMobileMenuOpen || isSearchExpanded) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen, isSearchExpanded]);

  const handleAuthAction = useCallback(() => {
    navigate(isAuthenticated ? "/profile" : "/login");
  }, [isAuthenticated, navigate]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const toggleSearchExpanded = useCallback(() => {
    setIsSearchExpanded(prev => !prev);
  }, []);

  const isActiveNavItem = useCallback(
    (itemPath) => location.pathname.startsWith(itemPath),
    [location]
  );

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    const searchTerm = e.target.search?.value;
    if (searchTerm) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  }, [navigate]);

  const renderIconWithBadge = (IconComponent, hasBadge, badgeCount) => (
    <>
<<<<<<< HEAD
      {/* Header superior para desktop */}
      <header 
        ref={headerRef}
        className={`desktop-header hide-mobile ${isScrolled ? "desktop-header--scrolled" : ""}`} 
        role="banner"
      >
        <div className="desktop-header__container">
          {/* Logo */}
          <Link to="/" className="desktop-header__logo" aria-label="Nido - Inicio">
            <div className="desktop-header__logo-icon">
              <svg
                viewBox="0 0 32 32"
                className="desktop-header__logo-svg"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF385C" />
                    <stop offset="100%" stopColor="#FF385C" />
                  </linearGradient>
                </defs>
                <path
                  d="M16 2L3 9v14c0 5.55 3.84 11 13 11s13-5.45 13-11V9L16 2z"
                  fill="url(#logoGradient)"
                />
                <path
                  d="M16 8L8 12v8c0 3.31 2.69 6 8 6s8-2.69 8-6v-8L16 8z"
                  fill="#a06666ff"
                  opacity="0.9"
                />
                <circle cx="16" cy="16" r="3" fill="url(#logoGradient)" />
              </svg>
            </div>
            <span className="desktop-header__logo-text">Nido</span>
          </Link>

          {/* Navegación central */}
          <nav className="desktop-header__nav" aria-label="Navegación principal">
            {navigationItems.map((item) => {
              const isActive = isActiveNavItem(item.path);
              const Icon = item.icon;

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`desktop-header__nav-item ${
                    isActive ? "desktop-header__nav-item--active" : ""
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <div className="desktop-header__nav-icon-wrapper">
                    <Icon className="desktop-header__nav-icon-desktop" aria-hidden="true" />
                    {item.hasNovedad && <span className="desktop-header__novedad-badge">NOVEDAD</span>}
                  </div>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Acciones de usuario */}
          <div className="desktop-header__actions">
            {/* Botón para ser anfitrión */}
            <Link
              to="/become-host"
              className="desktop-header__host-btn"
              aria-label="Conviértete en anfitrión"
            >
              <span>Conviértete en anfitrión</span>
            </Link>

            {/* Menú de usuario - solo si está autenticado */}
            {isAuthenticated && <UserMenu />}

            {/* Botón de login/registro - solo si no está autenticado */}
            {!isAuthenticated && (
              <button
                className="desktop-header__auth-btn"
                onClick={handleAuthAction}
                aria-label="Iniciar sesión o registrarse"
              >
                <span>Iniciar sesión</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Header superior para móviles */}
      <header 
        ref={headerRef}
        className={`mobile-header hide-desktop ${isScrolled ? "mobile-header--scrolled" : ""} ${showMobileHeader ? "" : "mobile-header--hidden"}`} 
        role="banner"
      >
        <div className="mobile-header__container">
          {/* Logo */}
          <Link to="/" className="mobile-header__logo" aria-label="Nido - Inicio">
            <div className="mobile-header__logo-icon">
              <svg
                viewBox="0 0 32 32"
                className="mobile-header__logo-svg"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF385C" />
                    <stop offset="100%" stopColor="#FF385C" />
                  </linearGradient>
                </defs>
                <path
                  d="M16 2L3 9v14c0 5.55 3.84 11 13 11s13-5.45 13-11V9L16 2z"
                  fill="url(#logoGradient)"
                />
                <path
                  d="M16 8L8 12v8c0 3.31 2.69 6 8 6s8-2.69 8-6v-8L16 8z"
                  fill="#a06666ff"
                  opacity="0.9"
                />
                <circle cx="16" cy="16" r="3" fill="url(#logoGradient)" />
              </svg>
            </div>
            <span className="mobile-header__logo-text">Nido</span>
          </Link>

          {/* Acciones de usuario móvil */}
          <div className="mobile-header__actions">
            {/* Barra de búsqueda móvil */}
            <div className="mobile-header__search-container">
              {isSearchExpanded ? (
                <SearchBar 
                  onSearch={(params) => {
                    console.log(params);
                    setIsSearchExpanded(false);
                  }} 
                  onClose={() => setIsSearchExpanded(false)}
                  autoFocus={true}
                />
              ) : (
                <button 
                  className="mobile-header__search-toggle"
                  onClick={toggleSearchExpanded}
                  aria-label="Buscar"
                >
                  <MagnifyingGlassIcon className="mobile-header__search-toggle-icon" />
                  <div className="mobile-header__search-text">
                    <span className="mobile-header__search-label">¿A dónde vas?</span>
                    <span className="mobile-header__search-filters">Cualquier semana · Cualquier huésped</span>
                  </div>
                </button>
              )}
            </div>

            

            {/* Menú de usuario móvil - solo si está autenticado */}
            {isAuthenticated && <UserMenu />}

            {/* Toggle para menú móvil */}
              <button
                className="mobile-header__menu-toggle"
                onClick={toggleMobileMenu}
                aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="mobile-header__menu-icon" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="mobile-header__menu-icon" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

        {/* Menú móvil */}
        {isMobileMenuOpen && (
          <div
            id="mobile-menu"
            className="mobile-header__menu"
            role="navigation"
            aria-label="Menú móvil"
          >
          </div>
        )}

        {/* Fondo difuminado para menú móvil */}
        {isMobileMenuOpen && (
          <div
            className="mobile-header__backdrop"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
        )}
      </header>
    </>
  );
=======
      <IconComponent className="header-icon" aria-hidden="true" />
      {hasBadge && badgeCount > 0 && (
        <span className="header-badge" aria-label={`${badgeCount} notificaciones`}>
          {badgeCount > 99 ? '99+' : badgeCount}
        </span>
      )}
    </>
  );

  return (
    <>
      {/* Header Desktop - Rediseñado */}
      <header 
        ref={headerRef}
        className={`desktop-header ${isScrolled ? "desktop-header--scrolled" : ""}`} 
        role="banner"
      >
        <div className="desktop-header__container">
          {/* Logo Izquierda */}
          <Link to="/" className="desktop-header__logo" aria-label="Nido - Inicio">
            <div className="desktop-header__logo-icon">
              <svg viewBox="0 0 24 24" className="desktop-header__logo-svg" aria-hidden="true">
                <path 
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  fill="none"
                />
              </svg>
            </div>
            <span className="desktop-header__logo-text">Nido</span>
          </Link>

          {/* Navegación Central */}
          <nav className="desktop-header__nav-center" aria-label="Navegación principal">
            {centerNavItems.map((item) => {
              const isActive = isActiveNavItem(item.path);
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`desktop-header__nav-item ${isActive ? "desktop-header__nav-item--active" : ""}`}
                  aria-label={item.ariaLabel}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="desktop-header__nav-icon" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Barra de Búsqueda */}
          <div className="desktop-header__search">
            <form onSubmit={handleSearchSubmit} className="desktop-header__search-container">
              <MagnifyingGlassIcon className="desktop-header__search-icon" aria-hidden="true" />
              <input
                type="text"
                name="search"
                placeholder="Buscar propiedades, servicios..."
                className="desktop-header__search-input"
                aria-label="Buscar en Nido"
              />
            </form>
          </div>

          {/* Navegación Derecha */}
          <div className="desktop-header__nav-right">
            {/* Botón Conviértete en Anfitrión */}
            <Link
              to="/become-host"
              className="desktop-header__become-host-btn"
              aria-label="Conviértete en anfitrión"
            >
              <UserPlusIcon className="desktop-header__become-host-icon" aria-hidden="true" />
              <span>Conviértete en Anfitrión</span>
            </Link>

            {/* Íconos de acción */}
            {rightNavIcons.map((item) => {
              const isActive = isActiveNavItem(item.path);
              const Icon = item.icon;
              const hasBadge = item.badge && item.badge > 0;

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`desktop-header__nav-item ${isActive ? "desktop-header__nav-item--active" : ""}`}
                  aria-label={item.ariaLabel}
                  aria-current={isActive ? "page" : undefined}
                >
                  <div className="desktop-header__nav-icon-wrapper">
                    {renderIconWithBadge(Icon, hasBadge, item.badge)}
                  </div>
                </Link>
              );
            })}

            {/* Sección de Usuario */}
            <div className="desktop-header__user-section">
              {isAuthenticated ? (
                <button 
                  className="desktop-header__avatar-btn" 
                  onClick={() => navigate('/profile')} 
                  aria-label="Mi perfil"
                >
                  <img
                    src={user?.avatar || '/default-avatar.png'}
                    alt={`Avatar de ${user?.name || 'Usuario'}`}
                    className="desktop-header__avatar-img"
                  />
                </button>
              ) : (
                <button 
                  className="desktop-header__auth-btn" 
                  onClick={handleAuthAction}
                  aria-label="Iniciar sesión"
                >
                  <UserCircleIcon className="w-5 h-5" aria-hidden="true" />
                  <span>Iniciar sesión</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Header Móvil - Rediseñado */}
      <header 
        className={`mobile-header ${isScrolled ? "mobile-header--scrolled" : ""} ${showMobileHeader ? "" : "mobile-header--hidden"}`} 
        role="banner"
      >
        <div className="mobile-header__container">
          {/* Logo + Menú Hamburguesa */}
          <div className="mobile-header__left">
            <button 
              className="mobile-header__menu-toggle" 
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="mobile-header__menu-icon" aria-hidden="true" />
              ) : (
                <Bars3Icon className="mobile-header__menu-icon" aria-hidden="true" />
              )}
            </button>
            
            <Link to="/" className="mobile-header__logo" aria-label="Nido - Inicio">
              <div className="mobile-header__logo-icon">
                <svg viewBox="0 0 24 24" className="mobile-header__logo-svg" aria-hidden="true">
                  <path 
                    d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    fill="none"
                  />
                </svg>
              </div>
              <span className="mobile-header__logo-text">Nido</span>
            </Link>
          </div>

          {/* Búsqueda + Acciones */}
          <div className="mobile-header__right">
            {isSearchExpanded ? (
              <div className="mobile-search-full">
                <form className="mobile-search-container" onSubmit={handleSearchSubmit}>
                  <MagnifyingGlassIcon className="mobile-search-icon" aria-hidden="true" />
                  <input
                    type="text"
                    name="search"
                    placeholder="Buscar en Nido..."
                    className="mobile-search-input"
                    autoFocus
                    aria-label="Buscar propiedades"
                  />
                  <button 
                    type="button"
                    className="mobile-search-close"
                    onClick={() => setIsSearchExpanded(false)}
                    aria-label="Cerrar búsqueda"
                  >
                    <XMarkIcon className="w-5 h-5" aria-hidden="true" />
                  </button>
                </form>
              </div>
            ) : (
              <button 
                className="mobile-header__search-toggle" 
                onClick={toggleSearchExpanded}
                aria-label="Buscar propiedades"
              >
                <MagnifyingGlassIcon className="mobile-header__search-icon" aria-hidden="true" />
                <span>Buscar</span>
              </button>
            )}
            
            {/* Acciones rápidas */}
            <div className="mobile-header__actions">
              {rightNavIcons.map((item) => {
                const Icon = item.icon;
                const hasBadge = item.badge && item.badge > 0;
                
                return (
                  <Link 
                    key={item.id} 
                    to={item.path} 
                    className="mobile-header__action-btn" 
                    aria-label={item.ariaLabel}
                  >
                    {renderIconWithBadge(Icon, hasBadge, item.badge)}
                  </Link>
                );
              })}
              
              {/* Avatar/Usuario */}
              {isAuthenticated ? (
                <button 
                  className="mobile-header__action-btn" 
                  onClick={() => navigate('/profile')} 
                  aria-label="Mi perfil"
                >
                  <img 
                    src={user?.avatar || '/default-avatar.png'} 
                    alt={`Avatar de ${user?.name || 'Usuario'}`} 
                    className="mobile-header__avatar-img" 
                  />
                </button>
              ) : (
                <button 
                  className="mobile-header__auth-btn" 
                  onClick={handleAuthAction}
                  aria-label="Iniciar sesión"
                >
                  Iniciar sesión
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Menú Móvil Lateral */}
        <div 
          id="mobile-menu"
          className="mobile-header__menu" 
          role="navigation" 
          aria-label="Menú principal"
          aria-expanded={isMobileMenuOpen}
        >
          <nav className="mobile-header__nav">
            {centerNavItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className="mobile-header__nav-item"
                onClick={closeMobileMenu}
                aria-label={item.ariaLabel}
              >
                <item.icon className="mobile-header__nav-icon" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            ))}
            
            <Link
              to="/become-host"
              className="mobile-header__become-host-mobile"
              onClick={closeMobileMenu}
              aria-label="Conviértete en anfitrión"
            >
              <UserPlusIcon className="mobile-header__nav-icon" aria-hidden="true" />
              <span>Conviértete en Anfitrión</span>
            </Link>
            
            {!isAuthenticated && (
              <button 
                className="mobile-header__auth-btn-full" 
                onClick={() => {
                  handleAuthAction();
                  closeMobileMenu();
                }}
                aria-label="Iniciar sesión"
              >
                Iniciar sesión en Nido
              </button>
            )}
          </nav>
        </div>

        {/* Backdrop para menú móvil */}
        {isMobileMenuOpen && (
          <div 
            className="mobile-header__backdrop" 
            onClick={closeMobileMenu} 
            aria-hidden="true" 
            role="button"
            tabIndex={-1}
          />
        )}
      </header>
    </>
  );
>>>>>>> 7d6191872e2e6da6771f24bf058649816f527586
};

export default React.memo(Header);