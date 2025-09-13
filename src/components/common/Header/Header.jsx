import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import UserMenu from './UserMenu';
import { 
  HomeIcon, 
  CalendarDaysIcon,
  HeartIcon,
  BellIcon,
  ClockIcon,
  HomeModernIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  GlobeAltIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { 
  FaVolumeUp,
  FaGlobe,
  FaSun,
  FaBrain,
  FaThumbsUp,
  FaInfoCircle,
  FaMobileAlt,
  FaCrown
} from 'react-icons/fa';
import SearchBar from './SearchBar';
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
  const [notifications, setNotifications] = useState([]);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showMobileHeader, setShowMobileHeader] = useState(true);
  const headerRef = useRef(null);

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const grokMenuItems = [
    {
      id: 'voice',
      label: 'Voz',
      value: 'REIN',
      icon: FaVolumeUp,
      onClick: () => {},
    },
    {
      id: 'language',
      label: 'Idiomas',
      value: 'ES',
      icon: FaGlobe,
      onClick: () => {},
    },
    {
      id: 'theme',
      label: 'Tema',
      value: 'DÍA',
      icon: FaSun,
      onClick: () => {},
    },
    {
      id: 'manage-memory',
      label: 'Administrar memoria',
      icon: FaBrain,
      onClick: () => {},
    },
    {
      id: 'send-feedback',
      label: 'Enviar comentarios',
      icon: FaThumbsUp,
      onClick: () => {},
    },
    {
      id: 'about',
      label: 'Acerca de',
      icon: FaInfoCircle,
      onClick: () => {},
    },
    {
      id: 'download-mobile',
      label: 'Descargar aplicación móvil',
      icon: FaMobileAlt,
      onClick: () => {},
    },
    {
      id: 'copilot-pro',
      label: 'Haz más con Copilot Pro',
      subLabel: 'Obtener Copilot Pro',
      icon: FaCrown,
      onClick: () => {},
      isPromo: true,
    },
  ];

  const navigationItems = useMemo(
    () => [
      {
        id: "stays",
        label: "Alojamientos",
        shortLabel: "Alojamientos",
        path: "/search?type=stay",
        icon: HomeIcon,
        hasNovedad: false,
      },
      {
        id: "experiences",
        label: "Experiencias",
        shortLabel: "Experiencias",
        path: "/search?type=experience",
        icon: SparklesIcon,
        hasNovedad: true,
      },
      {
        id: "services",
        label: "Servicios",
        shortLabel: "Servicios",
        path: "/services",
        icon: BellIcon,
        hasNovedad: false,
      },
    ],
    []
  );


  // Manejo del scroll para ocultar/mostrar header móvil y efecto de reducción
  const handleScroll = useCallback(
    throttle(() => {
      const currentScrollY = window.scrollY;

      // Efecto de reducción (isScrolled)
      setIsScrolled(currentScrollY > 10);

      // Comportamiento de ocultar/mostrar header móvil
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scroll hacia abajo: ocultar header
        setShowMobileHeader(false);
      } else {
        // Scroll hacia arriba: mostrar header
        setShowMobileHeader(true);
      }

      setLastScrollY(currentScrollY);
    }, 100),
    [lastScrollY]
  );

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Reset al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchExpanded(false);
  }, [location.pathname]);

  // Control de tecla Escape y overflow
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsSearchExpanded(false);
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

  // Notificaciones simuladas
  useEffect(() => {
    if (isAuthenticated) {
      const mockNotifications = [
        { id: 1, message: "Nueva reserva confirmada", unread: true },
        { id: 2, message: "Mensaje del anfitrión", unread: true },
      ];
      setNotifications(mockNotifications);
      setHasNewNotifications(mockNotifications.some((n) => n.unread));
    }
  }, [isAuthenticated]);

  const handleAuthAction = useCallback(() => {
    navigate(isAuthenticated ? "/dashboard" : "/login");
  }, [isAuthenticated, navigate]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleNotificationClick = useCallback(() => {
    navigate("/notifications");
    setHasNewNotifications(false);
  }, [navigate]);

  const toggleSearchExpanded = useCallback(() => {
    setIsSearchExpanded(prev => !prev);
  }, []);

  // Verificar ruta activa
  const isActiveNavItem = useCallback(
    (itemPath) => {
      if (itemPath.includes("?")) {
        const [path, query] = itemPath.split("?");
        return (
          location.pathname === path &&
          location.search.includes(query.split("=")[1])
        );
      }
      return location.pathname === itemPath;
    },
    [location]
  );

  // Funciones para navegación del UserMenu
  const onProfileClick = useCallback(() => {
    navigate("/profile");
  }, [navigate]);

  const onLogoutClick = useCallback(() => {
    // Lógica de cierre de sesión
    navigate("/login");
  }, [navigate]);

  return (
    <>
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

            {/* Idioma */}
            <button className="desktop-header__language-btn" aria-label="Seleccionar idioma">
              <GlobeAltIcon className="desktop-header__language-icon" />
            </button>

            {/* Botón menú hamburguesa */}
            <button
              className="desktop-header__menu-toggle"
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="desktop-header__menu-icon" aria-hidden="true" />
              ) : (
                <Bars3Icon className="desktop-header__menu-icon" aria-hidden="true" />
              )}
            </button>
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

            {/* Filtros y menú */}
            <div className="mobile-header__right-actions">
              <button className="mobile-header__filter-btn" aria-label="Filtros">
                <svg viewBox="0 0 16 16" className="mobile-header__filter-icon">
                  <path d="M5 8a3 3 0 0 1 2.83 2H14v2H7.83A3 3 0 1 1 5 8zm0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm6-8a3 3 0 1 1-2.83 4H2V4h6.17A3 3 0 0 1 11 2zm0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" fill="currentColor"></path>
                </svg>
              </button>

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
        </div>

        {/* Menú móvil */}
        {isMobileMenuOpen && (
          <div
            id="mobile-menu"
            className="mobile-header__menu"
            role="navigation"
            aria-label="Menú móvil"
          >
            <div className="mobile-header__nav">
              {isAuthenticated ? (
                <>
                  <div className="mobile-header__user-info">
                    <div className="mobile-header__user-avatar">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} />
                      ) : (
                        <div className="mobile-header__avatar-placeholder">
                          {user?.name?.charAt(0) || 'U'}
                        </div>
                      )}
                    </div>
                    <div className="mobile-header__user-details">
                      <div className="mobile-header__user-name">{user?.name || 'Usuario'}</div>
                      <div className="mobile-header__user-email">{user?.email || 'usuario@ejemplo.com'}</div>
                    </div>
                  </div>
                  
                  <div className="mobile-header__divider" />
                </>
              ) : (
                <div className="mobile-header__auth-buttons">
                  <button 
                    className="mobile-header__login-btn"
                    onClick={() => {
                      closeMobileMenu();
                      handleAuthAction();
                    }}
                  >
                    Iniciar sesión
                  </button>
                  <button 
                    className="mobile-header__signup-btn"
                    onClick={() => {
                      closeMobileMenu();
                      navigate('/register');
                    }}
                  >
                    Registrarse
                  </button>
                </div>
              )}

              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveNavItem(item.path);

                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`mobile-header__nav-item ${
                      isActive ? "mobile-header__nav-item--active" : ""
                    }`}
                    onClick={closeMobileMenu}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <div className="mobile-header__nav-icon-wrapper">
                      <Icon className="mobile-header__nav-icon" aria-hidden="true" />
                      {item.hasNovedad && <span className="mobile-header__novedad-badge">NOVEDAD</span>}
                    </div>
                    <span className="mobile-header__nav-label">{item.label}</span>
                  </Link>
                );
              })}

              {isAuthenticated && (
                <>
                  <div className="mobile-header__divider" />
                  
                  <Link
                    to="/favorites"
                    className="mobile-header__nav-item"
                    onClick={closeMobileMenu}
                  >
                    <HeartIcon className="mobile-header__nav-icon" aria-hidden="true" />
                    <span className="mobile-header__nav-label">Favoritos</span>
                  </Link>

                  <Link
                    to="/my-bookings"
                    className="mobile-header__nav-item"
                    onClick={closeMobileMenu}
                  >
                    <CalendarDaysIcon className="mobile-header__nav-icon" aria-hidden="true" />
                    <span className="mobile-header__nav-label">Reservas</span>
                  </Link>

                  <Link
                    to="/notifications"
                    className="mobile-header__nav-item"
                    onClick={closeMobileMenu}
                  >
                    <BellIcon className="mobile-header__nav-icon" aria-hidden="true" />
                    <span className="mobile-header__nav-label">
                      Notificaciones
                      {hasNewNotifications && (
                        <span className="mobile-header__badge">
                          {notifications.filter((n) => n.unread).length}
                        </span>
                      )}
                    </span>
                  </Link>
                </>
              )}

              <div className="mobile-header__divider" />
              
              <Link
                to="/become-host"
                className="mobile-header__nav-item mobile-header__nav-item--highlight"
                onClick={closeMobileMenu}
              >
                <svg className="mobile-header__nav-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L15.5 8.5L22 9L17 14L18.5 22L12 18.5L5.5 22L7 14L2 9L8.5 8.5L12 2Z" fill="#FF385C" />
                </svg>
                <span className="mobile-header__nav-label">Conviértete en anfitrión</span>
              </Link>

              <div className="mobile-header__divider" />
              
              <button className="mobile-header__nav-item">
                <GlobeAltIcon className="mobile-header__nav-icon" />
                <span className="mobile-header__nav-label">Idioma y región</span>
              </button>

              <button className="mobile-header__nav-item">
                <svg className="mobile-header__nav-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                </svg>
                <span className="mobile-header__nav-label">Ayuda</span>
              </button>

              {/* Opciones de autenticación en móvil */}
              {isAuthenticated && (
                <>
                  <div className="mobile-header__divider" />
                  <button 
                    className="mobile-header__nav-item"
                    onClick={() => {
                      closeMobileMenu();
                      onLogoutClick();
                    }}
                  >
                    <span className="mobile-header__nav-label">Cerrar sesión</span>
                  </button>
                </>
              )}
            </div>
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
};

export default Header;