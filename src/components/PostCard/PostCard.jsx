// src/components/PostCard/PostCard.jsx
import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './PostCard.css';

const PostCard = ({ 
  property, 
  onClick, 
  onLike, 
  onSave, 
  onFollow,
  currentImageIndex,
  onImageChange,
  isLiked,
  isSaved
}) => {
  const [showComments, setShowComments] = useState(false);
  const hasMultipleImages = property.images.length > 1;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleLikeClick = (e) => {
    e.stopPropagation();
    onLike?.(property.id);
  };

  const handleSaveClick = (e) => {
    e.stopPropagation();
    onSave?.(property.id);
  };

  const handleFollowClick = (e) => {
    e.stopPropagation();
    onFollow?.(property.id);
  };

  const handleCommentClick = (e) => {
    e.stopPropagation();
    setShowComments(!showComments);
  };

  return (
    <article className="post-card" onClick={() => onClick?.(property.id)} role="article">
      {/* Header */}
      <div className="post-header">
        <div className="user-info">
          <img src={property.user.avatar || '/api/placeholder/40/40'} alt={property.user.name} className="user-avatar" />
          <div className="user-details">
            <div className="username-location">
              <span className="username">{property.user.name}</span>
              {property.user.verified && <span className="verified-badge">✓</span>}
              <span className="location"> · {property.location}</span>
            </div>
            <span className="post-time">hace 1h</span>
          </div>
        </div>
        <button className="more-button" aria-label="Más opciones">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Image Carousel */}
      <div className="post-image-container">
        <img
          src={property.images?.[currentImageIndex] || '/default-image.png'}
          alt={property.title}
          className="post-image"
        />
        {hasMultipleImages && (
          <div className="carousel-controls">
            <button className="carousel-btn prev" onClick={(e) => { e.stopPropagation(); onImageChange(property.id, 'prev'); }}>
              ‹
            </button>
            <div className="carousel-dots">
              {property.images.map((_, idx) => (
                <span key={idx} className={`dot ${idx === currentImageIndex ? 'active' : ''}`} />
              ))}
            </div>
            <button className="carousel-btn next" onClick={(e) => { e.stopPropagation(); onImageChange(property.id, 'next'); }}>
              ›
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="post-actions">
        <div className="action-buttons">
          <motion.button 
            className={`action-btn ${isLiked ? 'liked' : ''}`} 
            onClick={handleLikeClick}
            whileTap={{ scale: 0.95 }}
            animate={isLiked ? { scale: [1, 1.1, 1] } : {}}
          >
            <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
          </motion.button>
          <button className="action-btn" onClick={handleCommentClick}>
            <MessageCircle size={24} />
          </button>
          <button className="action-btn">
            <Share2 size={24} />
          </button>
        </div>
        <motion.button 
          className={`action-btn ${isSaved ? 'saved' : ''}`} 
          onClick={handleSaveClick}
          whileTap={{ scale: 0.95 }}
        >
          <Bookmark size={24} fill={isSaved ? 'currentColor' : 'none'} />
        </motion.button>
      </div>

      {/* Stats and Caption */}
      <div className="post-content">
        <div className="likes-count">{property.likes} me gusta</div>
        <div className="caption">
          <span className="username">{property.user.name}</span>
          {property.description}
        </div>
        <button className="view-comments" onClick={handleCommentClick}>
          Ver los {property.comments} comentarios
        </button>
        <div className="price-tag">
          <span className="price">{formatPrice(property.price)}</span>
          <span className="night">/noche</span>
        </div>
      </div>

      {/* Add Comment */}
      <div className="add-comment">
        <input type="text" placeholder="Añade un comentario..." />
        <button>Publicar</button>
      </div>

      {/* Comments Preview */}
      <AnimatePresence>
        {showComments && (
          <motion.div 
            className="comments-preview"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="comment">Usuario · ¡Qué gran oferta!</div>
            <div className="comment">Otro · ¿Disponible?</div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
};

export default PostCard;