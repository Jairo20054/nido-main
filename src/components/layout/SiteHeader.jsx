import React from 'react';
import { LogOut, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';

export function SiteHeader() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="site-header">
      <div className="site-header__container">
        <Link to="/" className="brand">
          <span className="brand__mark">N</span>
          <span className="brand__text">Nido</span>
        </Link>

        <div className="site-header__search">
          <input type="text" placeholder="Busca por ciudad..." />
        </div>

        <div className="site-header__actions">
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
                Publicar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
