import React, { useState } from 'react';
import './HostTypeSelectionModal.css';
import { useAuthContext } from '../../context/AuthContext';
import AuthModal from '../user/Auth/AuthModal';

const HostTypeSelectionModal = ({ isOpen, onClose, onSelect }) => {
  const { isAuthenticated } = useAuthContext();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  if (!isOpen) return null;

  const handleSelect = (type) => {
    if (!isAuthenticated) {
      setSelectedType(type);
      setShowAuthModal(true);
    } else {
      onSelect(type);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    if (selectedType) {
      onSelect(selectedType);
    }
  };

  return (
    <>
      <div className="host-type-modal-overlay" onClick={onClose} />
      <div className="host-type-modal">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>¿Qué te gustaría compartir?</h2>
        <div className="options-container">
          <div className="option-card" onClick={() => handleSelect('arrendamiento')}>
            <span role="img" aria-label="house" className="option-icon">🏠</span>
            <p>Arrendamiento</p>
          </div>
          <div className="option-card" onClick={() => handleSelect('marketplace')}>
            <span role="img" aria-label="market" className="option-icon">🎈</span>
            <p>Marketplace</p>
          </div>
          <div className="option-card" onClick={() => handleSelect('productos_servicios')}>
            <span role="img" aria-label="service" className="option-icon">🛎️</span>
            <p>Productos y servicios adicionales</p>
          </div>
        </div>
      </div>
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </>
  );
};

export default HostTypeSelectionModal;
