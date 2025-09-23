import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
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
import UserMenu from './UserMenu';
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
        hasNovedad: false,
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
};

export default Header;