// src/components/common/UserMenu/UserMenu.jsx (Modified: Added 'grok' variant for centered, organized menu like the image)
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  FaUserCircle, 
  FaBell, 
  FaUser, 
  FaHome, 
  FaCog, 
  FaSignOutAlt, 
  FaHeart, 
  FaKey, 
  FaComments,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
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
  onFavoritesClick = () => {},
  menuItems = [], // Additional items like Grok
  variant = 'default' // 'default', 'sidebar', 'grok', 'copilot'
}) => {
  const safeUser = user || {
    name: 'EL',
    email: 'elcastillojairo2001@gmail.com',
    avatar: null
  };

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleMenu = useCallback(() => {
    console.log('UserMenu toggleMenu clicked, current isOpen:', isOpen);
    setIsOpen(prev => !prev);
  }, [isOpen]);

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

  // Default menu items for non-grok variants
  const defaultMenuItems = [
    {
      id: 'profile',
      label: 'Mi perfil',
      icon: FaUser,
      onClick: onProfileClick
    },
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
      onClick: onLogoutClick,
      isDestructive: true
    }
  ];

  if (variant === 'grok') {
    return (
      <div className={`user-menu ${variant}`} ref={dropdownRef}>
        <div className="user-menu-trigger grok-trigger" onClick={toggleMenu}>
          <div className="user-avatar grok-avatar">
            {safeUser.avatar ? (
              <img src={safeUser.avatar} alt={safeUser.name} />
            ) : (
              <FaUserCircle size={32} />
            )}
          </div>
        </div>
        
        {isOpen && (
          <div className="user-menu-dropdown grok-dropdown">
            {/* Centered user info like Grok */}
            <div className="grok-user-header">
              <div className="grok-user-info">
                <div className="user-avatar grok-avatar-large">
                  {safeUser.avatar ? (
                    <img src={safeUser.avatar} alt={safeUser.name} />
                  ) : (
                    <FaUserCircle size={48} />
                  )}
                </div>
                <div className="grok-user-details">
                  <div className="user-name">{safeUser.name}</div>
                  <div className="user-email">{safeUser.email}</div>
                </div>
              </div>
            </div>

            {/* Organized menu items - Centered, icon-left like image */}
            <div className="grok-menu-items">
              {menuItems.map((item) => {
                const IconComponent = item.icon || FaUser; // Fallback icon
                return (
                  <button
                    key={item.id}
                    className={`grok-menu-item ${item.isPromo ? 'promo' : ''}`}
                    onClick={() => handleMenuItemClick(item.onClick)}
                  >
                    <IconComponent className="grok-menu-icon" />
                    <div className="grok-menu-label-container">
                      <span className="grok-menu-label">{item.label}</span>
                      {item.subLabel && (
                        <span className="grok-menu-sub-label">{item.subLabel}</span>
                      )}
                    </div>
                    {item.value && (
                      <span className="grok-menu-value">{item.value}</span>
                    )}
                  </button>
                );
              })}
              <div className="grok-menu-divider" />
              <button 
                className="grok-menu-item destructive"
                onClick={onLogoutClick}
              >
                <FaSignOutAlt className="grok-menu-icon" />
                <span className="grok-menu-label">Cerrar sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Fallback to original for other variants
  return (
    <div className={`user-menu ${variant}`} ref={dropdownRef}>
      <div className="user-menu-trigger" onClick={toggleMenu}>
        <div className="user-avatar">
          {safeUser.avatar ? (
            <img src={safeUser.avatar} alt={safeUser.name} />
          ) : (
            <FaUserCircle size={32} />
          )}
        </div>
        <div className="user-info-trigger">
          <span className="user-name-trigger">{safeUser.name}</span>
          {variant === 'sidebar' && (
            <span className="user-email-trigger">{safeUser.email}</span>
          )}
        </div>
        <div className="dropdown-arrow">
          {isOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
        </div>
      </div>
      
      {isOpen && (
        <div className="user-menu-dropdown">
          <div className="dropdown-header">
            <div className="user-info">
              <div className="user-avatar-large">
                {safeUser.avatar ? (
                  <img src={safeUser.avatar} alt={safeUser.name} />
                ) : (
                  <FaUserCircle size={48} />
                )}
              </div>
              <div className="user-details">
                <div className="user-name">{safeUser.name}</div>
                <div className="user-email">{safeUser.email}</div>
              </div>
            </div>
          </div>
          
          <div className="dropdown-content">
            <div className="menu-section">
              {(menuItems.length > 0 ? menuItems : defaultMenuItems).map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    className="menu-item"
                    onClick={() => handleMenuItemClick(item.onClick)}
                  >
                    <div className="menu-item-content">
                      <IconComponent className="menu-icon" />
                      <span className="menu-label">{item.label}</span>
                    </div>
                    {item.showBadge && item.badgeCount > 0 && (
                      <div className="menu-badge">
                        {item.badgeCount > 99 ? '99+' : item.badgeCount}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="menu-divider"></div>
            
            <div className="menu-section">
              {footerItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    className={`menu-item ${item.isDestructive ? 'destructive' : ''}`}
                    onClick={() => handleMenuItemClick(item.onClick)}
                  >
                    <div className="menu-item-content">
                      <IconComponent className="menu-icon" />
                      <span className="menu-label">{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
