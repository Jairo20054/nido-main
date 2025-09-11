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
  XMarkIcon
} from '@heroicons/react/24/outline';
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

  const navigationItems = useMemo(
    () => [
      {
        id: "home",
        label: "Inicio",
        shortLabel: "Inicio",
        path: "/",
        icon: HomeIcon,
        description: "Página principal",
        color: "blue",
      },
      {
        id: "short-stays",
        label: "Estadías Cortas",
        shortLabel: "Cortas",
        path: "/search?type=short",
        icon: ClockIcon,
        description: "Hasta 30 días",
        color: "blue",
      },
      {
        id: "long-stays",
        label: "Estadías Largas",
        shortLabel: "Largas",
        path: "/search?type=long",
        icon: HomeModernIcon,
        description: "Más de 30 días",
        color: "green",
      },
      {
        id: "services",
        label: "Servicios",
        shortLabel: "Servicios",
        path: "/services",
        icon: SparklesIcon,
        description: "Limpieza, tours, más",
        color: "purple",
      },
      {
        id: "bookings",
        label: "Reservas",
        shortLabel: "Reservas",
        path: "/my-bookings",
        icon: CalendarDaysIcon,
        description: "Mis reservaciones",
        color: "orange",
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

  const onReservationsClick = useCallback(() => {
    navigate("/my-bookings");
  }, [navigate]);

  const onPropertiesClick = useCallback(() => {
    navigate("/host/properties");
  }, [navigate]);

  const onSettingsClick = useCallback(() => {
    navigate("/profile");
  }, [navigate]);

  const onLogoutClick = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  return (
    <>
      {/* Header lateral para desktop */}
      <aside className="sidebar-header hide-mobile" role="complementary">
        <div className="sidebar-header__inner">
          {/* Logo */}
          <Link to="/" className="sidebar-header__logo" aria-label="Nido - Inicio">
            <div className="sidebar-header__logo-icon">
              <svg
                viewBox="0 0 32 32"
                className="sidebar-header__logo-svg"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#0EA5E9" />
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
            <span className="sidebar-header__logo-text">Nido</span>
          </Link>

          {/* Navegación lateral */}
          <nav className="sidebar-header__nav" aria-label="Navegación principal">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveNavItem(item.path);

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`sidebar-header__nav-item ${
                    isActive ? "sidebar-header__nav-item--active" : ""
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="sidebar-header__nav-icon" aria-hidden="true" />
                  <span className="sidebar-header__nav-label">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Acciones de usuario en sidebar */}
          <div className="sidebar-header__actions">
            {/* Favoritos */}
            {isAuthenticated && (
              <Link
                to="/favorites"
                className="sidebar-header__action-btn"
                aria-label="Mis favoritos"
                title="Mis favoritos"
              >
                <HeartIcon className="sidebar-header__action-icon" />
                <span className="sidebar-header__action-label">Favoritos</span>
              </Link>
            )}

            {/* Notificaciones */}
            {isAuthenticated && (
              <button
                onClick={handleNotificationClick}
                className="sidebar-header__action-btn sidebar-header__notifications"
                aria-label={`Notificaciones${hasNewNotifications ? " (nuevas)" : ""}`}
                title="Notificaciones"
              >
                <BellIcon className="sidebar-header__action-icon" />
                <span className="sidebar-header__action-label">Notificaciones</span>
                {hasNewNotifications && (
                  <span className="sidebar-header__notification-badge" aria-hidden="true">
                    {notifications.filter((n) => n.unread).length}
                  </span>
                )}
              </button>
            )}

            {/* Convertirse en anfitrión */}
            <Link
              to="/become-host"
              className="sidebar-header__host-link"
              aria-label="Ofrece tu espacio como anfitrión"
            >
              <svg
                className="sidebar-header__host-icon"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <path
                  d="M8 0L10.5 5L16 5.5L11.5 9L13 16L8 13L3 16L4.5 9L0 5.5L5.5 5L8 0Z"
                  fill="#10B981"
                />
              </svg>
              <span className="sidebar-header__host-label">Ofrece tu espacio</span>
            </Link>

            {/* Menú de usuario */}
            <UserMenu
              user={user}
              isAuthenticated={isAuthenticated}
              onAuthAction={handleAuthAction}
              notifications={notifications}
              hasNewNotifications={hasNewNotifications}
              onProfileClick={onProfileClick}
              onReservationsClick={onReservationsClick}
              onPropertiesClick={onPropertiesClick}
              onSettingsClick={onSettingsClick}
              onLogoutClick={onLogoutClick}
              variant="sidebar"
            />
          </div>
        </div>
      </aside>

      {/* Header superior para móviles */}
      <header 
        ref={headerRef}
        className={`header hide-desktop ${isScrolled ? "header--scrolled" : ""} ${showMobileHeader ? "" : "header--hidden"}`} 
        role="banner"
      >
        <div className="header__container">
          {/* Logo */}
          <Link to="/" className="header__logo" aria-label="Nido - Inicio">
            <div className="header__logo-icon">
              <svg
                viewBox="0 0 32 32"
                className="header__logo-svg"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#0EA5E9" />
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
            <span className="header__logo-text">Nido</span>
          </Link>

          {/* Barra de búsqueda móvil */}
          <div className="header__search-container">
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
                className="header__search-toggle"
                onClick={toggleSearchExpanded}
                aria-label="Buscar"
              >
                <MagnifyingGlassIcon className="header__search-toggle-icon" />
              </button>
            )}
          </div>

          {/* Acciones de usuario móvil */}
          <div className="header__actions">
            {/* Toggle para menú móvil */}
            <button
              className="header__mobile-toggle"
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="header__mobile-icon" aria-hidden="true" />
              ) : (
                <Bars3Icon className="header__mobile-icon" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {isMobileMenuOpen && (
          <div
            id="mobile-menu"
            className="header__mobile-menu"
            role="navigation"
            aria-label="Menú móvil"
          >
            <div className="header__mobile-nav">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveNavItem(item.path);

                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`header__mobile-nav-item ${
                      isActive ? "header__mobile-nav-item--active" : ""
                    }`}
                    onClick={closeMobileMenu}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className="header__mobile-nav-icon" aria-hidden="true" />
                    <div>
                      <div className="header__mobile-nav-label">{item.label}</div>
                      <div className="header__mobile-nav-description">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}

              {isAuthenticated && (
                <>
                  <div className="header__mobile-divider" />
                  <Link
                    to="/favorites"
                    className="header__mobile-nav-item"
                    onClick={closeMobileMenu}
                  >
                    <HeartIcon
                      className="header__mobile-nav-icon"
                      aria-hidden="true"
                    />
                    <div>
                      <div className="header__mobile-nav-label">Mis Favoritos</div>
                      <div className="header__mobile-nav-description">
                        Lugares guardados
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/notifications"
                    className="header__mobile-nav-item"
                    onClick={closeMobileMenu}
                  >
                    <BellIcon
                      className="header__mobile-nav-icon"
                      aria-hidden="true"
                    />
                    <div>
                      <div className="header__mobile-nav-label">
                        Notificaciones
                        {hasNewNotifications && (
                          <span className="header__mobile-badge">
                            {notifications.filter((n) => n.unread).length}
                          </span>
                        )}
                      </div>
                      <div className="header__mobile-nav-description">
                        {hasNewNotifications
                          ? "Tienes notificaciones nuevas"
                          : "Sin notificaciones nuevas"}
                      </div>
                    </div>
                  </Link>
                </>
              )}

              <div className="header__mobile-divider" />
              <Link
                to="/become-host"
                className="header__mobile-nav-item header__mobile-nav-item--highlight"
                onClick={closeMobileMenu}
              >
                <svg
                  className="header__mobile-nav-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M12 2L15.5 8.5L22 9L17 14L18.5 22L12 18.5L5.5 22L7 14L2 9L8.5 8.5L12 2Z"
                    fill="#10B981"
                  />
                </svg>
                <div>
                  <div className="header__mobile-nav-label">Ofrece tu espacio</div>
                  <div className="header__mobile-nav-description">
                    Gana dinero extra siendo anfitrión
                  </div>
                </div>
              </Link>

              {/* Opciones de autenticación en móvil */}
              <div className="header__mobile-divider" />
              {isAuthenticated ? (
                <>
                  <button 
                    className="header__mobile-nav-item"
                    onClick={() => {
                      closeMobileMenu();
                      onProfileClick();
                    }}
                  >
                    <div className="header__mobile-nav-label">Mi Perfil</div>
                  </button>
                  <button 
                    className="header__mobile-nav-item"
                    onClick={() => {
                      closeMobileMenu();
                      onLogoutClick();
                    }}
                  >
                    <div className="header__mobile-nav-label">Cerrar Sesión</div>
                  </button>
                </>
              ) : (
                <button 
                    className="header__mobile-nav-item"
                    onClick={() => {
                      closeMobileMenu();
                      handleAuthAction();
                    }}
                  >
                    <div className="header__mobile-nav-label">Iniciar Sesión</div>
                  </button>
              )}
            </div>
          </div>
        )}

        {/* Fondo difuminado para menú móvil */}
        {isMobileMenuOpen && (
          <div
            className="header__mobile-backdrop"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
        )}
      </header>
    </>
  );
};

export default Header;