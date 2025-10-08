import React, { useState } from 'react';
import HostOnboardingModal from './HostOnboardingModal';
import './styles.css';

/**
 * ExampleHostOnboardingPage
 * Demonstrates usage of HostOnboardingModal with a button to open it.
 */
const ExampleHostOnboardingPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [result, setResult] = useState(null);

  const handleOpenModal = () => {
    setModalOpen(true);
    setResult(null);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleComplete = ({ selectionId, answers }) => {
    setResult({ selectionId, answers });
    setModalOpen(false);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <button onClick={handleOpenModal} className="submit-button">
        Conviértete en anfitrión
      </button>

      <HostOnboardingModal
        open={modalOpen}
        onClose={handleCloseModal}
        onComplete={handleComplete}
      />

      {result && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Resultado del formulario:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ExampleHostOnboardingPage;
