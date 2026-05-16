import React from 'react';
import { LoaderCircle } from 'lucide-react';

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="google-auth-button__icon"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.56 2.68-3.86 2.68-6.62Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.46-.8 5.95-2.18l-2.92-2.26c-.8.54-1.83.86-3.03.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.97 10.71A5.41 5.41 0 0 1 3.69 9c0-.6.1-1.19.28-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.04l3.01-2.33Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.32 0 2.5.45 3.42 1.33l2.56-2.56C13.45.9 11.43 0 9 0A9 9 0 0 0 .96 4.96l3.01 2.33c.71-2.12 2.69-3.71 5.03-3.71Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function GoogleAuthButton({ disabled = false, loading = false, onClick }) {
  return (
    <button
      className="button button--secondary button--social"
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <LoaderCircle aria-hidden="true" className="spinner-inline" size={18} strokeWidth={2} />
      ) : (
        <GoogleIcon />
      )}
      <span>{loading ? 'Conectando con Google...' : 'Continuar con Google'}</span>
    </button>
  );
}
