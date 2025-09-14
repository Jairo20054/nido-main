// src/components/UserMenu/UserMenu.jsx
import React, { useState, useRef, useEffect } from 'react';
import './UserMenu.css';

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const user = {
    name: 'Andres Castillo',
    email: 'andres@example.com',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
  };

  const menuItems = [
    { id: 1, icon: '👤', label: 'Perfil', path: '/profile' },
    { id: 2, icon: '🔧', label: 'Configuración', path: '/settings' },
    { id: 3, icon: '❓', label: 'Ayuda', path: '/help' },
    { id: 4, icon: '🚪', label: 'Cerrar sesión', path: '/logout' },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="user-menu" ref={dropdownRef}>
      <div 
        className="user-menu-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <img src={user.avatar} alt={user.name} className="user-avatar" />
      </div>
      
      {isOpen && (
        <div className="user-menu-dropdown">
          <div className="dropdown-header">
            <img src={user.avatar} alt={user.name} className="user-avatar-large" />
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-email">{user.email}</div>
            </div>
          </div>
          
          <div className="dropdown-divider"></div>
          
          <div className="dropdown-menu">
            {menuItems.map(item => (
              <div key={item.id} className="menu-item">
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;