import React from 'react';

const SellerCard = ({ seller, className = '' }) => {
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

  const handleContactSeller = () => {
    // In a real app, this would open a contact form or messaging interface
    alert(`Contactar a ${seller.name} próximamente`);
  };

  return (
    <div className={`bg-gray-50 rounded-xl p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del vendedor</h3>

      <div className="flex items-start gap-4">
        {/* Seller Avatar */}
        <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
          {seller.avatar ? (
            <img
              src={seller.avatar}
              alt={`Avatar de ${seller.name}`}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <span className="text-gray-600 text-xl font-semibold">
              {seller.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Seller Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-gray-900 truncate">{seller.name}</h4>
            {seller.verified && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Verificado
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center">
              {renderStars(seller.rating)}
            </div>
            <span className="text-sm text-gray-600">
              {seller.rating} ({seller.totalSales} ventas)
            </span>
          </div>

          {/* Response Time */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Respuesta en {seller.responseTime}</span>
          </div>

          {/* Contact Button */}
          <button
            onClick={handleContactSeller}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Contactar vendedor
          </button>
        </div>
      </div>

      {/* Additional Seller Info */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Ventas totales:</span>
            <div className="font-semibold text-gray-900">{seller.totalSales}</div>
          </div>
          <div>
            <span className="text-gray-600">Miembro desde:</span>
            <div className="font-semibold text-gray-900">2023</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerCard;
