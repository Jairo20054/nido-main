import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaUserCircle, FaBell, FaEnvelope, FaUser, FaHome, FaCog, FaSignOutAlt, FaHeart, FaBookmark, FaKey, FaComments } from 'react-icons/fa';
import './UserMenu.css';

const UserMenu = ({ 
  user = null,
  notificationCount = 0,
  messageCount = 0,
  onProfileClick = () => {},
  onReservationsClick = () => {},
  onPropertiesClick = () => {},
  onSettingsClick = () => {},
  onLogoutClick = () => {},
  onMessagesClick = () => {},
  onFavoritesClick = () => {}
}) => {
  const safeUser = user || {
    name: 'Usuario',
    email: 'usuario@example.com',
    avatar: null
  };

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleMenu = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleMenuItemClick = useCallback((action) => {
    setIsOpen(false);
    if (action) action();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const menuItems = [
    {
      id: 'messages',
      label: 'Mensajes',
      icon: FaComments,
      onClick: onMessagesClick,
      showBadge: true,
      badgeCount: messageCount
    },
    {
      id: 'notifications',
      label: 'Notificaciones',
      icon: FaBell,
      onClick: () => {},
      showBadge: true,
      badgeCount: notificationCount
    },
    {
      id: 'favorites',
      label: 'Favoritos',
      icon: FaHeart,
      onClick: onFavoritesClick
    },
    {
      id: 'reservations',
      label: 'Mis reservas',
      icon: FaKey,
      onClick: onReservationsClick
    },
    {
      id: 'properties',
      label: 'Mis propiedades',
      icon: FaHome,
      onClick: onPropertiesClick
    },
    {
      id: 'profile',
      label: 'Mi perfil',
      icon: FaUser,
      onClick: onProfileClick
    }
  ];

  const footerItems = [
    {
      id: 'settings',
      label: 'Configuración',
      icon: FaCog,
      onClick: onSettingsClick
    },
    {
      id: 'logout',
      label: 'Cerrar sesión',
      icon: FaSignOutAlt,
      onClick: onLogoutClick
    }
  ];

  return (
    <div className="user-menu-airbnb" ref={dropdownRef}>
      <div className="user-menu-trigger" onClick={toggleMenu}>
        <div className="user-avatar">
          {safeUser.avatar ? (
            <img src={safeUser.avatar} alt={safeUser.name} />
          ) : (
            <FaUserCircle size={32} />
          )}
        </div>
        {isOpen && (
          <div className="user-menu-dropdown">
            <div className="dropdown-header">
              <div className="user-info">
                <div className="user-name">{safeUser.name}</div>
                <div className="user-email">{safeUser.email}</div>
              </div>
            </div>
            
            <div className="dropdown-section">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div 
                    key={item.id} 
                    className="menu-item"
                    onClick={() => handleMenuItemClick(item.onClick)}
                  >
                    <div className="menu-item-content">
                      <IconComponent className="menu-icon" />
                      <span>{item.label}</span>
                    </div>
                    {item.showBadge && item.badgeCount > 0 && (
                      <div className="menu-badge">
                        {item.badgeCount > 99 ? '99+' : item.badgeCount}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="dropdown-divider"></div>
            
            <div className="dropdown-section">
              {footerItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div 
                    key={item.id} 
                    className="menu-item"
                    onClick={() => handleMenuItemClick(item.onClick)}
                  >
                    <div className="menu-item-content">
                      <IconComponent className="menu-icon" />
                      <span>{item.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserMenu;