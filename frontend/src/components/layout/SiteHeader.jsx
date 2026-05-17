import React, { useEffect, useState } from 'react';
import { House, LogOut, Menu, User, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/useAuth';

export function SiteHeader() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dashboardHref = '/dashboard';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 16);

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = async () => {
    await logout();
    closeMobileMenu();
    navigate('/');
  };

  const renderNavLinks = () => (
    <>
      <Link to="/properties" onClick={closeMobileMenu}>
        Buscar
      </Link>
      <Link to="/saved" onClick={closeMobileMenu}>
        Guardados
      </Link>
      <a href="/#para-propietarios" onClick={closeMobileMenu}>
        Para propietarios
      </a>
    </>
  );

  const renderAuthenticatedLinks = () => (
    <>
      <Link to={dashboardHref} className="site-header__link" onClick={closeMobileMenu}>
        Panel
      </Link>
      <Link to="/account" className="site-header__link" onClick={closeMobileMenu}>
        <User size={16} />
        {user?.firstName}
      </Link>
      <button
        className="site-header__button site-header__button--ghost"
        type="button"
        onClick={handleLogout}
      >
        <LogOut size={14} />
        Salir
      </button>
    </>
  );

  return (
    <header className={`site-header ${isScrolled ? 'site-header--scrolled' : ''}`}>
      <div className="site-header__container">
        <Link to="/" className="brand" onClick={closeMobileMenu}>
          <span className="brand__mark" aria-hidden="true">
            <span className="brand__mark-home">
              <House size={13} strokeWidth={2.4} />
            </span>
            <span className="brand__mark-leaf"></span>
          </span>
          <span className="brand__text">Nido</span>
        </Link>

        <nav className="site-header__nav" aria-label="Principal">
          {renderNavLinks()}
        </nav>

        <div className="site-header__actions">
          {!isAuthenticated ? (
            <span className="site-header__hint">Explora sin iniciar sesión</span>
          ) : null}

          {isAuthenticated ? (
            renderAuthenticatedLinks()
          ) : (
            <>
              <Link to="/login" className="site-header__link">
                Ingresar
              </Link>
              <Link to="/register" className="site-header__button">
                Crear cuenta
              </Link>
            </>
          )}

          <button
            type="button"
            className="site-header__menu"
            aria-label={isMobileMenuOpen ? 'Cerrar menu' : 'Abrir menu'}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((current) => !current)}
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen ? (
        <div className="site-header__mobile-panel">
          <nav className="site-header__mobile-nav" aria-label="Principal movil">
            {renderNavLinks()}
          </nav>
          <div className="site-header__mobile-actions">
            {isAuthenticated ? (
              renderAuthenticatedLinks()
            ) : (
              <>
                <Link to="/login" className="site-header__link" onClick={closeMobileMenu}>
                  Ingresar
                </Link>
                <Link to="/register" className="site-header__button" onClick={closeMobileMenu}>
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
