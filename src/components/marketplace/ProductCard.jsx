import React from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product, onClick, className = '' }) => {
  const { addToCart, isInCart } = useCart();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">☆</span>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300">☆</span>);
    }

    return stars;
  };

  return (
    <motion.div
      className={`product-card ${className}`}
      whileHover={{ y: -4 }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`Ver detalles de ${product.title}`}
    >
      {/* Product Image */}
      <div className="product-image-container">
        <img
          src={product.images[0]}
          alt={product.title}
          className="product-image"
          loading="lazy"
        />

        {/* Discount Badge */}
        {product.originalPrice && (
          <div className="discount-badge">
            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
          </div>
        )}

        {/* Tags */}
        <div className="product-tags">
          {product.tags?.slice(0, 2).map((tag, index) => (
            <span key={index} className="product-tag">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Product Info */}
      <div className="product-info">
        {/* Title and Condition */}
        <div className="product-header">
          <h3 className="product-title">
            {product.title}
          </h3>
          <span className={`condition-badge ${product.condition === 'new' ? 'condition-new' : 'condition-used'}`}>
            {product.condition === 'new' ? 'Nuevo' : 'Usado'}
          </span>
        </div>

        {/* Seller Info */}
        <div className="seller-info">
          <span className="seller-name">
            {product.seller.name}
            {product.seller.verified && (
              <span className="verified-badge" aria-label="Vendedor verificado">✓</span>
            )}
          </span>
          <span>{product.location}</span>
        </div>

        {/* Rating */}
        <div className="product-rating">
          <div className="rating-stars">
            {renderStars(product.rating)}
          </div>
          <span className="rating-text">
            ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="product-price">
          <span className="price-current">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="price-original">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="product-actions">
          <button
            onClick={handleAddToCart}
            className={`btn-add-cart ${isInCart(product.id) ? 'in-cart' : ''}`}
            aria-label={isInCart(product.id) ? 'Ya en carrito' : 'Agregar al carrito'}
          >
            {isInCart(product.id) ? '✓ En carrito' : 'Agregar'}
          </button>
          <button
            className="btn-buy-now"
            aria-label="Comprar ahora"
          >
            Comprar
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
