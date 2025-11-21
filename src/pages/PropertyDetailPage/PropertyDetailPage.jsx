import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, Share2, MapPin, Users, Home, Maximize2, Star, Wifi, Zap, Wind, Droplet } from 'lucide-react';
import './PropertyDetailPage.css';

// Mock data - en producción vendría de la API
const MOCK_PROPERTIES = [
  { 
    id: 1, 
    title: 'Apartamento El Poblado', 
    location: 'Medellín, Colombia', 
    price: 1800000, 
    rating: 4.8, 
    reviewCount: 45, 
    bedrooms: 3, 
    bathrooms: 2, 
    sqft: 85, 
    type: 'Apartamento',
    latitude: 6.2276,
    longitude: -75.5898,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=800&fit=crop'
    ],
    description: 'Hermoso apartamento ubicado en el corazón de El Poblado. Moderno, seguro y completamente amueblado. Perfecto para familias o grupos de viajeros.',
    amenities: ['WiFi Gratis', 'Aire Acondicionado', 'Cocina Completa', 'Lavadora', 'Estacionamiento', 'TV por Cable', 'Agua Caliente 24h', 'Área Social']
  },
  { 
    id: 2, 
    title: 'Casa Moderna', 
    location: 'Sabaneta, Colombia', 
    price: 2500000, 
    rating: 4.9, 
    reviewCount: 23, 
    bedrooms: 4, 
    bathrooms: 3, 
    sqft: 150, 
    type: 'Casa',
    latitude: 6.1731,
    longitude: -75.6000,
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1564582913893-77bd1e8e4a2e?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop'
    ],
    description: 'Hermosa casa moderna con diseño contemporáneo. Ubicada en zona exclusiva de Sabaneta con fácil acceso a todas las amenidades.',
    amenities: ['WiFi Gratis', 'Jardín', 'Piscina', 'Aire Acondicionado', 'Cocina Gourmet', 'Estacionamiento para 2 autos', 'Seguridad 24/7', 'Terraza']
  },
  { 
    id: 3, 
    title: 'Estudio Centro', 
    location: 'Medellín Centro, Colombia', 
    price: 950000, 
    rating: 4.6, 
    reviewCount: 67, 
    bedrooms: 1, 
    bathrooms: 1, 
    sqft: 40, 
    type: 'Estudio',
    latitude: 6.2518,
    longitude: -75.5636,
    images: [
      'https://images.unsplash.com/photo-1512197917215-82f0a50eb629?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1200&h=800&fit=crop'
    ],
    description: 'Acogedor estudio en el centro de Medellín. Ideal para viajeros solitarios o parejas jóvenes. Ubicación céntrica con acceso a transporte.',
    amenities: ['WiFi Gratis', 'Aire Acondicionado', 'Cocina Equipada', 'Baño Privado', 'Recepción 24/7', 'Acceso a Metro']
  },
  { 
    id: 4, 
    title: 'Penthouse Laureles', 
    location: 'Laureles, Colombia', 
    price: 3200000, 
    rating: 5.0, 
    reviewCount: 12, 
    bedrooms: 3, 
    bathrooms: 2, 
    sqft: 120, 
    type: 'Penthouse',
    latitude: 6.2350,
    longitude: -75.5850,
    images: [
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1564582913893-77bd1e8e4a2e?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop'
    ],
    description: 'Espectacular penthouse en Laureles con vistas panorámicas. Acabados de lujo y ubicación privilegiada en la zona más exclusiva.',
    amenities: ['WiFi Premium', 'Aire Acondicionado Premium', 'Cocina de Diseño', 'Jacuzzi', 'Terraza con Vistas', 'Estacionamiento Cubierto', 'Servicio de Concierge']
  },
  { 
    id: 5, 
    title: 'Loft Industrial', 
    location: 'Centro, Colombia', 
    price: 1500000, 
    rating: 4.7, 
    reviewCount: 38, 
    bedrooms: 2, 
    bathrooms: 2, 
    sqft: 95, 
    type: 'Loft',
    latitude: 6.2518,
    longitude: -75.5636,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1200&h=800&fit=crop'
    ],
    description: 'Moderno loft industrial con techos altos y gran amplitud de espacios. Perfecto para profesionales creativos.',
    amenities: ['WiFi', 'Aire Acondicionado', 'Cocina Abierta', 'Área de Trabajo', 'Acceso a Eventos', 'Estacionamiento']
  },
  { 
    id: 6, 
    title: 'Villa Exclusiva', 
    location: 'Sabaneta, Colombia', 
    price: 4200000, 
    rating: 4.95, 
    reviewCount: 28, 
    bedrooms: 5, 
    bathrooms: 4, 
    sqft: 250, 
    type: 'Villa',
    latitude: 6.1731,
    longitude: -75.6000,
    images: [
      'https://images.unsplash.com/photo-1564582913893-77bd1e8e4a2e?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=800&fit=crop'
    ],
    description: 'Villa de lujo exclusiva con las mejores amenidades. Ubicación privilegiada con acceso a todas las comodidades.',
    amenities: ['WiFi de Fibra', 'Aire Central', 'Cocina de Chef', 'Piscina Climatizada', 'Sauna', 'Gym Privado', 'Seguridad 24/7', 'Jardín Paisajístico']
  }
];

const PropertyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Encontrar la propiedad
  const property = MOCK_PROPERTIES.find(p => p.id === parseInt(id));

  if (!property) {
    return (
      <div className="property-not-found">
        <h2>Propiedad no encontrada</h2>
        <button onClick={() => navigate('/')}>Volver al inicio</button>
      </div>
    );
  }

  const images = property.images || [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="property-detail-page">
      {/* Header con botón volver */}
      <div className="pdp-header">
        <button className="btn-back" onClick={() => navigate('/')}>
          <ChevronLeft size={24} />
          Volver
        </button>
        <h1 className="pdp-title">{property.title}</h1>
        <div className="header-actions">
          <button 
            className={`btn-favorite ${isFavorite ? 'active' : ''}`}
            onClick={() => setIsFavorite(!isFavorite)}
          >
            <Heart size={24} fill={isFavorite ? '#ff3b72' : 'none'} />
          </button>
          <button className="btn-share">
            <Share2 size={24} />
          </button>
        </div>
      </div>

      <div className="pdp-container">
        {/* Galería de imágenes grande */}
        <section className="pdp-gallery-section">
          <div className="gallery-main">
            <img 
              src={images[currentImageIndex]} 
              alt={`${property.title} - Imagen ${currentImageIndex + 1}`}
              className="main-image"
            />
            
            {/* Navegación de imágenes */}
            {images.length > 1 && (
              <>
                <button className="nav-button nav-prev" onClick={prevImage}>
                  <ChevronLeft size={32} />
                </button>
                <button className="nav-button nav-next" onClick={nextImage}>
                  <ChevronRight size={32} />
                </button>
              </>
            )}

            {/* Contador de imágenes */}
            <div className="image-counter">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="gallery-thumbnails">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  className={`thumbnail ${idx === currentImageIndex ? 'active' : ''}`}
                  onClick={() => goToImage(idx)}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Información y detalles */}
        <section className="pdp-info-section">
          {/* Header info */}
          <div className="info-header">
            <div className="info-title-block">
              <h2>{property.title}</h2>
              <div className="info-location">
                <MapPin size={20} />
                <span>{property.location}</span>
              </div>
            </div>

            <div className="info-rating">
              <div className="stars">
                <Star size={20} fill="#ffd700" color="#ffd700" />
                <span className="rating-value">{property.rating}</span>
                <span className="review-count">({property.reviewCount} reseñas)</span>
              </div>
            </div>
          </div>

          {/* Precio prominente */}
          <div className="price-section">
            <div className="price-main">
              <span className="currency">$</span>
              <span className="amount">{(property.price / 1000000).toFixed(1)}M</span>
              <span className="unit">por noche</span>
            </div>
          </div>

          {/* Características principales */}
          <div className="features-grid">
            <div className="feature-item">
              <Home size={24} />
              <div className="feature-info">
                <span className="feature-label">Tipo</span>
                <span className="feature-value">{property.type}</span>
              </div>
            </div>
            <div className="feature-item">
              <Users size={24} />
              <div className="feature-info">
                <span className="feature-label">Dormitorios</span>
                <span className="feature-value">{property.bedrooms}</span>
              </div>
            </div>
            <div className="feature-item">
              <Droplet size={24} />
              <div className="feature-info">
                <span className="feature-label">Baños</span>
                <span className="feature-value">{property.bathrooms}</span>
              </div>
            </div>
            <div className="feature-item">
              <Maximize2 size={24} />
              <div className="feature-info">
                <span className="feature-label">Tamaño</span>
                <span className="feature-value">{property.sqft} m²</span>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="description-block">
            <h3>Acerca de esta propiedad</h3>
            <p>{property.description}</p>
          </div>

          {/* Amenidades */}
          <div className="amenities-block">
            <h3>Amenidades</h3>
            <div className="amenities-list">
              {property.amenities.map((amenity, idx) => (
                <div key={idx} className="amenity-item">
                  <span className="amenity-check">✓</span>
                  <span className="amenity-name">{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ubicación */}
          <div className="location-block">
            <h3>📍 Ubicación</h3>
            <div className="location-info">
              <p className="location-address">{property.location}</p>
              <p className="location-coords">
                Coordenadas: {property.latitude.toFixed(4)}, {property.longitude.toFixed(4)}
              </p>
              <div className="map-placeholder">
                <p>Ubicación en mapa</p>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>
                  {property.latitude.toFixed(4)} N, {Math.abs(property.longitude).toFixed(4)} O
                </p>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="action-buttons">
            <button className="btn-secondary" onClick={() => navigate('/')}>
              Volver al Home
            </button>
            <button className="btn-primary">
              Reservar Ahora
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PropertyDetailPage;
