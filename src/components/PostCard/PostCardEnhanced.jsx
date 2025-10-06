import React, { useState } from 'react';
import { MessageCircle, Share, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './PostCard.css';

const PostCardEnhanced = ({
  property,
  onClick,
  onLike,
  onSave,
  onFollow,
  onComment,
  onShare,
  currentImageIndex,
  onImageChange,
  isLiked,
  isSaved
}) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const hasMultipleImages = property.images.length > 1;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleLike = (e) => {
    e.stopPropagation();
    onLike(property.id, e);
  };

  const handleSave = (e) => {
    e.stopPropagation();
    onSave(property.id, e);
  };

  const handleFollow = (e) => {
    e.stopPropagation();
    onFollow(property.id, e);
  };

  const handleComment = (e) => {
    e.stopPropagation();
    setShowComments(!showComments);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    setShowShareModal(true);
  };

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment?.(property.id, commentText);
      setCommentText('');
    }
  };

  const handleCardClick = () => {
    onClick?.(property.id);
  };

  return (
    <motion.article
      className="post-card"
      onClick={handleCardClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      role="article"
      aria-labelledby={`post-${property.id}-title`}
    >
      {/* Header del post */}
      <header className="post-header">
        <div className="user-info">
          <img
            src={property.user.avatar}
            alt={property.user.name}
            className="user-avatar"
            loading="lazy"
          />
          <div className="user-details">
            <button
              className="username"
              onClick={(e) => {
                e.stopPropagation();
                // Aquí iría la navegación al perfil
              }}
            >
              {property.user.name}
            </button>
            <span className="location">{property.location}</span>
          </div>
        </div>

        <div className="header-actions">
          {property.user.verified && (
            <span className="verified-badge" aria-label="Usuario verificado">
              ✓
            </span>
          )}
          <button
            className={`follow-button ${property.isFollowing ? 'following' : ''}`}
            onClick={handleFollow}
            aria-label={property.isFollowing ? 'Dejar de seguir' : 'Seguir usuario'}
          >
            {property.isFollowing ? 'Siguiendo' : 'Seguir'}
          </button>
          <button
            className="more-button"
            aria-label="Más opciones"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </header>

      {/* Carrusel de imágenes */}
      <div className="post-image">
        <img
          src={property.images[currentImageIndex]}
          alt={`${property.title} - Imagen ${currentImageIndex + 1}`}
          loading="lazy"
        />

        {/* Indicadores de imagen múltiple */}
        {hasMultipleImages && (
          <>
            <button
              className="carousel-button prev"
              onClick={(e) => {
                e.stopPropagation();
                onImageChange(property.id, 'prev', e);
              }}
              aria-label="Imagen anterior"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </button>
            <button
              className="carousel-button next"
              onClick={(e) => {
                e.stopPropagation();
                onImageChange(property.id, 'next', e);
              }}
              aria-label="Siguiente imagen"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </button>
            <div className="carousel-dots" role="tablist" aria-label="Imágenes del post">
              {property.images.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                  role="tab"
                  aria-selected={index === currentImageIndex}
                  aria-label={`Imagen ${index + 1} de ${property.images.length}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onImageChange(property.id, index > currentImageIndex ? 'next' : 'prev', e);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Acciones del post */}
      <div className="post-actions">
        <div className="action-buttons">
          <motion.button
            className={`action-button ${isLiked ? 'liked' : ''}`}
            onClick={handleLike}
            aria-label={isLiked ? 'Quitar me gusta' : 'Me gusta'}
            whileTap={{ scale: 0.9 }}
            animate={isLiked ? { scale: [1, 1.2, 1] } : { scale: 1 }}
          >
            {isLiked ? '❤️' : '🤍'}
          </motion.button>

          <motion.button
            className="action-button"
            onClick={handleComment}
            aria-label="Comentar"
            whileTap={{ scale: 0.9 }}
          >
            💬
          </motion.button>

          <motion.button
            className="action-button"
            onClick={handleShare}
            aria-label="Compartir"
            whileTap={{ scale: 0.9 }}
          >
            🔗
          </motion.button>
        </div>

        <motion.button
          className={`save-button ${isSaved ? 'saved' : ''}`}
          onClick={handleSave}
          aria-label={isSaved ? 'Quitar de guardados' : 'Guardar'}
          whileTap={{ scale: 0.9 }}
          animate={isSaved ? { rotate: [0, 10, -10, 0] } : { rotate: 0 }}
        >
          {isSaved ? '🔖' : '🔖'}
        </motion.button>
      </div>

      {/* Estadísticas del post */}
      <div className="post-stats">
        <motion.span
          className="likes-count"
          animate={{ scale: isLiked ? [1, 1.1, 1] : 1 }}
        >
          {property.likes + (isLiked ? 1 : 0)} me gusta
        </motion.span>

        <div className="post-caption">
          <button
            className="username"
            onClick={(e) => {
              e.stopPropagation();
              // Navegación al perfil
            }}
          >
            {property.user.name}
          </button>
          <span className="caption">{property.description}</span>
        </div>

        <button
          className="view-comments"
          onClick={(e) => {
            e.stopPropagation();
            setShowComments(!showComments);
          }}
        >
          Ver los {property.comments} comentarios
        </button>

        <div className="price-tag">
          <span className="price">{formatPrice(property.price)}</span>
          <span className="night">/noche</span>
        </div>

        <button
          className="reserve-button"
          onClick={(e) => {
            e.stopPropagation();
            // Aquí iría la lógica de reserva
            console.log('Reservar propiedad:', property.id);
          }}
          aria-label="Reservar propiedad"
        >
          Reservar
        </button>

        <time className="post-time" dateTime={property.timestamp}>
          {property.timestamp}
        </time>
      </div>

      {/* Sección de comentarios */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            className="comments-section"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="comments-list">
              {/* Aquí irían los comentarios reales */}
              <div className="comment">
                <span className="comment-user">usuario123</span>
                <span className="comment-text">¡Hermosa propiedad! 😍</span>
              </div>
              <div className="comment">
                <span className="comment-user">viajero2024</span>
                <span className="comment-text">¿Está disponible para diciembre?</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Añadir comentario */}
      <form className="add-comment" onSubmit={handleSubmitComment}>
        <input
          type="text"
          placeholder="Añade un comentario..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          aria-label="Añadir comentario"
        />
        <button
          type="submit"
          className="post-comment-button"
          disabled={!commentText.trim()}
        >
          Publicar
        </button>
      </form>

      {/* Modal de compartir */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            className="share-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              className="share-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Compartir publicación</h3>
              <div className="share-options">
                <button className="share-option">
                  <MessageCircle size={20} />
                  <span>Enviar por mensaje</span>
                </button>
                <button className="share-option">
                  <Share size={20} />
                  <span>Copiar enlace</span>
                </button>
              </div>
              <button
                className="close-share"
                onClick={() => setShowShareModal(false)}
              >
                Cancelar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
};

export default PostCardEnhanced;
