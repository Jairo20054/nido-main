import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Play, Plus, ShoppingBag, User } from 'lucide-react';
import './BottomNav.css';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      id: 'home',
      icon: Home,
      label: 'Inicio',
      path: '/',
      active: location.pathname === '/'
    },
    {
      id: 'reels',
      icon: Play,
      label: 'Reels',
      path: '/reels',
      active: location.pathname === '/reels'
    },
    {
      id: 'compose',
      icon: Plus,
      label: 'Publicar',
      path: '/post/new',
      active: location.pathname === '/post/new',
      isCenter: true
    },
    {
      id: 'services',
      icon: ShoppingBag,
      label: 'Servicios',
      path: '/services',
      active: location.pathname === '/services'
    },
    {
      id: 'profile',
      icon: User,
      label: 'Perfil',
      path: '/profile',
      active: location.pathname === '/profile'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-container">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`bottom-nav-item ${item.active ? 'active' : ''} ${item.isCenter ? 'center' : ''}`}
              onClick={() => handleNavigation(item.path)}
              aria-label={item.label}
            >
              <div className="nav-icon-wrapper">
                <Icon
                  size={item.isCenter ? 24 : 20}
                  className={item.active ? 'nav-icon active' : 'nav-icon'}
                />
                {item.isCenter && <div className="center-indicator" />}
              </div>
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
