import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, Share2, MapPin, Users, Home, Maximize2, Star } from 'lucide-react';
import PaymentGateway from '../PaymentGateway/PaymentGateway';
import './PropertyDetail.css';

const PropertyDetail = ({ property, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: '1'
  });

  if (!property) return null;

  const images = property.images || [];
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="property-detail-overlay" onClick={onClose}>
      <div className="property-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header con botón cerrar */}
        <div className="property-detail-header">
          <div className="header-controls">
            <button className="control-btn" onClick={() => setIsFavorite(!isFavorite)}>
              <Heart size={24} fill={isFavorite ? '#ff3b72' : 'none'} color={isFavorite ? '#ff3b72' : '#6b7280'} />
            </button>
            <button className="control-btn">
              <Share2 size={24} color="#6b7280" />
            </button>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={28} color="#111827" />
          </button>
        </div>

        {/* Galería de imágenes - GRANDE */}
        <div className="property-detail-gallery">
          <div className="gallery-container">
            {images.length > 0 && (
              <>
                <img
                  src={images[currentImageIndex]}
                  alt={`${property.title} - Imagen ${currentImageIndex + 1}`}
                  className="gallery-image"
                />

                {/* Navegación de imágenes */}
                {images.length > 1 && (
                  <>
                    <button className="gallery-nav gallery-nav-prev" onClick={prevImage}>
                      <ChevronLeft size={32} />
                    </button>
                    <button className="gallery-nav gallery-nav-next" onClick={nextImage}>
                      <ChevronRight size={32} />
                    </button>

                    {/* Indicadores */}
                    <div className="gallery-indicators">
                      {images.map((_, index) => (
                        <div
                          key={index}
                          className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                          onClick={() => setCurrentImageIndex(index)}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Contador de imágenes */}
                <div className="image-counter">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Contenido - Información */}
        <div className="property-detail-content">
          {/* Título y Rating */}
          <div className="content-header">
            <div>
              <h1 className="property-title">{property.title}</h1>
              <div className="property-location">
                <MapPin size={18} />
                <span>{property.location}</span>
              </div>
            </div>
            <div className="rating-box">
              <Star size={20} fill="#fbbf24" color="#fbbf24" />
              <span className="rating">{property.rating}</span>
              <span className="reviews">({property.reviewCount} reseñas)</span>
            </div>
          </div>

          {/* Precio */}
          <div className="price-section">
            <div className="price">
              ${property.price.toLocaleString('es-CO')}
            </div>
            <div className="price-label">por noche</div>
          </div>

          {/* Características Grid */}
          <div className="features-grid">
            <div className="feature-card">
              <Home size={24} />
              <div>
                <div className="feature-label">Tipo</div>
                <div className="feature-value">{property.type}</div>
              </div>
            </div>
            <div className="feature-card">
              <Users size={24} />
              <div>
                <div className="feature-label">Huéspedes</div>
                <div className="feature-value">{property.bedrooms + property.bathrooms} personas</div>
              </div>
            </div>
            <div className="feature-card">
              <Home size={24} />
              <div>
                <div className="feature-label">Cuartos</div>
                <div className="feature-value">{property.bedrooms}</div>
              </div>
            </div>
            <div className="feature-card">
              <Maximize2 size={24} />
              <div>
                <div className="feature-label">m²</div>
                <div className="feature-value">{property.sqft}</div>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="description-section">
            <h3>Acerca de esta propiedad</h3>
            <p>
              Una hermosa {property.type.toLowerCase()} ubicada en {property.location}. 
              Con {property.bedrooms} dormitorio{property.bedrooms > 1 ? 's' : ''}, 
              {property.bathrooms} baño{property.bathrooms > 1 ? 's' : ''} y {property.sqft}m² de espacio.
              Perfecta para tu estancia.
            </p>
          </div>

          {/* Amenidades */}
          <div className="amenities-section">
            <h3>Amenidades</h3>
            <div className="amenities-grid">
              <div className="amenity">✓ WiFi Gratis</div>
              <div className="amenity">✓ Aire Acondicionado</div>
              <div className="amenity">✓ Cocina</div>
              <div className="amenity">✓ TV por Cable</div>
              <div className="amenity">✓ Estacionamiento</div>
              <div className="amenity">✓ Agua Caliente</div>
            </div>
          </div>

          {/* Sección de Reserva */}
          <div className="booking-section">
            <h3>Selecciona tus fechas</h3>
            <div className="booking-fields">
              <div className="booking-field">
                <label htmlFor="checkIn">Check-in</label>
                <input
                  type="date"
                  id="checkIn"
                  value={bookingData.checkIn}
                  onChange={(e) => setBookingData({...bookingData, checkIn: e.target.value})}
                />
              </div>
              <div className="booking-field">
                <label htmlFor="checkOut">Check-out</label>
                <input
                  type="date"
                  id="checkOut"
                  value={bookingData.checkOut}
                  onChange={(e) => setBookingData({...bookingData, checkOut: e.target.value})}
                />
              </div>
              <div className="booking-field">
                <label htmlFor="guests">Huéspedes</label>
                <select
                  id="guests"
                  value={bookingData.guests}
                  onChange={(e) => setBookingData({...bookingData, guests: e.target.value})}
                >
                  <option value="1">1 huésped</option>
                  <option value="2">2 huéspedes</option>
                  <option value="3">3 huéspedes</option>
                  <option value="4">4 huéspedes</option>
                  <option value="5">5 huéspedes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="action-buttons">
            <button className="btn-secondary" onClick={onClose}>
              Volver
            </button>
            <button 
              className="btn-primary"
              onClick={() => setShowPayment(true)}
              disabled={!bookingData.checkIn || !bookingData.checkOut}
            >
              Proceder al Pago
            </button>
          </div>
        </div>

        {/* Payment Gateway Modal */}
        {showPayment && (
          <PaymentGateway
            property={property}
            checkInDate={bookingData.checkIn}
            checkOutDate={bookingData.checkOut}
            guests={bookingData.guests}
            onClose={() => setShowPayment(false)}
            onPaymentComplete={(data) => {
              console.log('Reserva completada:', data);
              onClose();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PropertyDetail;
