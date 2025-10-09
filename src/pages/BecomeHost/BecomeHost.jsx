// src/pages/BecomeHost/BecomeHost.jsx
import { useState } from 'react';
import HostTypeSelectionModal from '../../components/host/HostTypeSelectionModal';
import './BecomeHost.css'; // Estilos específicos para la página

const BecomeHost = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHostType, setSelectedHostType] = useState(null);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleHostTypeSelect = (type) => {
    setSelectedHostType(type);
    setIsModalOpen(false);
    // TODO: Show questions based on selection or navigate to appropriate form/page
    alert(`Has seleccionado: ${type}. Aquí mostraríamos las preguntas correspondientes.`);
  };

  return (
    <div className="become-host-container">
      {/* Hero */}
      <div className="become-host-hero">
        <h1>Convierte tu espacio en un ingreso extra</h1>
        <p>Únete a nuestra comunidad de anfitriones y ofrece alojamientos accesibles</p>
        <button className="cta-button" onClick={handleOpenModal}>
          Comenzar ahora
        </button>
      </div>

      {/* Beneficios */}
      <div className="benefits-section">
        <h2>Ventajas de ser anfitrión en Nido</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <span className="benefit-icon">💰</span>
            <h3>Ingresos adicionales</h3>
            <p>Gana dinero extra con ese espacio que no utilizas</p>
          </div>
          <div className="benefit-card">
            <span className="benefit-icon">🌎</span>
            <h3>Conecta con viajeros</h3>
            <p>Conoce personas de todo el mundo</p>
          </div>
          <div className="benefit-card">
            <span className="benefit-icon">⚙️</span>
            <h3>Herramientas fáciles</h3>
            <p>Gestiona tus reservas con nuestro panel intuitivo</p>
          </div>
          <div className="benefit-card">
            <span className="benefit-icon">🛡️</span>
            <h3>Protección garantizada</h3>
            <p>Seguro de responsabilidad civil incluido</p>
          </div>
        </div>
      </div>

      {/* Cómo funciona */}
      <div className="how-it-works">
        <h2>¿Cómo funciona?</h2>
        <ol className="steps-list">
          <li>
            <strong>Registra tu espacio</strong>
            <p>Completa el formulario con los detalles de tu propiedad</p>
          </li>
          <li>
            <strong>Establece disponibilidad y precios</strong>
            <p>Define cuándo está disponible y a qué precio</p>
          </li>
          <li>
            <strong>Recibe reservas</strong>
            <p>Acepta solicitudes de huéspedes verificados</p>
          </li>
          <li>
            <strong>Recibe pagos</strong>
            <p>Gana dinero de forma segura después de cada estancia</p>
          </li>
        </ol>
      </div>

      {/* Call to Action */}
      <div className="cta-section">
        <h2>¿Listo para comenzar?</h2>
        <button className="cta-button primary" onClick={handleOpenModal}>
          Publicar mi espacio
        </button>
        <p className="small-text">
          ¿Tienes dudas? <a href="/contact">Contáctanos</a>
        </p>
      </div>

      <HostTypeSelectionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSelect={handleHostTypeSelect}
      />
    </div>
  );
};

export default BecomeHost;
