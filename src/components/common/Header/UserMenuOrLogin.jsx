import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import UserMenu from './UserMenu';

const UserMenuOrLogin = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

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

  const handleLogin = () => {
    navigate('/login');
    setIsOpen(false);
  };

  if (isAuthenticated) {
    return <UserMenu />;
  }

  return (
    <div className="desktop-header__user-menu" ref={dropdownRef}>
      <button
        className="desktop-header__user-menu-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menú de usuario"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </button>

      {isOpen && (
        <div className="desktop-header__login-option">
          <button
            className="desktop-header__login-button"
            onClick={handleLogin}
          >
            Iniciar sesión
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenuOrLogin;