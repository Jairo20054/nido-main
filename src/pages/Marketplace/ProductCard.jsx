import React, { useState } from 'react';

const ProductCard = ({ product, onClick, onAddToCart, index }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={`text-sm ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            {i < Math.floor(rating) ? '★' : '☆'}
          </span>
        ))}
        <span className="text-xs text-gray-600 ml-1">({product.reviewsCount})</span>
      </div>
    );
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onClick}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Product Image */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <span className="text-4xl">📦</span>
          </div>
        )}

        {product.images && product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            🛋️
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 space-y-1">
          {product.discount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
              -{product.discount}%
            </span>
          )}
          {product.isNew && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
              Nuevo
            </span>
          )}
          {product.featured && (
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
              Destacado
            </span>
          )}
        </div>

        {/* Shipping badge */}
        {product.shipping && product.shipping.cost === 0 && (
          <div className="absolute top-2 right-2">
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
              🚚 Gratis
            </span>
          </div>
        )}

        {/* Quick actions */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
            aria-label="Agregar al carrito"
          >
            <span className="text-sm">🛒</span>
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 text-sm leading-tight">
          {product.title}
        </h3>

        {/* Rating */}
        {renderStars(product.rating)}

        {/* Price */}
        <div className="mt-2 space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Installments */}
          {product.installments > 1 && (
            <p className="text-xs text-gray-600">
              en {product.installments}x {formatPrice(product.price / product.installments)}
            </p>
          )}
        </div>

        {/* Stock status */}
        <div className="mt-2">
          {product.stock > 10 ? (
            <span className="text-xs text-green-600">✓ Stock disponible</span>
          ) : product.stock > 0 ? (
            <span className="text-xs text-orange-600">⚠️ Últimas {product.stock} unidades</span>
          ) : (
            <span className="text-xs text-red-600">✗ Sin stock</span>
          )}
        </div>

        {/* Add to cart button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          disabled={product.stock === 0}
          className={`w-full mt-3 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            product.stock > 0
              ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {product.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
