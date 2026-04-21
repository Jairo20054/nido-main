import React, { useEffect, useState } from 'react';
import { House, LogOut, Menu, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';

export function SiteHeader() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 16);

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={`site-header ${isScrolled ? 'site-header--scrolled' : ''}`}>
      <div className="site-header__container">
        <Link to="/" className="brand">
          <span className="brand__mark" aria-hidden="true">
            <span className="brand__mark-home">
              <House size={13} strokeWidth={2.4} />
            </span>
            <span className="brand__mark-leaf"></span>
          </span>
          <span className="brand__text">Nido</span>
        </Link>

        <nav className="site-header__nav" aria-label="Principal">
          <Link to="/properties">Buscar</Link>
          <a href="#como-funciona">Como funciona</a>
          <a href="#para-propietarios">Para propietarios</a>
        </nav>

        <div className="site-header__actions">
          {!isAuthenticated ? <span className="site-header__hint">Explora sin iniciar sesion</span> : null}
          {isAuthenticated ? (
            <>
              <Link to="/account" className="site-header__link">
                <User size={16} />
                {user?.firstName}
              </Link>
              <button className="site-header__button site-header__button--ghost" type="button" onClick={handleLogout}>
                <LogOut size={14} />
                Salir
              </button>
            </>
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
          <button type="button" className="site-header__menu" aria-label="Abrir menu">
            <Menu size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
