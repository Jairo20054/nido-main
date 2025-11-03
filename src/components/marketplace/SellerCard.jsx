import React from 'react';

const SellerCard = ({ seller }) => {
  if (!seller) {
    return null;
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center gap-3">
        {/* Seller Avatar */}
        <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
          {seller.avatar ? (
            <img
              src={seller.avatar}
              alt={seller.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>

        {/* Seller Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {seller.name}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            {/* Rating */}
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                {'★'.repeat(Math.floor(seller.rating || 0))}
                {'☆'.repeat(5 - Math.floor(seller.rating || 0))}
              </div>
              <span className="text-xs text-gray-600">
                {seller.rating || 0}
              </span>
            </div>

            {/* Sales Count */}
            <span className="text-xs text-gray-600">
              • {seller.salesCount || 0} ventas
            </span>
          </div>
        </div>

        {/* Contact Button */}
        <button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200">
          Contactar
        </button>
      </div>

      {/* Seller Stats */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
        <div className="text-center">
          <div className="text-sm font-semibold text-gray-900">
            {seller.responseTime || 'N/A'}
          </div>
          <div className="text-xs text-gray-600">
            Tiempo de respuesta
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold text-gray-900">
            {seller.positiveReviews || 0}%
          </div>
          <div className="text-xs text-gray-600">
            Reseñas positivas
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold text-gray-900">
            {seller.memberSince || 'N/A'}
          </div>
          <div className="text-xs text-gray-600">
            Miembro desde
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerCard;
