import React from 'react';

const ProductCard = ({ product, onClick }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div
      onClick={() => onClick(product)}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
    >
      {/* Product Image */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Condition Badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 text-xs font-medium rounded ${
            product.condition === 'new'
              ? 'bg-green-100 text-green-800'
              : 'bg-orange-100 text-orange-800'
          }`}>
            {product.condition === 'new' ? 'Nuevo' : 'Usado'}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Price */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-lg font-bold text-blue-600">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
          {product.title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center">
            {'★'.repeat(Math.floor(product.rating || 0))}
            {'☆'.repeat(5 - Math.floor(product.rating || 0))}
          </div>
          <span className="text-xs text-gray-600">
            ({product.reviewCount || 0})
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <span>📍</span>
          <span>{product.location}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
