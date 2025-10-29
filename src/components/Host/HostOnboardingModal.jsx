import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import FocusTrap from 'focus-trap-react';
import questionsMap from './questionsMap';
import QuestionsForm from './QuestionsForm';
import LoginForm from '../user/Auth/LoginForm';
import FacebookLoginButton from '../user/Auth/FacebookLoginButton';
import { useAuthContext } from '../../context/AuthContext';
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
  const { isAuthenticated } = useAuthContext();
  const [step, setStep] = useState('selection'); // 'selection', 'login', 'howItWorks', 'questions'
  const [selectionId, setSelectionId] = useState(null);
  const [authError, setAuthError] = useState('');
  const modalRef = useRef(null);
  const lastFocusedElement = useRef(null);

  // Save last focused element before modal opens
  useEffect(() => {
    if (open) {
      lastFocusedElement.current = document.activeElement;
      setStep('selection');
      setSelectionId(null);
      setAuthError('');
    }
  }, [open]);

  // Focus trap and return focus on close
  useEffect(() => {
    if (!open && lastFocusedElement.current) {
      lastFocusedElement.current.focus();
    }
  }, [open]);

  const handleCardSelect = (id) => {
    console.log('Seleccionado:', id);
    console.log('isAuthenticated:', isAuthenticated);
    setSelectionId(id);
    if (!isAuthenticated) {
      setStep('login');
    } else {
      setStep('howItWorks');
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

  const handleProceedToQuestions = () => {
    setStep('questions');
  };

  if (!open) return null;

  const cards = [
    {
      id: 'rentals',
      title: 'Arrendamiento',
      icon: '🏠',
      alt: 'Icono de casa para arrendamiento'
    },
    {
      id: 'marketplace',
      title: 'Marketplace',
      icon: '🛒',
      alt: 'Icono de carrito para marketplace'
    },
    {
      id: 'services',
      title: 'Servicios adicionales',
      icon: '🛠️',
      alt: 'Icono de herramientas para servicios'
    }
  ];

  const howItWorksContent = {
    rentals: {
      title: '¿Cómo funciona el arrendamiento?',
      steps: [
        'Registra tu propiedad con detalles completos y fotos.',
        'Establece precios y disponibilidad.',
        'Recibe solicitudes de huéspedes verificados.',
        'Gestiona reservas y recibe pagos de forma segura.'
      ]
    },
    marketplace: {
      title: '¿Cómo funciona el marketplace?',
      steps: [
        'Crea tu perfil de vendedor con información básica.',
        'Publica tus productos o servicios con descripciones detalladas.',
        'Gestiona pedidos y comunicaciones con compradores.',
        'Recibe pagos y calificaciones de tus ventas.'
      ]
    },
    services: {
      title: '¿Cómo funcionan los servicios adicionales?',
      steps: [
        'Registra tus servicios con categorías y precios.',
        'Especifica requisitos y disponibilidad.',
        'Recibe solicitudes de clientes interesados.',
        'Proporciona el servicio y recibe feedback.'
      ]
    }
  };

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
                    <div className="card-icon">{card.icon}</div>
                    <h3>{card.title}</h3>
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 'login' && (
            <>
              <h2 id="modal-title">Necesitamos tu cuenta para gestionar y publicar tu servicio</h2>
              <LoginForm onSuccess={() => setStep('howItWorks')} />
              <button type="button" onClick={handleBackToSelection} className="back-button">
                Volver
              </button>
            </>
          )}

          {step === 'howItWorks' && selectionId && (
            <>
              <h2 id="modal-title">{howItWorksContent[selectionId].title}</h2>
              <div className="how-it-works-content">
                <ol className="steps-list">
                  {howItWorksContent[selectionId].steps.map((step, index) => (
                    <li key={index}>
                      <strong>Paso {index + 1}:</strong> {step}
                    </li>
                  ))}
                </ol>
                <div className="how-it-works-footer">
                  <button type="button" onClick={handleBackToSelection} className="back-button">
                    Volver
                  </button>
                  <button type="button" onClick={handleProceedToQuestions} className="proceed-button">
                    Continuar
                  </button>
                </div>
              </div>
            </>
          )}

          {step === 'questions' && selectionId && (
            <>
              <h2 id="modal-title">Completa la información para {cards.find(c => c.id === selectionId)?.title}</h2>
              <QuestionsForm
                selectionId={selectionId}
                onComplete={handleQuestionsComplete}
                onCancel={() => setStep('howItWorks')}
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
