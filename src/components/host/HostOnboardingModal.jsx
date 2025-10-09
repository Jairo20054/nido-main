import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import QuestionsForm from './QuestionsForm';
import { questionsMap } from './questionsMap';
import { useIsAuthenticated, useLogin } from './authMock';
import { saveDraft, loadDraft, clearDraft } from '../../utils/localDraft';
import './styles.css';

/**
 * HostOnboardingModal - Main modal component for host onboarding flow
 *
 * Props:
 * - open: boolean to control modal visibility
 * - onClose: function called when modal should close
 * - onComplete: function called with { selectionId, answers } when form is completed
 */
const HostOnboardingModal = ({ open, onClose, onComplete }) => {
  const [step, setStep] = useState('selection'); // 'selection', 'auth', 'questions'
  const [selectedCard, setSelectedCard] = useState(null);
  const [answers, setAnswers] = useState({});
  const [saveStatus, setSaveStatus] = useState(''); // '', 'saving', 'saved'
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  const isAuthenticated = useIsAuthenticated();
  const { loginUser, loading: loginLoading, error: loginErrorHook } = useLogin();

  // Focus trap setup
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement;
      modalRef.current?.focus();

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          handleClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    } else {
      previousFocusRef.current?.focus();
    }
  }, [open]);

  // Load draft when modal opens and selection changes
  useEffect(() => {
    if (open && selectedCard) {
      const draft = loadDraft(selectedCard);
      if (draft) {
        setAnswers(draft);
      }
    }
  }, [open, selectedCard]);

  // Autosave answers every 5 seconds
  useEffect(() => {
    if (Object.keys(answers).length > 0 && selectedCard) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      setSaveStatus('saving');
      saveTimeoutRef.current = setTimeout(() => {
        saveDraft(selectedCard, answers);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(''), 2000);
      }, 5000);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [answers, selectedCard]);

  // Handle card selection
  const handleCardSelect = useCallback((cardId) => {
    setSelectedCard(cardId);
    if (!isAuthenticated) {
      setStep('auth');
    } else {
      setStep('questions');
    }
  }, [isAuthenticated]);

  // Handle login form changes
  const handleLoginChange = (field, value) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
    setLoginError('');
  };

  // Handle login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      await loginUser(loginData.email, loginData.password);
      setStep('questions');
      setLoginError('');
    } catch (error) {
      setLoginError(error);
    }
  };

  // Handle questions form changes
  const handleQuestionsChange = useCallback((newAnswers) => {
    setAnswers(newAnswers);
  }, []);

  // Handle questions form submission
  const handleQuestionsSubmit = useCallback((finalAnswers) => {
    clearDraft(selectedCard);
    onComplete({ selectionId: selectedCard, answers: finalAnswers });
    handleClose();
  }, [selectedCard, onComplete]);

  // Handle modal close
  const handleClose = useCallback(() => {
    setStep('selection');
    setSelectedCard(null);
    setAnswers({});
    setSaveStatus('');
    setLoginData({ email: '', password: '' });
    setLoginError('');
    onClose();
  }, [onClose]);

  // Handle back navigation
  const handleBack = () => {
    if (step === 'auth') {
      setStep('selection');
      setSelectedCard(null);
    } else if (step === 'questions') {
      setStep('selection');
      setSelectedCard(null);
      setAnswers({});
    }
  };

  if (!open) return null;

  const cards = [
    {
      id: 'rentals',
      title: 'Arrendamiento',
      description: 'Ofrece alojamiento en tu propiedad',
      image: '/images/rentals-card.jpg' // Placeholder - replace with actual image
    },
    {
      id: 'marketplace',
      title: 'Marketplace',
      description: 'Vende productos y artículos',
      image: '/images/marketplace-card.jpg' // Placeholder - replace with actual image
    },
    {
      id: 'services',
      title: 'Productos y servicios adicionales',
      description: 'Ofrece servicios profesionales',
      image: '/images/services-card.jpg' // Placeholder - replace with actual image
    }
  ];

  return (
    <div className="host-onboarding-modal-overlay" onClick={handleClose}>
      <div
        className="host-onboarding-modal"
        ref={modalRef}
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          {step !== 'selection' && (
            <button
              className="back-button"
              onClick={handleBack}
              aria-label="Volver"
            >
              ←
            </button>
          )}
          <h2 id="modal-title" className="modal-title">
            {step === 'selection' && '¿Qué te gustaría compartir?'}
            {step === 'auth' && 'Inicia sesión para continuar'}
            {step === 'questions' && `Configura tu ${cards.find(c => c.id === selectedCard)?.title.toLowerCase()}`}
          </h2>
          <button
            className="close-button"
            onClick={handleClose}
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          {step === 'selection' && (
            <div className="cards-grid">
              {cards.map(card => (
                <div
                  key={card.id}
                  className={`selection-card ${selectedCard === card.id ? 'selected' : ''}`}
                  onClick={() => handleCardSelect(card.id)}
                  tabIndex="0"
                  role="button"
                  aria-pressed={selectedCard === card.id}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCardSelect(card.id);
                    }
                  }}
                >
                  <div className="card-image">
                    <img
                      src={card.image}
                      alt={card.title}
                      onError={(e) => {
                        e.target.src = '/images/placeholder-card.jpg'; // Fallback image
                      }}
                    />
                  </div>
                  <div className="card-content">
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 'auth' && (
            <div className="auth-section">
              <p className="auth-message">
                Necesitamos tu cuenta para gestionar y publicar tu servicio
              </p>
              <form onSubmit={handleLoginSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={loginData.email}
                    onChange={(e) => handleLoginChange('email', e.target.value)}
                    required
                    disabled={loginLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Contraseña</label>
                  <input
                    type="password"
                    id="password"
                    value={loginData.password}
                    onChange={(e) => handleLoginChange('password', e.target.value)}
                    required
                    disabled={loginLoading}
                  />
                </div>
                {(loginError || loginErrorHook) && (
                  <div className="error-message" role="alert">
                    {loginError || loginErrorHook}
                  </div>
                )}
                <button
                  type="submit"
                  className="login-button"
                  disabled={loginLoading}
                >
                  {loginLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                </button>
              </form>
            </div>
          )}

          {step === 'questions' && selectedCard && (
            <div className="questions-section">
              {saveStatus && (
                <div className={`save-status ${saveStatus}`}>
                  {saveStatus === 'saving' ? 'Guardando...' : 'Guardado automáticamente'}
                </div>
              )}
              <QuestionsForm
                questions={questionsMap[selectedCard]}
                initialAnswers={answers}
                onChange={handleQuestionsChange}
                onSubmit={handleQuestionsSubmit}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

HostOnboardingModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired
};

export default HostOnboardingModal;
