import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../../context/AuthContext';
import FacebookLoginButton from './FacebookLoginButton';
import './LoginForm.css';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const { login, loading, error, clearError } = useAuthContext();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Limpiar errores previos
    clearError();

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        // Limpiar formulario después del éxito
        setFormData({ email: '', password: '' });
        setRememberMe(false);
        setErrors({});

        // Redirigir al dashboard o página principal
        window.location.href = '/dashboard';
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setErrors({ general: 'Error inesperado al iniciar sesión. Inténtalo de nuevo.' });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Iniciar Sesión</h2>
          <p className="auth-subtitle">Accede a tu cuenta</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {(errors.general || error) && (
            <div className="error-message general-error">
              {errors.general || error}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="ejemplo@correo.com"
                disabled={loading}
                autoComplete="email"
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              <span className="input-icon email-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
            </div>
            {errors.email && (
              <span id="email-error" className="error-message" role="alert">
                {errors.email}
              </span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Ingresa tu contraseña"
                disabled={loading}
                autoComplete="current-password"
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              <button
                type="button"
                className="input-icon password-toggle"
                onClick={togglePasswordVisibility}
                disabled={loading}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <span id="password-error" className="error-message" role="alert">
                {errors.password}
              </span>
            )}
          </div>
          
          <div className="form-options">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                disabled={loading}
              />
              <span className="checkmark"></span>
              Recordarme
            </label>
            <a href="/forgot-password" className="forgot-password" tabIndex={loading ? -1 : 0}>
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          
          <button
            type="submit"
            className={`auth-submit-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Iniciando sesión...
              </>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>

        {/* Separador para login social */}
        <div className="social-login-separator">
          <span>O continúa con</span>
        </div>

        {/* Botones de login social */}
        <div className="social-login-buttons">
          <FacebookLoginButton />
        </div>

        <div className="auth-footer">
          <p>¿No tienes cuenta? <Link to="/register" className="auth-link">Regístrate aquí</Link></p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;