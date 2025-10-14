// src/components/PostCard/PostCard.jsx
import React from 'react';
import './PostCard.css';

const PostCard = ({
  property,
  currentImageIndex = 0,
  onImageChange = () => {},
  onLike = () => {},
  onSave = () => {},
  onFollow = () => {},
}) => {
  const hasMultipleImages = property.images.length > 1;

  const formatPrice = (price) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);

  return (
    <div className="post-card">
      {/* Header del post */}
      <div className="post-header">
        <div className="user-info">
          <img src={property.user.avatar} alt={property.user.name} className="user-avatar" />
          <div className="user-details">
            <span className="username">{property.user.name}</span>
            <span className="location">{property.location}</span>
          </div>
        </div>
        {property.user.verified && <span className="verified-badge">✓</span>}
        <button
          className={`follow-button ${property.isFollowing ? 'following' : ''}`}
          onClick={(e) => onFollow(property.id, e)}
        >
          {property.isFollowing ? 'Siguiendo' : 'Seguir'}
        </button>
      </div>

      {/* Carrusel de imágenes */}
      <div className="post-image">
        <img
          src={property.images[currentImageIndex]}
          alt={`${property.title} - Imagen ${currentImageIndex + 1}`}
        />
        {hasMultipleImages && (
          <>
            <button
              className="carousel-button prev"
              onClick={(e) => {
                e.stopPropagation();
                onImageChange(property.id, 'prev');
              }}
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </button>
            <button
              className="carousel-button next"
              onClick={(e) => {
                e.stopPropagation();
                onImageChange(property.id, 'next');
              }}
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </button>
            <div className="carousel-dots">
              {property.images.map((_, index) => (
                <span
                  key={index}
                  className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Acciones del post */}
      <div className="post-actions">
        <div className="action-buttons">
          <button
            className={`action-button ${property.isLiked ? 'liked' : ''}`}
            onClick={(e) => onLike(property.id, e)}
          >
            <svg aria-label="Me gusta" height="24" viewBox="0 0 48 48" width="24">
              <path d="M34.6 6.1c5.7 0 10.4 5.2 10.4 11.5 0 6.8-5.9 11-11.5 16S25 41.3 24 41.9c-1.1-.7-4.7-4-9.5-8.3-5.7-5-11.5-9.2-11.5-16C3 11.3 7.7 6.1 13.4 6.1c4.2 0 6.5 2 8.1 4.3 1.9 2.6 2.2 3.9 2.5 3.9.3 0 .6-1.3 2.5-3.9 1.6-2.3 3.9-4.3 8.1-4.3z"
                fill={property.isLiked ? "#ed4956" : "none"}
                stroke={property.isLiked ? "none" : "#262626"}
                strokeWidth="2"
              />
            </svg>
          </button>
          <button className="action-button">
            <svg aria-label="Comentar" fill="#262626" height="24" viewBox="0 0 48 48" width="24">
              <path clipRule="evenodd" d="M47.5 46.1l-2.8-11c1.8-3.3 2.8-7.1 2.8-11.1C47.5 11 37 .5 24 .5S.5 11 .5 24 11 47.5 24 47.5c4 0 7.8-1 11.1-2.8l11 2.8c.8.2 1.6-.6 1.4-1.4zm-3-22.1c0 4-1 7-2.6 10-.2.4-.3.9-.2 1.4l2.1 8.4-8.3-2.1c-.5-.1-1-.1-1.4.2-1.8 1-5.2 2.6-10 2.6-11.4 0-20.6-9.2-20.6-20.5S12.7 3.5 24 3.5 44.5 12.7 44.5 24z" fillRule="evenodd"></path>
            </svg>
          </button>
          <button className="action-button">
            <svg aria-label="Compartir" fill="#262626" height="24" viewBox="0 0 48 48" width="24">
              <path d="M47.8 3.8c-.3-.5-.8-.8-1.3-.8h-45C.9 3.1.3 3.5.1 4S0 5.2.4 5.7l15.9 15.6 5.5 22.6c.1.6.6 1 1.2 1.1h.2c.5 0 1-.3 1.3-.7l23.2-39c.4-.4.4-1 .1-1.5zM5.2 6.1h35.5L18 18.7 5.2 6.1zm18.7 33.6l-4.4-18.4L42.4 8.6 23.9 39.7z"></path>
            </svg>
          </button>
        </div>
        <button
          className={`save-button ${property.isSaved ? 'saved' : ''}`}
          onClick={(e) => onSave(property.id, e)}
        >
          <svg aria-label="Guardar" height="24" viewBox="0 0 48 48" width="24">
            <path d="M43.5 48c-.4 0-.8-.2-1.1-.4L24 29 5.6 47.6c-.4.4-1.1.6-1.6.3-.6-.2-1-.8-1-1.4v-45C3 .7 3.7 0 4.5 0h39c.8 0 1.5.7 1.5 1.5v45c0 .6-.4 1.2-.9 1.4-.2.1-.4.1-.6.1zM24 26c.8 0 1.6.3 2.2.9l15.8 16V3H6v39.9l15.8-16c.6-.6 1.4-.9 2.2-.9z"
              fill={property.isSaved ? "#262626" : "none"}
              stroke={property.isSaved ? "none" : "#262626"}
              strokeWidth="2"
            />
          </svg>
        </button>
      </div>

      {/* Estadísticas del post */}
      <div className="post-stats">
        <span className="likes-count">{property.likes + (property.isLiked ? 1 : 0)} me gusta</span>
        <div className="post-caption">
          <span className="username">{property.user.name}</span>
          <span className="caption">{property.description}</span>
        </div>
        <button className="view-comments">Ver los {property.comments} comentarios</button>
        <div className="price-tag">
          <span className="price">{formatPrice(property.price)}</span>
          <span className="night">/noche</span>
        </div>
        <span className="post-time">{property.timestamp}</span>
      </div>

      {/* Añadir comentario */}
      <div className="add-comment">
        <input type="text" placeholder="Añade un comentario..." />
        <button className="post-comment-button">Publicar</button>
      </div>
    </div>
  );
};

export default PostCard; ddde555yyyyyyyyy
