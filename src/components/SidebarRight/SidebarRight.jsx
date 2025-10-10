import React from 'react';
import { mockUsers, mockPosts } from '../../utils/socialMocks';
import './SidebarRight.css';

const SidebarRight = () => {
  return (
    <div className="sidebar-right">
      <div className="section">
        <h3>Contactos</h3>
        <div className="contacts-list">
          {mockUsers.slice(0, 5).map(user => (
            <div key={user.id} className="contact-item">
              <img src={user.avatar} alt={user.name} />
              <span>{user.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h3>Anuncios</h3>
        <div className="ads-list">
          {mockPosts.slice(0, 3).map(post => (
            <div key={post.id} className="ad-card">
              <img src={post.images[0]} alt={post.description} />
              <div className="ad-content">
                <p>{post.description.slice(0, 50)}...</p>
                <span className="price">${post.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h3>Páginas sugeridas</h3>
        <div className="suggested-pages">
          <div className="page-item">Apartamentos Bogotá</div>
          <div className="page-item">Casas en Chapinero</div>
          <div className="page-item">Estudios Usaquén</div>
        </div>
      </div>
    </div>
  );
};

export default SidebarRight;
