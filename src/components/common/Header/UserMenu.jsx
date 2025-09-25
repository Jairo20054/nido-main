// src/components/UserMenu/UserMenu.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuthContext } from '../../../context/AuthContext';
import './UserMenu.css';

// Iconos SVG actualizados
const ProfileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const PlanIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const PersonalizeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const HelpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout, loading } = useAuthContext();

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

  // Si no hay usuario autenticado, no mostrar el menú
  if (!user) {
    return null;
  }

  const menuItems = [
    { id: 1, type: 'email', label: user.email },
    { id: 2, type: 'item', icon: <PlanIcon />, label: 'Cambiar a un plan superior', checked: true },
    { id: 3, type: 'item', icon: <PersonalizeIcon />, label: 'Personalización', checked: false },
    { id: 4, type: 'item', icon: <SettingsIcon />, label: 'Configuración', checked: false },
    { id: 5, type: 'item', icon: <HelpIcon />, label: 'Ayuda', checked: false },
    { id: 6, type: 'divider' },
    { id: 7, type: 'item', icon: <LogoutIcon />, label: 'Cerrar sesión', checked: false }
  ];

  return (
    <div className="user-menu" ref={dropdownRef}>
      <div 
        className="user-menu-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="user-avatar">
          <span>{user.name.charAt(0)}</span>
        </div>
      </div>
      
      {isOpen && (
        <div className="user-menu-dropdown">
          <div className="dropdown-header">
            <div className="user-info">
              <div className="user-avatar-large">
                <span>{user.name.charAt(0)}</span>
              </div>
              <div className="user-details">
                <div className="user-name">{user.name}</div>
                <div className="user-plan">{user.plan}</div>
              </div>
            </div>
          </div>
          
          <div className="dropdown-content">
            <div className="menu-section">
              {menuItems.map(item => {
                if (item.type === 'divider') {
                  return <div key={item.id} className="menu-divider"></div>;
                }
                
                return (
                  <button 
                    key={item.id} 
                    className={`menu-item ${item.type === 'email' ? 'email-item' : ''}`}
                    onClick={async () => {
                      if (item.type !== 'email') {
                        if (item.label === 'Cerrar sesión') {
                          try {
                            await logout();
                            setIsOpen(false);
                            window.location.href = '/';
                          } catch (error) {
                            console.error('Error al cerrar sesión:', error);
                          }
                        } else {
                          console.log('Clicked:', item.label);
                          setIsOpen(false);
                        }
                      }
                    }}
                  >
                    {item.type === 'item' && (
                      <div className="checkbox-container">
                        <div className={`custom-checkbox ${item.checked ? 'checked' : ''}`}>
                          {item.checked && (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="12" height="12">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {item.type === 'email' && (
                      <div className="checkbox-container">
                        <div className="custom-checkbox empty"></div>
                      </div>
                    )}
                    
                    <div className="menu-item-content">
                      {item.icon && <span className="menu-icon">{item.icon}</span>}
                      <span className="menu-label">{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="upgrade-plan-section">
              <button className="upgrade-plan-btn">
                Mejorar plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;