import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import FocusTrap from 'focus-trap-react';
import questionsMap from './questionsMap';
import QuestionsForm from './QuestionsForm';
import { isAuthenticated, login } from './authMock';
import { saveDraft, loadDraft, clearDraft } from '../../utils/localDraft';
import './HostModal.css';

/**
 * HostOnboardingModal
 * Main modal component for "Conviértete en anfitrión" flow.
 * Props:
 * - open: boolean to open/close modal
 * - onClose: function to close modal
 * - onComplete: function({ selectionId, answers }) called on form submit
 */
const HostOnboardingModal = ({ open, onClose, onComplete }) => {
  const [step, setStep] = useState('selection'); // 'selection', 'login', 'questions'
  const [selectionId, setSelectionId] = useState(null);
  const [authError, setAuthError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const modalRef = useRef(null);
  const lastFocusedElement = useRef(null);

  // Save last focused element before modal opens
  useEffect(() => {
    if (open) {
      lastFocusedElement.current = document.activeElement;
      setStep('selection');
      setSelectionId(null);
      setAuthError('');
      setLoginEmail('');
      setLoginPassword('');
    }
  }, [open]);

  // Focus trap and return focus on close
  useEffect(() => {
    if (!open && lastFocusedElement.current) {
      lastFocusedElement.current.focus();
    }
  }, [open]);

  const handleCardSelect = (id) => {
    setSelectionId(id);
    if (!isAuthenticated()) {
      setStep('login');
    } else {
      setStep('questions');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setAuthError('');
    try {
      await login(loginEmail, loginPassword);
      setStep('questions');
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleQuestionsComplete = (data) => {
    onComplete(data);
    onClose();
  };

  const handleBackToSelection = () => {
    setStep('selection');
    setSelectionId(null);
  };

  if (!open) return null;

  const cards = [
    {
      id: 'rentals',
      title: 'Arrendamiento',
      image: '/images/rentals.jpg', // Replace with actual image path
      alt: 'Imagen de arrendamiento de propiedades'
    },
    {
      id: 'marketplace',
      title: 'Marketplace',
      image: '/images/marketplace.jpg',
      alt: 'Imagen de marketplace de productos'
    },
    {
      id: 'services',
      title: 'Servicios adicionales',
      image: '/images/services.jpg',
      alt: 'Servicios adicionales'
    }
  ];

  return (
    <FocusTrap>
      <div className="host-modal-overlay" onClick={onClose} role="presentation">
        <div
          className="host-modal"
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Cerrar modal"
            tabIndex="0"
          >
            ×
          </button>

          {step === 'selection' && (
            <>
              <h2 id="modal-title">¿Qué te gustaría compartir?</h2>
              <div className="cards-grid">
                {cards.map((card) => (
                  <div
                    key={card.id}
                    className={`selection-card ${selectionId === card.id ? 'selected' : ''}`}
                    onClick={() => handleCardSelect(card.id)}
                    tabIndex="0"
                    role="button"
                    aria-pressed={selectionId === card.id}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCardSelect(card.id);
                      }
                    }}
                  >
                    <img src={card.image} alt={card.alt} className="card-image" />
                    <h3>{card.title}</h3>
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 'login' && (
            <>
              <h2 id="modal-title">Necesitamos tu cuenta para gestionar y publicar tu servicio</h2>
              <form className="login-form" onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    tabIndex="0"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Contraseña</label>
                  <input
                    type="password"
                    id="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    tabIndex="0"
                  />
                </div>
                {authError && <div className="error-message">{authError}</div>}
                <button type="submit" disabled={loginLoading} className="login-button">
                  {loginLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                </button>
                <button type="button" onClick={handleBackToSelection} className="back-button">
                  Volver
                </button>
              </form>
            </>
          )}

          {step === 'questions' && selectionId && (
            <>
              <h2 id="modal-title">Completa la información para {cards.find(c => c.id === selectionId)?.title}</h2>
              <QuestionsForm
                selectionId={selectionId}
                onComplete={handleQuestionsComplete}
                onCancel={handleBackToSelection}
              />
            </>
          )}
        </div>
      </div>
    </FocusTrap>
  );
};

HostOnboardingModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired
};

export default HostOnboardingModal;
