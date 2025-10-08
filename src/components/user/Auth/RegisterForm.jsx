import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../../context/AuthContext';
import authService from '../../../services/authService';
import './RegisterForm.css';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [acceptTerms, setAcceptTerms] = useState(false);

  const { register, loading, error, clearError } = useAuthContext();

  const validateForm = () => {
    const newErrors = {};

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.name.trim())) {
      newErrors.name = 'El nombre solo puede contener letras y espacios';
    }

    // Validar email
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!authService.validateEmail(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else {
      const passwordValidation = authService.validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Debes confirmar tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Validar términos y condiciones
    if (!acceptTerms) {
      newErrors.terms = 'Debes aceptar los términos y condiciones';
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
      const userData = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      };

      const result = await register(userData);

      if (result.success) {
        // Limpiar formulario después del éxito
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        setAcceptTerms(false);
        setErrors({});

        // Redirigir al dashboard o página principal
        window.location.href = '/dashboard';
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      console.error('Error al registrarse:', error);
      setErrors({ general: 'Error inesperado al registrarse. Inténtalo de nuevo.' });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Crear Cuenta</h2>
          <p className="auth-subtitle">Regístrate para comenzar</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {(errors.general || error) && (
            <div className="error-message general-error">
              {errors.general || error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Nombre Completo <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Tu nombre completo"
                disabled={loading}
                autoComplete="name"
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              <span className="input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
            </div>
            {errors.name && (
              <span id="name-error" className="error-message" role="alert">
                {errors.name}
              </span>
            )}
          </div>

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
                placeholder="Crea una contraseña segura"
                disabled={loading}
                autoComplete="new-password"
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

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirmar Contraseña <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Repite tu contraseña"
                disabled={loading}
                autoComplete="new-password"
                aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
              />
              <button
                type="button"
                className="input-icon password-toggle"
                onClick={toggleConfirmPasswordVisibility}
                disabled={loading}
                aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showConfirmPassword ? (
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
            {errors.confirmPassword && (
              <span id="confirmPassword-error" className="error-message" role="alert">
                {errors.confirmPassword}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={() => setAcceptTerms(!acceptTerms)}
                disabled={loading}
              />
              <span className="checkmark"></span>
              Acepto los <a href="/terms" target="_blank" rel="noopener noreferrer">términos y condiciones</a> y la <a href="/privacy" target="_blank" rel="noopener noreferrer">política de privacidad</a>
            </label>
            {errors.terms && (
              <span className="error-message" role="alert">
                {errors.terms}
              </span>
            )}
          </div>

          <button
            type="submit"
            className={`auth-submit-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Creando cuenta...
              </>
            ) : (
              'Crear Cuenta'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>¿Ya tienes cuenta? <Link to="/login" className="auth-link">Inicia sesión aquí</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
