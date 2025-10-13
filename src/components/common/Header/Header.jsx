// src/components/Header/Header.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef, useLayoutEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import {
  HomeIcon,
  BellIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  ShoppingBagIcon,
  UsersIcon,
  VideoCameraIcon,
  EllipsisVerticalIcon
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
  const [notificationCount, setNotificationCount] = useState(5);
  const headerRef = useRef(null);

  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Íconos de navegación derecha - Adaptados a Nido
  const rightNavIcons = useMemo(
    () => [
      {
        id: "home",
        path: "/home",
        icon: HomeIcon,
        label: "Inicio",
        ariaLabel: "Ir al feed principal"
      },
      {
        id: "watch",
        path: "/live",
        icon: VideoCameraIcon,
        label: "Live",
        ariaLabel: "Tours en vivo de propiedades"
      },
      {
        id: "marketplace",
        path: "/marketplace",
        icon: ShoppingBagIcon,
        label: "Propiedades",
        ariaLabel: "Buscar propiedades"
      },
      {
        id: "groups",
        path: "/groups",
        icon: UsersIcon,
        label: "Grupos",
        ariaLabel: "Unirse a grupos"
      },
      {
        id: "notifications",
        path: "/notifications",
        icon: BellIcon,
        label: "Notificaciones",
        ariaLabel: "Ver notificaciones",
        badge: notificationCount > 0 ? notificationCount : null
      },
      {
        id: "messages",
        path: "/messages",
        icon: ChatBubbleLeftRightIcon,
        label: "Mensajes",
        ariaLabel: "Mensajes con inquilinos/propietarios"
      }
    ],
    [notificationCount]
  );

  // Manejo del scroll
  const handleScroll = useCallback(
    throttle(() => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 10);

      if (window.innerWidth < 769) {
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setShowMobileHeader(false);
        } else {
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
    (itemPath) => location.pathname === itemPath,
    [location]
  );

  const renderIconWithBadge = (IconComponent, hasBadge, badgeCount) => (
    <>
      <IconComponent className="header-icon" aria-hidden="true" />
      {hasBadge && (
        <span className="header-badge" aria-label={`${badgeCount} notificaciones pendientes`}>
          {badgeCount > 99 ? '99+' : badgeCount}
        </span>
      )}
    </>
  );

  return (
    <>
      {/* Header Desktop - Modo Claro */}
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
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  fill="none"
                />
              </svg>
            </div>
            <span className="desktop-header__logo-text">Nido</span>
          </Link>

          {/* Barra de Búsqueda Central */}
          <div className="desktop-header__search">
            <div className="desktop-header__search-container">
              <MagnifyingGlassIcon className="desktop-header__search-icon" aria-hidden="true" />
              <input
                type="text"
                placeholder="Buscar en Nido..."
                className="desktop-header__search-input"
                aria-label="Buscar en Nido"
                onFocus={() => navigate('/search')}
              />
            </div>
          </div>

          {/* Íconos Derecha */}
          <nav className="desktop-header__nav-right" aria-label="Navegación rápida">
            {rightNavIcons.map((item) => {
              const isActive = isActiveNavItem(item.path);
              const Icon = item.icon;
              const hasBadge = item.id === 'notifications' && item.badge;

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
            
            {/* Menú de Usuario */}
            <div className="desktop-header__user-section">
              <button className="desktop-header__nav-item" aria-label="Más opciones">
                <EllipsisVerticalIcon className="header-icon" aria-hidden="true" />
              </button>
              {isAuthenticated ? (
                <button className="desktop-header__avatar-btn" onClick={() => navigate('/profile')} aria-label="Perfil">
                  <img 
                    src={user?.avatar || '/default-avatar.png'} 
                    alt="Avatar" 
                    className="desktop-header__avatar-img" 
                  />
                </button>
              ) : (
                <button className="desktop-header__auth-btn" onClick={handleAuthAction}>
                  Iniciar sesión
                </button>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Header Móvil */}
      <header 
        className={`mobile-header ${isScrolled ? "mobile-header--scrolled" : ""} ${showMobileHeader ? "" : "mobile-header--hidden"}`} 
        role="banner"
      >
        <div className="mobile-header__container">
          {/* Logo + Hamburger Left */}
          <div className="mobile-header__left">
            <Link to="/" className="mobile-header__logo" aria-label="Nido - Inicio">
              <div className="mobile-header__logo-icon">
                <svg viewBox="0 0 24 24" className="mobile-header__logo-svg" aria-hidden="true">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    fill="none"
                  />
                </svg>
              </div>
              <span className="mobile-header__logo-text">Nido</span>
            </Link>
            <button 
              className="mobile-header__menu-toggle" 
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="mobile-header__menu-icon" aria-hidden="true" />
              ) : (
                <Bars3Icon className="mobile-header__menu-icon" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Search + Íconos Right */}
          <div className="mobile-header__right">
            {isSearchExpanded ? (
              <div className="mobile-search-full">
                <div className="mobile-search-container">
                  <MagnifyingGlassIcon className="mobile-search-icon" />
                  <input
                    type="text"
                    placeholder="Buscar en Nido..."
                    className="mobile-search-input"
                    autoFocus
                  />
                  <button 
                    className="mobile-search-close"
                    onClick={() => setIsSearchExpanded(false)}
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
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
            
            {/* Íconos compactos right en móvil */}
            <div className="mobile-header__icons">
              {rightNavIcons.slice(0, 3).map((item) => {
                const Icon = item.icon;
                const hasBadge = item.id === 'notifications' && item.badge;
                return (
                  <Link key={item.id} to={item.path} className="mobile-header__icon-link" aria-label={item.ariaLabel}>
                    <div className="mobile-header__icon-wrapper">
                      {renderIconWithBadge(Icon, hasBadge, item.badge)}
                    </div>
                  </Link>
                );
              })}
              
              {/* Avatar/User */}
              {isAuthenticated ? (
                <button className="mobile-header__avatar-btn" onClick={() => navigate('/profile')} aria-label="Perfil">
                  <img 
                    src={user?.avatar || '/default-avatar.png'} 
                    alt="Avatar" 
                    className="mobile-header__avatar-img" 
                  />
                </button>
              ) : (
                <button className="mobile-header__auth-btn" onClick={handleAuthAction}>
                  Iniciar sesión
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Menú Móvil Lateral */}
        {isMobileMenuOpen && (
          <div className="mobile-header__menu" role="navigation" aria-label="Menú móvil">
            <nav className="mobile-header__nav">
              {rightNavIcons.map((item) => (
                <Link 
                  key={item.id} 
                  to={item.path} 
                  className="mobile-header__nav-item" 
                  onClick={closeMobileMenu}
                >
                  <item.icon className="mobile-header__nav-icon" aria-hidden="true" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="mobile-nav-badge">{item.badge}</span>
                  )}
                </Link>
              ))}
              {!isAuthenticated && (
                <button className="mobile-header__auth-btn-full" onClick={handleAuthAction}>
                  Iniciar sesión
                </button>
              )}
            </nav>
          </div>
        )}

        {/* Backdrop para menú móvil */}
        {isMobileMenuOpen && (
          <div className="mobile-header__backdrop" onClick={closeMobileMenu} aria-hidden="true" />
        )}
      </header>
    </>
  );
};

export default Header;