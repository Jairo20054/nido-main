import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../../context/AuthContext';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const { isAuthenticated } = useAuthContext();

  // Close modal when authentication is successful
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      onAuthSuccess && onAuthSuccess();
      onClose();
    }
  }, [isAuthenticated, isOpen, onAuthSuccess, onClose]);

  if (!isOpen) return null;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={handleOverlayClick}>
      <div className="auth-modal">
        <button className="auth-modal-close" onClick={onClose}>
          ×
        </button>

        <div className="auth-modal-header">
          <h2 className="auth-modal-title">
            {activeTab === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
        </div>

        <div className="auth-modal-tabs">
          <button
            className={`auth-modal-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => handleTabChange('login')}
          >
            Iniciar Sesión
          </button>
          <button
            className={`auth-modal-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => handleTabChange('register')}
          >
            Registrarse
          </button>
        </div>

        <div className="auth-modal-content">
          {activeTab === 'login' ? (
            <LoginForm />
          ) : (
            <RegisterForm />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
