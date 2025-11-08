import React from 'react';
import './ProductCard.css';

const ProductCard = ({ product, formatPrice, onProductClick }) => {
  return (
    <div className="product-card" onClick={() => onProductClick(product.id)}>
      <div className="product-image">
        <img src={product.image} alt={product.title} />
        <button className="favorite-btn">❤️</button>
        {product.condition === 'new' && <span className="condition-badge new">Nuevo</span>}
        {product.condition === 'like-new' && <span className="condition-badge like-new">Como nuevo</span>}
      </div>
      <div className="product-info">
        <h3 className="product-title">{product.title}</h3>
        <p className="product-price">{formatPrice(product.price)}</p>
        <p className="product-location">{product.location}</p>
        <div className="product-meta">
          <span className="product-category">{product.category}</span>
          <span className="product-date">{product.date}</span>
        </div>
        <div className="seller-rating">
          <span className="rating-stars">
            {'★'.repeat(Math.floor(product.sellerRating))}{'☆'.repeat(5 - Math.floor(product.sellerRating))}
          </span>
          <span className="rating-value">{product.sellerRating}</span>
        </div>
        <div className="product-actions">
          <button className="btn-contact" onClick={(e) => { e.stopPropagation(); /* TODO: Contact seller */ }}>
            Contactar
          </button>
          <button className="btn-details" onClick={(e) => { e.stopPropagation(); onProductClick(product.id); }}>
            Ver detalles
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
