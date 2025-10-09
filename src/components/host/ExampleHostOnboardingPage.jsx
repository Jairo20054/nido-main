import React, { useState } from 'react';
import HostOnboardingModal from './HostOnboardingModal';

/**
 * ExampleHostOnboardingPage - Demonstration page showing how to use HostOnboardingModal
 * This component shows the complete integration with the modal component.
 */
const ExampleHostOnboardingPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completedOnboardings, setCompletedOnboardings] = useState([]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOnboardingComplete = (result) => {
    console.log('Onboarding completed:', result);
    setCompletedOnboardings(prev => [...prev, {
      ...result,
      timestamp: new Date().toISOString()
    }]);

    // Here you would typically send the data to your API
    // Example API call:
    // await api.post('/host/onboarding', result);
  };

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <h1>Host Onboarding Demo</h1>

      <div style={{ marginBottom: '2rem' }}>
        <p>
          Este es un ejemplo de cómo integrar el componente <code>HostOnboardingModal</code>
          en tu aplicación. Haz clic en el botón para abrir el modal y probar el flujo completo.
        </p>
      </div>

      <button
        onClick={handleOpenModal}
        style={{
          background: '#007bff',
          color: 'white',
          border: 'none',
          padding: '1rem 2rem',
          borderRadius: '8px',
          fontSize: '1.1rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => e.target.style.background = '#0056b3'}
        onMouseOut={(e) => e.target.style.background = '#007bff'}
      >
        Conviértete en anfitrión
      </button>

      {completedOnboardings.length > 0 && (
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h2>Onboardings Completados</h2>
          <div style={{ marginTop: '1rem' }}>
            {completedOnboardings.map((onboarding, index) => (
              <div key={index} style={{
                padding: '1rem',
                marginBottom: '1rem',
                background: 'white',
                borderRadius: '6px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong>{onboarding.selectionId}</strong>
                  <small style={{ color: '#6c757d' }}>
                    {new Date(onboarding.timestamp).toLocaleString()}
                  </small>
                </div>
                <details>
                  <summary style={{ cursor: 'pointer', color: '#007bff' }}>
                    Ver respuestas ({Object.keys(onboarding.answers).length} campos)
                  </summary>
                  <pre style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem',
                    background: '#f8f9fa',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(onboarding.answers, null, 2)}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        </div>
      )}

      <HostOnboardingModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onComplete={handleOnboardingComplete}
      />

      <div style={{ marginTop: '3rem', padding: '1.5rem', background: '#e7f3ff', borderRadius: '8px' }}>
        <h3>Características del Componente</h3>
        <ul style={{ lineHeight: '1.6' }}>
          <li><strong>Flujo completo:</strong> Selección de tarjeta → Autenticación → Formulario dinámico → Completado</li>
          <li><strong>Autenticación integrada:</strong> Verifica estado de login y muestra formulario si es necesario</li>
          <li><strong>Guardado automático:</strong> Los borradores se guardan en localStorage cada 5 segundos</li>
          <li><strong>Restauración de borradores:</strong> Al reabrir el modal, se restauran las respuestas anteriores</li>
          <li><strong>Validación en tiempo real:</strong> Mensajes de error inline para campos requeridos</li>
          <li><strong>Accesibilidad:</strong> Focus trap, navegación por teclado, roles ARIA</li>
          <li><strong>Responsive:</strong> Diseño mobile-first que funciona en todos los dispositivos</li>
          <li><strong>Animaciones sutiles:</strong> Transiciones suaves para mejor UX</li>
        </ul>
      </div>
    </div>
  );
};

export default ExampleHostOnboardingPage;
