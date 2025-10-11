// src/components/RightSidebar/RightSidebar.jsx - FB Light Mode
import React from 'react';
import './RightSidebar.css';

const mockContacts = [
  { id: 1, name: 'María González', avatar: 'https://i.pravatar.cc/40?img=1' },
  { id: 2, name: 'Carlos Rodríguez', avatar: 'https://i.pravatar.cc/40?img=2' },
  { id: 3, name: 'Ana Martínez', avatar: 'https://i.pravatar.cc/40?img=3' }
];

const mockAds = [
  { 
    id: 1, 
    title: 'Nuevo apartamento en Zona Rosa', 
    price: '$1.200.000', 
    img: 'https://picsum.photos/200/100?random=1',
    description: 'Perfecto para solteros'
  },
  { 
    id: 2, 
    title: 'Casa familiar en Medellín', 
    price: '$2.500.000', 
    img: 'https://picsum.photos/200/100?random=2',
    description: '3 habitaciones, jardín'
  }
];

const RightSidebar = () => (
  <aside className="right-sidebar" role="complementary" aria-label="Información adicional">
    {/* Contacts Section */}
    <section className="rs-section">
      <h2 className="rs-title">Contactos</h2>
      <ul className="contacts-list" role="list">
        {mockContacts.map((contact) => (
          <li key={contact.id} className="contact-item" role="listitem">
            <img 
              src={contact.avatar} 
              alt={contact.name} 
              className="contact-avatar" 
              loading="lazy"
            />
            <span className="contact-name">{contact.name}</span>
          </li>
        ))}
      </ul>
    </section>

    {/* Ads Section */}
    <section className="rs-section">
      <h2 className="rs-title">Anuncios</h2>
      {mockAds.map((ad) => (
        <article key={ad.id} className="ad-item" role="article">
          <img 
            src={ad.img} 
            alt={ad.title} 
            className="ad-image" 
            loading="lazy"
          />
          <div className="ad-details">
            <h3 className="ad-title">{ad.title}</h3>
            <p className="ad-desc">{ad.description}</p>
            <div className="ad-price">{ad.price}/mes</div>
            <button className="ad-cta" aria-label="Ver anuncio">Ver más</button>
          </div>
        </article>
      ))}
    </section>

    {/* Suggested Pages */}
    <section className="rs-section">
      <h2 className="rs-title">Páginas sugeridas</h2>
      <ul className="pages-list" role="list">
        {['Grupo Alquiler Bogotá', 'Inmobiliaria Medellín', 'Rentas en Cali'].map((page, index) => (
          <li key={index} className="page-item" role="listitem">
            <span className="page-name">{page}</span>
            <button className="page-follow-btn" aria-label="Seguir página">Seguir</button>
          </li>
        ))}
      </ul>
    </section>
  </aside>
);

export default RightSidebar;