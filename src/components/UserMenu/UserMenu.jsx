import React from 'react';
import './UserMenu.css';

const UserMenu = () => {
  const user = {
    name: 'Andres Castillo',
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
  };

  const profiles = [
    { id: 1, name: 'Clip-motivacional' },
    { id: 2, name: 'Boules de Bonheur' },
  ];

  const menuOptions = [
    { id: 1, label: 'Configuración y privacidad' },
    { id: 2, label: 'Ayuda y soporte técnico' },
    { id: 3, label: 'Pantalla y accesibilidad' },
    { id: 4, label: 'Enviar comentarios' },
    { id: 5, label: 'Cerrar sesión' },
  ];

  return (
    <div className="user-menu">
      <div className="user-info">
        <img src={user.avatar} alt={user.name} className="user-avatar" />
        <span className="user-name">{user.name}</span>
      </div>

      <div className="profiles-section">
        {profiles.map(profile => (
          <div key={profile.id} className="profile-item">
            <span className="profile-icon">👤</span>
            <span className="profile-name">{profile.name}</span>
          </div>
        ))}
        <button className="view-all-profiles">Ver todos los perfiles</button>
      </div>

      <div className="menu-options">
        {menuOptions.map(option => (
          <div key={option.id} className="menu-option">
            <span className="option-icon">
              {option.label === 'Cerrar sesión' ? '🚪' : '⚙️'}
            </span>
            <span className="option-label">{option.label}</span>
          </div>
        ))}
      </div>

      <div className="footer-text">
        Privacidad · Condiciones · Publicidad · Opciones de anuncios · Cookies · Más
      </div>
    </div>
  );
};

export default UserMenu;
