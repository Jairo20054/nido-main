import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

// Componente funcional con hooks
const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Items del centro: vacío por ahora (simplificado)
  const centerItems = [];

  // Opciones del dropdown del avatar - SIMPLIFICADO
  const dropdownItems = [
    { label: 'Crear cuenta', path: '/register' },
    { label: 'Iniciar sesión', path: '/login' }
  ];

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cerrar con ESC
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toggle menú móvil
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Cerrar menú móvil
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="header" role="banner">
      <div className="header-container">
        {/* Logo izquierda */}
        <div className="header-logo">
          <Link to="/" aria-label="Nido - Inicio">
            <svg viewBox="0 0 24 24" className="header-logo-svg">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
            <span className="header-logo-text">Nido</span>
          </Link>
        </div>

        {/* Navegación central - desktop */}
        <nav className="header-center" aria-label="Navegación principal">
          {centerItems.map((item) => (
            <Link key={item.id} to={item.path} className="header-center-item">
              {item.icon}
              <span className="header-center-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Derecha: acción y avatar */}
        <div className="header-right">
          <Link to="/become-host" className="header-host-link" aria-label="Conviértete en anfitrión">
            Conviértete en anfitrión
          </Link>
          <div className="header-avatar-container" ref={dropdownRef}>
            <button
              className="header-avatar-btn"
              onClick={toggleDropdown}
              aria-label="Menú de usuario"
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
            >
              <svg viewBox="0 0 24 24" className="header-avatar-icon">
                <path d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="header-dropdown" role="menu" aria-label="Opciones de usuario">
                {dropdownItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    className="header-dropdown-item"
                    role="menuitem"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Menú móvil - hamburger */}
        
      </div>

      {/* Menú móvil desplegado */}
      {isMobileMenuOpen && (
        <div className="header-mobile-menu" ref={mobileMenuRef} role="navigation" aria-label="Menú móvil">
          <nav className="header-mobile-nav">
            {centerItems.map((item) => (
              <Link key={item.id} to={item.path} className="header-mobile-item" onClick={closeMobileMenu}>
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
            <Link to="/become-host" className="header-mobile-item" onClick={closeMobileMenu}>
              <svg viewBox="0 0 24 24" className="header-center-icon">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
              <span>Conviértete en anfitrión</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
