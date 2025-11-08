import React, { useState } from 'react';
import './CreatePostModal.css';

const CreatePostModal = ({ onClose }) => {
  const [postType, setPostType] = useState('item');
  const [activePosts, setActivePosts] = useState(3);

  const postTypes = [
    {
      id: 'item',
      title: 'Artículo en venta',
      description: 'Crea una sola publicación para vender uno o más artículos.'
    },
    {
      id: 'vehicle',
      title: 'Vehículos en venta',
      description: 'Vende cualquier tipo de vehículo: autos, motos, bicicletas, etc.'
    },
    {
      id: 'property',
      title: 'Propiedad en venta o alquiler',
      description: 'Publica una casa o departamento para vender o alquilar.'
    }
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Crear publicación</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="post-stats">
          <p><strong>Tus publicaciones</strong> {activePosts} activas</p>
        </div>

        <div className="post-type-section">
          <h3>Elegir tipo de publicación</h3>
          <div className="post-type-grid">
            {postTypes.map(type => (
              <div
                key={type.id}
                className={`post-type-card ${postType === type.id ? 'active' : ''}`}
                onClick={() => setPostType(type.id)}
              >
                <h4>{type.title}</h4>
                <p>{type.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-continue">Continuar</button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
