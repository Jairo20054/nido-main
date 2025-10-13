// PostCard.jsx
import React, { useState } from 'react';
import './PostCard.css';

const PostCard = ({
  property,
  currentImageIndex = 0,
  onImageChange = () => {},
  onLike = () => {},
  onSave = () => {},
  onFollow = () => {},
}) => {
  const [comment, setComment] = useState('');

  const formatPrice = (price) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);

  const submitComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    console.log('Comentario:', comment);
    setComment('');
  };

  return (
    <article className="post-card" aria-labelledby={`post-${property.id}-title`}>
      <header className="post-header">
        <div className="user-info">
          <img src={property.user.avatar} alt={property.user.name} className="user-avatar" />
          <div className="user-details">
            <div className="user-name">
              {property.user.name}
              {property.user.verified && <span className="verified-badge" title="Verificado">✓</span>}
            </div>
            <div className="post-location">{property.location}</div>
          </div>
        </div>

        <div className="header-actions">
          <button
            className={`follow-btn ${property.isFollowing ? 'following' : ''}`}
            onClick={(e) => { e.stopPropagation(); onFollow(property.id); }}
            aria-pressed={property.isFollowing}
          >
            {property.isFollowing ? 'Siguiendo' : 'Seguir'}
          </button>
        </div>
      </header>

      <div className="post-content">
        <p className="post-description">{property.description}</p>
      </div>

      <div className="post-images">
        <img src={property.images[currentImageIndex]} alt={property.title} className="post-image" loading="lazy" />

        {property.images.length > 1 && (
          <>
            <button
              className="carousel-btn carousel-prev"
              onClick={(e) => { e.stopPropagation(); onImageChange(property.id, 'prev'); }}
              aria-label="Anterior"
            >‹</button>

            <button
              className="carousel-btn carousel-next"
              onClick={(e) => { e.stopPropagation(); onImageChange(property.id, 'next'); }}
              aria-label="Siguiente"
            >›</button>

            <div className="carousel-dots" role="tablist">
              {property.images.map((_, i) => (
                <button
                  key={i}
                  className={`dot ${i === currentImageIndex ? 'active' : ''}`}
                  aria-label={`Imagen ${i + 1}`}
                  onClick={(e) => { e.stopPropagation(); onImageChange(property.id, i); }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="property-info">
        <div className="property-price">{formatPrice(property.price)} <span>/mes</span></div>
        <h3 id={`post-${property.id}-title`} className="property-title">{property.title}</h3>

        <div className="property-specs">
          <div className="spec"><span className="spec-icon">🛏️</span><span>{property.specs.rooms} hab.</span></div>
          <div className="spec"><span className="spec-icon">🚿</span><span>{property.specs.bathrooms} baños</span></div>
          <div className="spec"><span className="spec-icon">📐</span><span>{property.specs.area} m²</span></div>
          {property.specs.parking && <div className="spec"><span className="spec-icon">🚗</span><span>Parqueadero</span></div>}
        </div>
      </div>

      <div className="post-stats">
        <div className="stats-left">
          <button className="likes-count" onClick={() => onLike(property.id)}>{property.likes} me gusta</button>
          <span className="comments-count">{property.comments} comentarios</span>
        </div>
        <span className="shares-count">15 compartidos</span>
      </div>

      <div className="post-actions">
        <button className={`action-btn ${property.isLiked ? 'liked' : ''}`} onClick={() => onLike(property.id)} aria-pressed={property.isLiked}>
          <span className="action-icon">👍</span>
          <span className="action-label">Me gusta</span>
        </button>

        <button className="action-btn" onClick={() => { /* foco al input comentario si quieres */ }}>
          <span className="action-icon">💬</span>
          <span className="action-label">Comentar</span>
        </button>

        <button className="action-btn">
          <span className="action-icon">↪️</span>
          <span className="action-label">Compartir</span>
        </button>

        <button className={`action-btn ${property.isSaved ? 'saved' : ''}`} onClick={() => onSave(property.id)} aria-pressed={property.isSaved}>
          <span className="action-icon">{property.isSaved ? '💾' : '📌'}</span>
          <span className="action-label">Guardar</span>
        </button>
      </div>

      <form className="comment-form" onSubmit={submitComment}>
        <div className="comment-input-container">
          <img src="/api/placeholder/32/32" alt="Tu avatar" className="comment-avatar" />
          <input
            className="comment-input"
            placeholder="Escribe un comentario..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        <button type="submit" className="comment-submit" disabled={!comment.trim()}>Publicar</button>
      </form>
    </article>
  );
};

export default PostCard;
