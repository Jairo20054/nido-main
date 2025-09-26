import React from 'react';
import RegisterForm from '../../components/user/Auth/RegisterForm';
import './Auth.css';

const Register = () => {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Únete a Nido</h1>
          <p>Crea tu cuenta para comenzar tu experiencia</p>
        </div>
        <RegisterForm />
        <div className="auth-footer">
          <p>¿Ya tienes cuenta? <a href="/login">Inicia sesión</a></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
