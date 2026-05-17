import React from 'react';
import { Link } from 'react-router-dom';

// Pantalla de salida controlada para usuarios autenticados sin permisos suficientes.
export function AccessDeniedPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="section__eyebrow">Permisos</span>
        <h1>Acceso denegado</h1>
        <p>Tu cuenta no tiene permisos para entrar en esta sección.</p>
        <div className="form-card__actions">
          <Link className="button" to="/">
            Volver al inicio
          </Link>
          <Link className="button button--secondary" to="/account">
            Ir a mi cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}
