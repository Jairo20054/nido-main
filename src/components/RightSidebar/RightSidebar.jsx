// src/components/RightSidebar/RightSidebar.jsx
import React from 'react';
import './RightSidebar.css';

const RightSidebar = () => {
  const contacts = [
    { id: 1, name: 'Meta AI', avatar: '/api/placeholder/32/32', online: true },
    { id: 2, name: 'Brayan Silvera', avatar: '/api/placeholder/32/32', online: true },
    { id: 3, name: 'Joseph Felipe', avatar: '/api/placeholder/32/32', online: false },
    { id: 4, name: 'Campeo Corradale', avatar: '/api/placeholder/32/32', online: true },
    { id: 5, name: 'Patricia Fettbol', avatar: '/api/placeholder/32/32', online: true },
    { id: 6, name: 'Juanto de Chapois', avatar: '/api/placeholder/32/32', online: false }
  ];

  const sponsors = [
    {
      id: 1,
      title: 'Yours New AI Presentation Maker',
      url: 'www.facebook.com/poblid.com',
      description: 'Crea presentaciones impactantes con IA'
    },
    {
      id: 2,
      title: 'O-TIPO $100,000',
      subtitle: '439 €',
      description: 'Iniciar ITMO Challenge de 100 000 $',
      url: 'https://ITMO-Challenge.pbels.google.com/view?id=0'
    }
  ];

  const birthdays = [
    {
      id: 1,
      text: 'Hey es el cumpleaños de Gian Carlos Pretel y Valentina Bajaranzo.'
    }
  ];

  return (
    <aside className="right-sidebar" role="complementary">
      {/* Contactos */}
      <div className="sidebar-section">
        <div className="section-header">
          <h3 className="section-title">Contactos</h3>
          <div className="section-actions">
            <button className="action-btn" aria-label="Buscar contactos">🔍</button>
            <button className="action-btn" aria-label="Más opciones">⋯</button>
          </div>
        </div>
        <div className="contacts-list">
          {contacts.map(contact => (
            <div key={contact.id} className="contact-item">
              <div className="contact-avatar-container">
                <img 
                  src={contact.avatar} 
                  alt={contact.name}
                  className="contact-avatar"
                />
                {contact.online && <div className="online-indicator" />}
              </div>
              <span className="contact-name">{contact.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Patrocinados */}
      <div className="sidebar-section">
        <div className="section-header">
          <h3 className="section-title">Patrocinados</h3>
        </div>
        <div className="sponsors-list">
          {sponsors.map(sponsor => (
            <div key={sponsor.id} className="sponsor-item">
              <div className="sponsor-content">
                <div className="sponsor-title">{sponsor.title}</div>
                {sponsor.subtitle && (
                  <div className="sponsor-subtitle">{sponsor.subtitle}</div>
                )}
                <div className="sponsor-description">{sponsor.description}</div>
                <div className="sponsor-url">{sponsor.url}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cumpleaños */}
      <div className="sidebar-section">
        <div className="birthdays-list">
          {birthdays.map(birthday => (
            <div key={birthday.id} className="birthday-item">
              <div className="birthday-icon">🎂</div>
              <div className="birthday-text">{birthday.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Información de copyright */}
      <div className="sidebar-footer">
        <div className="copyright-info">
          <div className="copyright-item">
            <strong>Marche Creative</strong>
            <span>© Configuración para activar Windows</span>
            <span className="copyright-author">Sandrez Veronica</span>
          </div>
        </div>
        <div className="sidebar-links">
          <a href="/privacy">Privacidad</a>
          <a href="/terms">Términos</a>
          <a href="/help">Ayuda</a>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;