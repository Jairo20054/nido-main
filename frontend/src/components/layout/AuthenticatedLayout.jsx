import React from 'react';
import {
  BarChart3,
  Bell,
  Building2,
  ClipboardList,
  FileText,
  Heart,
  Home,
  LifeBuoy,
  LogOut,
  PlusCircle,
  Search,
  Settings,
  User,
} from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/useAuth';
import { getRoleLabel } from '../../lib/formatters';
import { BrandLogo } from '../ui/BrandLogo';

const roleNavItems = {
  TENANT: [
    { label: 'Inicio', href: '/dashboard', icon: Home },
    { label: 'Buscar propiedades', href: '/#buscar', icon: Search },
    { label: 'Favoritos', href: '/saved', icon: Heart },
    { label: 'Mis postulaciones', href: '/applications', icon: ClipboardList },
    { label: 'Documentos', href: '/documents', icon: FileText },
    { label: 'Mi cuenta', href: '/account', icon: User },
  ],
  LANDLORD: [
    { label: 'Inicio', href: '/dashboard', icon: Home },
    { label: 'Mis propiedades', href: '/manage', icon: Building2 },
    { label: 'Solicitudes recibidas', href: '/requests', icon: ClipboardList },
    { label: 'Publicar propiedad', href: '/publish', icon: PlusCircle },
    { label: 'Estadisticas', href: '/stats', icon: BarChart3 },
    { label: 'Mi cuenta', href: '/account', icon: User },
    { label: 'Configuracion', href: '/settings', icon: Settings },
  ],
  ADMIN: [
    { label: 'Inicio', href: '/dashboard', icon: Home },
    { label: 'Buscar propiedades', href: '/#buscar', icon: Search },
    { label: 'Mis propiedades', href: '/admin', icon: Building2 },
    { label: 'Solicitudes recibidas', href: '/requests', icon: ClipboardList },
    { label: 'Estadisticas', href: '/stats', icon: BarChart3 },
    { label: 'Mi cuenta', href: '/account', icon: User },
    { label: 'Configuracion', href: '/settings', icon: Settings },
  ],
};

const getInitials = (user) => {
  const first = user?.firstName?.[0] || user?.email?.[0] || 'N';
  const last = user?.lastName?.[0] || '';
  return `${first}${last}`.toUpperCase();
};

const getPageTitle = (pathname, userRole) => {
  const items = roleNavItems[userRole] || roleNavItems.TENANT;
  const match = items
    .slice()
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

  return match?.label || 'Panel Nido';
};

function BrandBlock() {
  return (
    <Link to="/dashboard" className="auth-brand" aria-label="Ir al inicio de Nido">
      <BrandLogo size="sidebar" />
      <span>
        <small>Espacio privado</small>
      </span>
    </Link>
  );
}

function NavigationList({ items, compact = false }) {
  return (
    <nav className={compact ? 'auth-bottom-nav' : 'auth-sidebar__nav'} aria-label="Navegacion autenticada">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              `${compact ? 'auth-bottom-nav__item' : 'auth-sidebar__link'} ${isActive ? 'is-active' : ''}`
            }
          >
            <Icon size={compact ? 19 : 18} aria-hidden="true" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export function AuthenticatedLayout({ children }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const role = user?.role || 'TENANT';
  const navItems = roleNavItems[role] || roleNavItems.TENANT;
  const mobileItems = navItems.slice(0, 5);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="auth-shell">
      <aside className="auth-sidebar">
        <BrandBlock />
        <NavigationList items={navItems} />
        <div className="auth-sidebar__help">
          <LifeBuoy size={18} aria-hidden="true" />
          <strong>Soporte Nido</strong>
          <p>Te ayudamos a cerrar el arriendo con documentos y trazabilidad.</p>
        </div>
      </aside>

      <div className="auth-workspace">
        <header className="auth-topbar">
          <div>
            <span className="auth-topbar__eyebrow">{getRoleLabel(role)}</span>
            <h1>{getPageTitle(location.pathname, role)}</h1>
          </div>
          <div className="auth-topbar__actions">
            <button className="icon-button" type="button" aria-label="Ver notificaciones">
              <Bell size={18} />
            </button>
            <Link to="/account" className="auth-user-chip">
              <span className="auth-user-chip__avatar">{getInitials(user)}</span>
              <span>
                <strong>{user?.firstName || 'Usuario'}</strong>
                <small>{user?.email || 'Cuenta Nido'}</small>
              </span>
            </Link>
            <button className="icon-button icon-button--danger" type="button" onClick={handleLogout} aria-label="Cerrar sesión">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="auth-main">{children}</main>
      </div>

      <NavigationList items={mobileItems} compact />
    </div>
  );
}
