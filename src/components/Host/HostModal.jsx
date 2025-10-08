import React, { useState } from 'react';
import HostTypeSelectionModal from './HostTypeSelectionModal';
import './HostModal.css';

const questionsByType = {
  arrendamiento: [
    '¿Qué tipo de arrendamiento quieres ofrecer?',
    '¿Cuál es la duración mínima del arrendamiento?',
    '¿Cuántos huéspedes pueden alojarse?'
  ],
  marketplace: [
    '¿Qué servicios quieres ofrecer?',
    '¿Cuál es el rango de precios de tus productos?'
  ],
  productos_servicios: [
    '¿Qué productos o servicios adicionales quieres ofrecer?',
    '¿Tienes algún requisito especial para estos servicios?'
  ]
};

const HostModal = ({ isOpen, onClose }) => {
  const [selectedType, setSelectedType] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setCurrentQuestionIndex(0);
  };

  const handleAnswerChange = (e) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: e.target.value
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questionsByType[selectedType].length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Final step: submit or close modal
      console.log('Respuestas:', answers);
      onClose();
      // Optionally reset state here
      setSelectedType(null);
      setCurrentQuestionIndex(0);
      setAnswers({});
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      // Go back to type selection
      setSelectedType(null);
      setCurrentQuestionIndex(0);
      setAnswers({});
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {!selectedType ? (
        <HostTypeSelectionModal
          isOpen={isOpen}
          onClose={onClose}
          onSelect={handleTypeSelect}
        />
      ) : (
        <div className="host-modal-overlay" onClick={onClose} />
      )}

      {selectedType && (
        <div className="host-questions-modal">
          <button className="close-button" onClick={onClose}>×</button>
          <h2>{questionsByType[selectedType][currentQuestionIndex]}</h2>
          <textarea
            value={answers[currentQuestionIndex] || ''}
            onChange={handleAnswerChange}
            placeholder="Escribe tu respuesta aquí..."
            rows={4}
          />
          <div className="navigation-buttons">
            <button onClick={handleBack} disabled={currentQuestionIndex === 0}>
              Atrás
            </button>
            <button onClick={handleNext}>
              {currentQuestionIndex === questionsByType[selectedType].length - 1 ? 'Finalizar' : 'Siguiente'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default HostModal;
