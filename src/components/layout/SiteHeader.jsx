import React, { useState } from 'react';
import { Heart, Home, LayoutDashboard, LogOut, Menu, Search, User } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';

export function SiteHeader() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="brand">
          <span className="brand__mark">N</span>
          <span className="brand__text">
            <strong>NIDO</strong>
            <small>Arriendo residencial</small>
          </span>
        </Link>

        <button className="site-header__menu" type="button" onClick={() => setOpen((value) => !value)}>
          <Menu size={18} />
        </button>

        <nav className={`site-nav ${open ? 'site-nav--open' : ''}`}>
          <NavLink to="/properties" className="site-nav__link" onClick={() => setOpen(false)}>
            <Search size={16} />
            Explorar
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/saved" className="site-nav__link" onClick={() => setOpen(false)}>
              <Heart size={16} />
              Guardados
            </NavLink>
          )}
          {isAuthenticated && (
            <NavLink to="/manage" className="site-nav__link" onClick={() => setOpen(false)}>
              <LayoutDashboard size={16} />
              Gestion
            </NavLink>
          )}
        </nav>

        <div className="site-header__actions">
          {isAuthenticated ? (
            <>
              <NavLink to="/account" className="site-header__ghost">
                <User size={16} />
                {user?.firstName}
              </NavLink>
              <button className="site-header__button site-header__button--ghost" type="button" onClick={handleLogout}>
                <LogOut size={16} />
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="site-header__ghost">
                Ingresar
              </Link>
              <Link to="/register" className="site-header__button">
                <Home size={16} />
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
