// src/components/PostCard/PostCard.jsx - FB-like Light Mode
import React from 'react';
import './PostCard.css';

const PostCard = ({ 
  property, 
  onLike, 
  onSave, 
  onFollow,
  currentImageIndex,
  onImageChange,
  isLiked,
  isSaved
}) => {
  const hasMultipleImages = property.images.length > 1;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <article className="post-card" role="article">
      {/* Post Header */}
      <header className="post-header">
        <div className="user-info">
          <img src={property.user.avatar} alt={property.user.name} className="user-avatar" />
          <div className="user-details">
            <h3 className="username">{property.user.name}</h3>
            <time className="timestamp" dateTime={property.timestamp}>{property.timestamp}</time>
          </div>
        </div>
        {property.user.verified && <span className="verified-badge" aria-label="Verificado">✓</span>}
        <button 
          className={`follow-button ${property.isFollowing ? 'following' : ''}`}
          onClick={(e) => { e.stopPropagation(); onFollow(property.id); }}
          aria-label={property.isFollowing ? 'Dejar de seguir' : 'Seguir'}
        >
          {property.isFollowing ? 'Siguiendo' : 'Seguir'}
        </button>
      </header>

      {/* Post Image Carousel */}
      <div className="post-media">
        <img 
          src={property.images[currentImageIndex]} 
          alt={property.title} 
          className="post-image"
          loading="lazy"
        />
        {hasMultipleImages && (
          <>
            <button 
              className="carousel-btn prev" 
              onClick={(e) => { e.stopPropagation(); onImageChange(property.id, 'prev'); }}
              aria-label="Imagen anterior"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </button>
            <button 
              className="carousel-btn next" 
              onClick={(e) => { e.stopPropagation(); onImageChange(property.id, 'next'); }}
              aria-label="Siguiente imagen"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </button>
            <div className="carousel-indicators">
              {property.images.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); onImageChange(property.id, index); }}
                  aria-label={`Ir a imagen ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Post Actions Row */}
      <div className="post-actions">
        <div className="actions-left">
          <button 
            className={`action-btn like-btn ${isLiked ? 'liked' : ''}`}
            onClick={(e) => { e.stopPropagation(); onLike(property.id); }}
            aria-label={isLiked ? 'Quitar me gusta' : 'Me gusta'}
            aria-pressed={isLiked}
          >
            <svg viewBox="0 0 48 48" width="24" height="24" fill="currentColor">
              <path d="M34.6 3.6c-4.5 0-7.9 1.8-10.6 5.9-2.7-4.1-6.1-5.9-10.6-5.9C6 3.6 0 9.6 0 17.6c0 5.4 2.3 10.4 6 14.1L12 35l6.3-2.7c1.8.5 3.7.8 5.7.8s3.9-.3 5.7-.8l6.3 2.7 6-6.1c3.7-3.7 6-8.7 6-14.1 0-8 6-14 13.4-14-4.5 0-7.9 1.8-10.6 5.9-2.7-4.1-6.1-5.9-10.6-5.9z" />
            </svg>
            <span className="visually-hidden">{isLiked ? 'Me gusta' : 'Dar me gusta'}</span>
          </button>
          <button className="action-btn comment-btn" aria-label="Comentar">
            <svg viewBox="0 0 48 48" width="24" height="24" fill="currentColor">
              <path d="M47.5 46.1l-2.8-11c1.8-3.3 2.8-7.1 2.8-11.1C47.5 11 37 .5 24 .5S.5 11 .5 24 11 47.5 24 47.5c4 0 7.8-1 11.1-2.8l11 2.8c.8.2 1.6-.6 1.4-1.4zm-3-22.1c0 4-1 7-2.6 10-.2.4-.3.9-.2 1.4l2.1 8.4-8.3-2.1c-.5-.1-1-.1-1.4.2-1.8 1-5.2 2.6-10 2.6-11.4 0-20.6-9.2-20.6-20.5S12.7 3.5 24 3.5 44.5 12.7 44.5 24z" />
            </svg>
          </button>
          <button className="action-btn share-btn" aria-label="Compartir">
            <svg viewBox="0 0 48 48" width="24" height="24" fill="currentColor">
              <path d="M47.8 3.8c-.3-.5-.8-.8-1.3-.8h-45C.9 3.1.3 3.5.1 4S0 5.2.4 5.7l15.9 15.6 5.5 22.6c.1.6.6 1 1.2 1.1h.2c.5 0 1-.3 1.3-.7l23.2-39c.4-.4.4-1 .1-1.5zM5.2 6.1h35.5L18 18.7 5.2 6.1zm18.7 33.6l-4.4-18.4L42.4 8.6 23.9 39.7z" />
            </svg>
          </button>
        </div>
        <button 
          className={`action-btn save-btn ${isSaved ? 'saved' : ''}`}
          onClick={(e) => { e.stopPropagation(); onSave(property.id); }}
          aria-label={isSaved ? 'Quitar guardado' : 'Guardar'}
          aria-pressed={isSaved}
        >
          <svg viewBox="0 0 48 48" width="24" height="24" fill="currentColor">
            <path d="M43.5 48c-.4 0-.8-.2-1.1-.4L24 29 5.6 47.6c-.4.4-1.1.6-1.6.3-.6-.2-1-.8-1-1.4v-45C3 .7 3.7 0 4.5 0h39c.8 0 1.5.7 1.5 1.5v45c0 .6-.4 1.2-.9 1.4-.2.1-.4.1-.6.1zM24 26c.8 0 1.6.3 2.2.9l15.8 16V3H6v39.9l15.8-16c.6-.6 1.4-.9 2.2-.9z" />
          </svg>
        </button>
      </div>

      {/* Post Content */}
      <div className="post-content">
        <div className="post-body">
          <header className="post-body-header">
            <span className="post-author">{property.user.name}</span>
            <span className="post-location">{property.location}</span>
          </header>
          <p className="post-description">
            {property.description}
          </p>
          <div className="post-price">
            <span className="price-amount">{formatPrice(property.price)}</span>
            <span className="price-period">/mes</span>
          </div>
        </div>
        <footer className="post-footer">
          <span className="post-likes">{property.likes} personas interesadas</span>
          <button className="view-comments-btn">Ver comentarios</button>
        </footer>
      </div>

      {/* Comment Input */}
      <footer className="post-comment-input">
        <img src={property.user.avatar} alt="" className="comment-avatar" />
        <input type="text" placeholder="Escribe un comentario..." className="comment-input" aria-label="Añadir comentario" />
        <button className="comment-submit" aria-label="Publicar comentario">Publicar</button>
      </footer>
    </article>
  );
};

export default PostCard;