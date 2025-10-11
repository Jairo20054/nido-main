// src/components/Header/Header.jsx
import { useState, useEffect, useCallback, useMemo, useRef, useLayoutEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import {
  HomeIcon,
  BellIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  EnvelopeIcon,
  UserCircleIcon,
  PlusIcon,
  BuildingOffice2Icon,
  WrenchScrewdriverIcon,
  ShoppingBagIcon,
  UsersIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
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
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showMobileHeader, setShowMobileHeader] = useState(true);
  const headerRef = useRef(null);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = useMemo(
    () => [
      {
        id: "home",
        label: "Inicio",
        path: "/",
        icon: HomeIcon,
      },
      {
        id: "properties",
        label: "Propiedades",
        path: "/properties",
        icon: BuildingOffice2Icon,
      },
      {
        id: "services",
        label: "Servicios",
        path: "/services",
        icon: WrenchScrewdriverIcon,
      },
      {
        id: "marketplace",
        label: "Marketplace",
        path: "/marketplace",
        icon: ShoppingBagIcon,
      },
      {
        id: "groups",
        label: "Grupos",
        path: "/groups",
        icon: UsersIcon,
      },
      {
        id: "profile",
        label: "Perfil",
        path: "/profile",
        icon: UserCircleIcon,
      },
    ],
    []
  );


  // Manejo del scroll para ocultar/mostrar header móvil y efecto de reducción
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Control de tecla Escape y overflow - usar useLayoutEffect para manipulación de layout
  useLayoutEffect(() => {
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

  const handleAuthAction = useCallback(() => {
    navigate(isAuthenticated ? "/dashboard" : "/login");
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
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-40 bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] transition-all duration-200 ${isScrolled ? "py-1" : "py-2"} ${showMobileHeader ? "" : "transform -translate-y-full"}`}
        role="banner"
      >
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
          {/* Logo Left */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0" aria-label="RentHub - Inicio">
            <div className="w-8 h-8 bg-[var(--fb-blue)] rounded-full flex items-center justify-center">
              <span className="text-[var(--text-inverse)] font-bold text-sm">RH</span>
            </div>
            <span className="text-[var(--text-primary)] font-bold text-xl">RentHub</span>
          </Link>

          {/* Search Center */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <SearchBar
              onSearch={(params) => {
                console.log(params);
              }}
              className="w-full bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-quaternary)] border border-[var(--border-primary)] rounded-full px-4 py-2"
            />
          </div>

          {/* Mobile Search Toggle */}
          <div className="flex-1 max-w-md mx-4 md:hidden">
            <button
              className="w-full text-left p-2 rounded-full bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-primary)] transition-colors"
              onClick={toggleSearchExpanded}
              aria-label="Buscar"
            >
              <div className="flex items-center space-x-2">
                <MagnifyingGlassIcon className="w-5 h-5 flex-shrink-0" />
                <div>
                  <span className="block text-sm font-medium">¿A dónde vas?</span>
                  <span className="block text-xs text-gray-500">Cualquier semana · Cualquier huésped</span>
                </div>
              </div>
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Become Host - Desktop */}
            {!isAuthenticated && (
              <Link
                to="/become-host"
                className="hidden md:block px-4 py-2 bg-[var(--fb-blue)] text-[var(--text-inverse)] rounded-full text-sm font-medium hover:bg-[var(--accent-dark)] transition-colors"
                aria-label="Conviértete en anfitrión"
              >
                Anfitrión
              </Link>
            )}

            {/* Icons - Desktop */}
            <div className="hidden md:flex items-center space-x-2">
              <Link to="/" className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full transition-colors" aria-label="Inicio">
                <HomeIcon className="w-6 h-6" />
              </Link>
              <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full transition-colors relative" aria-label="Notificaciones">
                <BellIcon className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--error-500)] rounded-full"></span>
              </button>
              <Link to="/messages" className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full transition-colors" aria-label="Mensajes">
                <EnvelopeIcon className="w-6 h-6" />
              </Link>
              <Link to="/post/new" className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full transition-colors bg-[var(--fb-blue)] text-[var(--text-inverse)] hover:bg-[var(--accent-dark)]" aria-label="Crear publicación">
                <PlusIcon className="w-6 h-6" />
              </Link>
            </div>

            {/* Icons - Mobile */}
            <div className="flex items-center space-x-2 md:hidden">
              <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full" aria-label="Notificaciones">
                <BellIcon className="w-6 h-6" />
              </button>
              <Link to="/messages" className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full" aria-label="Mensajes">
                <EnvelopeIcon className="w-6 h-6" />
              </Link>
              <Link to="/post/new" className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full bg-[var(--fb-blue)] text-[var(--text-inverse)]" aria-label="Crear publicación">
                <PlusIcon className="w-6 h-6" />
              </Link>
            </div>

            {/* User Menu or Auth Button */}
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <button
                className="px-4 py-2 bg-[var(--fb-blue)] text-[var(--text-inverse)] rounded-full text-sm font-medium hover:bg-[var(--accent-dark)] transition-colors ml-2"
                onClick={handleAuthAction}
                aria-label="Iniciar sesión"
              >
                Iniciar sesión
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 ml-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full"
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Expanded Search */}
      {isSearchExpanded && (
        <div className="md:hidden fixed top-16 left-0 right-0 z-40 bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] p-4 shadow-sm">
          <SearchBar
            onSearch={(params) => {
              console.log(params);
              setIsSearchExpanded(false);
            }}
            onClose={() => setIsSearchExpanded(false)}
            autoFocus={true}
            className="w-full bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-quaternary)] border border-[var(--border-primary)] rounded-full px-4 py-2"
          />
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div className="md:hidden fixed top-16 left-0 right-0 z-40 bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] max-h-screen overflow-y-auto py-4">
            <nav className="px-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className="flex items-center space-x-4 p-3 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    onClick={closeMobileMenu}
                  >
                    <Icon className="w-6 h-6 text-[var(--text-quaternary)] flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              {!isAuthenticated && (
                <Link
                  to="/become-host"
                  className="flex items-center space-x-4 p-3 rounded-lg bg-[var(--fb-blue)] text-[var(--text-inverse)] transition-colors"
                  onClick={closeMobileMenu}
                >
                  <UserPlusIcon className="w-6 h-6 flex-shrink-0" />
                  <span className="font-medium">Conviértete en anfitrión</span>
                </Link>
              )}
            </nav>
          </div>
          <div
            className="md:hidden fixed inset-0 bg-[var(--bg-overlay)] z-30"
            onClick={closeMobileMenu}
          />
        </>
      )}
    </>
  );

};

export default Header;