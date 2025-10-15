// src/components/Header/Header.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef, useLayoutEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import {
  Bars3Icon,
  XMarkIcon,
  HomeModernIcon,
  WrenchScrewdriverIcon,
  HeartIcon,
  UserPlusIcon,
  UserCircleIcon
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
      },
      {
        id: "servicios",
        path: "/servicios",
        icon: WrenchScrewdriverIcon,
        label: "Servicios",
        ariaLabel: "Servicios adicionales"
      },
      {
        id: "marketplace",
        path: "/marketplace",
        icon: HeartIcon,
        label: "Marketplace",
        ariaLabel: "Marketplace de productos"
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
  }, [location.pathname]);

  // Manejo de Escape y overflow
  useLayoutEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const handleAuthAction = useCallback(() => {
    navigate(isAuthenticated ? "/profile" : "/login");
  }, [isAuthenticated, navigate]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const isActiveNavItem = useCallback(
    (itemPath) => location.pathname.startsWith(itemPath),
    [location]
  );

  const renderIconWithBadge = (IconComponent, hasBadge, badgeCount) => (
    <>
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

          {/* Navegación Central - Expandida para llenar espacio */}
          <nav className="desktop-header__nav-center" aria-label="Navegación principal" style={{ flex: 1 }}>
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

          {/* Acciones rápidas */}
          <div className="mobile-header__right">
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
            {centerNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className="mobile-header__nav-item"
                  onClick={closeMobileMenu}
                  aria-label={item.ariaLabel}
                >
                  <Icon className="mobile-header__nav-icon" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

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
};

export default React.memo(Header);
