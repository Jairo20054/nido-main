import React, { useState } from 'react';
import { Heart, LayoutDashboard, LogOut, Menu, Plus, Search, Shield, User } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';
import { getRoleLabel } from '../../lib/formatters';

/**
 * Componente de uso para el encabezado global del sitio.
 * Aparece dentro del layout principal y concentra navegacion, buscador rapido
 * y accesos condicionados por autenticacion y permisos del usuario actual.
 */
export function SiteHeader() {
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated, isLandlord, logout, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Cierra la sesion actual y devuelve al usuario al home publico.
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Reutiliza el buscador del header como acceso rapido a la pagina de listado.
  const handleSearchSubmit = (event) => {
    event.preventDefault();

    if (searchQuery.trim()) {
      navigate(`/properties?city=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setOpen(false);
    }
  };

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="brand">
          <span className="brand__mark">N</span>
          <span className="brand__text">
            <strong>NIDO</strong>
          </span>
        </Link>

        <form className="site-header__search" onSubmit={handleSearchSubmit}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar por ciudad..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </form>

        <button className="site-header__menu" type="button" onClick={() => setOpen((value) => !value)}>
          <Menu size={18} />
        </button>

        <nav className={`site-nav ${open ? 'site-nav--open' : ''}`}>
          <NavLink to="/properties" className="site-nav__link" onClick={() => setOpen(false)}>
            <Search size={16} />
            Explorar
          </NavLink>
          {isAuthenticated ? (
            <NavLink to="/saved" className="site-nav__link" onClick={() => setOpen(false)}>
              <Heart size={16} />
              Guardados
            </NavLink>
          ) : null}
          {isLandlord ? (
            <NavLink to="/manage" className="site-nav__link" onClick={() => setOpen(false)}>
              <LayoutDashboard size={16} />
              Gestion
            </NavLink>
          ) : null}
          {isAdmin ? (
            <NavLink to="/admin" className="site-nav__link" onClick={() => setOpen(false)}>
              <Shield size={16} />
              Admin
            </NavLink>
          ) : null}
        </nav>

        <div className="site-header__actions">
          {isAuthenticated ? (
            <>
              <NavLink to="/account" className="site-header__ghost">
                <User size={16} />
                <span>{user?.firstName}</span>
              </NavLink>
              <span className="site-header__role">{getRoleLabel(user?.role)}</span>
              <button className="site-header__button" type="button" onClick={handleLogout}>
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
                <Plus size={16} />
                Publicar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
