import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, Share2, Heart, Users, Bed, Bath, Wifi, Tv, AirVent, Wind, Lightbulb, Shield } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Zoom } from 'swiper/modules';
import { DateRange } from 'react-date-range';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import { api } from '../../utils/api';
import styles from './PropertyDetailPremium.module.css';

// Amenities mapping con iconos
const amenitiesMap = {
  wifi: { icon: Wifi, label: 'WiFi', color: '#3b82f6' },
  tv: { icon: Tv, label: 'Televisión', color: '#8b5cf6' },
  air_conditioning: { icon: AirVent, label: 'Aire Acondicionado', color: '#06b6d4' },
  heating: { icon: Wind, label: 'Calefacción', color: '#f59e0b' },
  kitchen: { icon: Lightbulb, label: 'Cocina Completa', color: '#ec4899' },
  safety: { icon: Shield, label: 'Sistema de Seguridad', color: '#10b981' }
};

const PropertyDetailPremium = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDates, setSelectedDates] = useState({
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    key: 'selection'
  });
  const [reviewsPage, setReviewsPage] = useState(1);
  const [allReviews, setAllReviews] = useState([]);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Cargar propiedad
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/properties/${id}`);
        setProperty(response.data.data || response.data);
        
        // Generar reseñas mock (en producción, vendrían del API)
        generateMockReviews(6);
      } catch (err) {
        console.error('Error fetching property:', err);
        setError('No pudimos cargar la propiedad. Intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  // Generar reseñas mock
  const generateMockReviews = (count) => {
    const reviews = [];
    const names = ['María G.', 'Juan C.', 'Ana M.', 'Carlos R.', 'Sofia L.', 'Diego T.', 'Elena P.', 'Marco S.'];
    const comments = [
      'Excelente propiedad, muy limpia y bien ubicada.',
      'La vista es espectacular, volvería sin dudarlo.',
      'Muy cómodo, el host es muy atento y responsive.',
      'La ubicación es perfecta, acceso fácil a todo.',
      'Superó mis expectativas, todo muy moderno.',
      'Lugar tranquilo y acogedor, perfectas vacaciones.'
    ];

    for (let i = 0; i < count; i++) {
      reviews.push({
        id: i + 1,
        author: names[Math.floor(Math.random() * names.length)],
        rating: 4 + Math.random(),
        comment: comments[Math.floor(Math.random() * comments.length)],
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES'),
        verified: Math.random() > 0.3
      });
    }

    setAllReviews(reviews);
  };

  // Manejar compartir
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.title || 'Propiedad',
        text: `Mira esta propiedad: ${property?.title}`,
        url: window.location.href
      });
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !property) {
    return (
      <ErrorState 
        title="Propiedad no encontrada"
        message={error || 'No pudimos cargar esta propiedad'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const images = property.images || [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop'
  ];

  const reviews = allReviews.slice(0, showAllReviews ? allReviews.length : 3);

  return (
    <div className={styles.propertyDetail}>
      {/* Header con acciones */}
      <div className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>← Volver</button>
        <div className={styles.actions}>
          <button 
            onClick={handleShare}
            className={styles.actionButton}
            title="Compartir"
          >
            <Share2 size={20} />
          </button>
          <button 
            onClick={() => setIsFavorite(!isFavorite)}
            className={`${styles.actionButton} ${isFavorite ? styles.favorited : ''}`}
            title="Añadir a favoritos"
          >
            <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Galería con Swiper */}
      <section className={styles.gallery}>
        <Swiper
          modules={[Navigation, Pagination, Zoom]}
          navigation
          pagination={{ clickable: true }}
          zoom
          className={styles.swiper}
        >
          {images.map((image, idx) => (
            <SwiperSlide key={idx}>
              <div className={styles.swiperZoom}>
                <img 
                  src={image} 
                  alt={`${property.title} - Imagen ${idx + 1}`}
                  className={styles.image}
                  loading="lazy"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Miniaturas */}
        <div className={styles.thumbnails}>
          {images.slice(0, 5).map((image, idx) => (
            <button
              key={idx}
              className={`${styles.thumbnail} ${idx === currentImageIndex ? styles.active : ''}`}
              onClick={() => setCurrentImageIndex(idx)}
            >
              <img src={image} alt={`Miniatura ${idx + 1}`} />
              {idx === 4 && images.length > 5 && (
                <div className={styles.thumbnailOverlay}>
                  +{images.length - 5}
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Contenido principal */}
      <div className={styles.mainContent}>
        {/* Izquierda: Información */}
        <div className={styles.left}>
          {/* Encabezado */}
          <section className={styles.header_info}>
            <h1 className={styles.title}>{property.title}</h1>
            <div className={styles.rating}>
              <Star size={18} fill="#fbbf24" color="#fbbf24" />
              <span className={styles.ratingValue}>{(property.rating || 4.8).toFixed(1)}</span>
              <span className={styles.reviews}>({property.reviewCount || 45} reseñas)</span>
            </div>
            <div className={styles.location}>
              <MapPin size={18} />
              <span>{property.location || 'Ubicación'}</span>
            </div>
          </section>

          {/* Host Info */}
          <section className={styles.hostSection}>
            <div className={styles.hostCard}>
              <div className={styles.hostImage}>
                <img 
                  src={property.hostImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=host'}
                  alt={property.hostName || 'Host'}
                  className={styles.avatar}
                />
              </div>
              <div className={styles.hostInfo}>
                <div className={styles.hostHeader}>
                  <div>
                    <h3 className={styles.hostName}>{property.hostName || 'Host Verificado'}</h3>
                    <p className={styles.hostJoinDate}>Se unió {property.hostJoinDate || 'hace 3 años'}</p>
                  </div>
                  {property.superhost && (
                    <div className={styles.superhostBadge}>
                      ⭐ Superhost
                    </div>
                  )}
                </div>
                <p className={styles.hostReviews}>
                  {property.hostReviews || 156} reseñas • {(property.hostResponseRate || 98)}% de respuesta
                </p>
              </div>
            </div>
            <button className={styles.contactButton}>
              Contactar al anfitrión
            </button>
          </section>

          {/* Descripción */}
          {property.description && (
            <section className={styles.description}>
              <h2>Acerca de este lugar</h2>
              <p>{property.description}</p>
            </section>
          )}

          {/* Características principales */}
          <section className={styles.features}>
            <div className={styles.featureGrid}>
              <div className={styles.feature}>
                <Bed size={24} />
                <div>
                  <p className={styles.featureLabel}>Dormitorios</p>
                  <p className={styles.featureValue}>{property.bedrooms || 2}</p>
                </div>
              </div>
              <div className={styles.feature}>
                <Bath size={24} />
                <div>
                  <p className={styles.featureLabel}>Baños</p>
                  <p className={styles.featureValue}>{property.bathrooms || 1}</p>
                </div>
              </div>
              <div className={styles.feature}>
                <Users size={24} />
                <div>
                  <p className={styles.featureLabel}>Huéspedes</p>
                  <p className={styles.featureValue}>{property.maxGuests || 4}</p>
                </div>
              </div>
              <div className={styles.feature}>
                <Lightbulb size={24} />
                <div>
                  <p className={styles.featureLabel}>Tamaño</p>
                  <p className={styles.featureValue}>{property.sqft || 85}m²</p>
                </div>
              </div>
            </div>
          </section>

          {/* Amenidades */}
          <section className={styles.amenities}>
            <h2>¿Qué ofrece este lugar?</h2>
            <div className={styles.amenitiesGrid}>
              {(property.amenities || ['wifi', 'tv', 'air_conditioning', 'heating', 'kitchen', 'safety']).map((amenity, idx) => {
                const amenityData = amenitiesMap[amenity] || { icon: Lightbulb, label: amenity };
                const IconComponent = amenityData.icon;
                return (
                  <div key={idx} className={styles.amenityItem}>
                    <IconComponent size={24} color={amenityData.color} />
                    <span>{amenityData.label}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Ubicación en mapa */}
          <section className={styles.location_section}>
            <h2>¿Dónde está?</h2>
            <div className={styles.mapContainer}>
              <iframe
                src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.769028527948!2d-75.56${property.lat || 52}!3d4.72${property.lng || 0}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e5a7f0000000000%3A0x0000000000000000!2s${encodeURIComponent(property.location || 'Medellin')}!5e0!3m2!1sen!2sco!4v0000000000000`}
                width="100%"
                height="400"
                style={{ border: 0, borderRadius: '12px' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </section>

          {/* Reseñas */}
          <section className={styles.reviews}>
            <h2>Reseñas de huéspedes</h2>
            <div className={styles.reviewsList}>
              {reviews.map(review => (
                <div key={review.id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <div>
                      <p className={styles.reviewAuthor}>{review.author}</p>
                      <p className={styles.reviewDate}>{review.date}</p>
                    </div>
                    <div className={styles.reviewRating}>
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i}
                          size={16}
                          fill={i < Math.round(review.rating) ? '#fbbf24' : '#e5e7eb'}
                          color={i < Math.round(review.rating) ? '#fbbf24' : '#e5e7eb'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className={styles.reviewText}>{review.comment}</p>
                  {review.verified && <span className={styles.verifiedBadge}>✓ Verificado</span>}
                </div>
              ))}
            </div>
            
            {allReviews.length > 3 && !showAllReviews && (
              <button 
                onClick={() => setShowAllReviews(true)}
                className={styles.showMoreButton}
              >
                Ver todas las reseñas ({allReviews.length})
              </button>
            )}
          </section>
        </div>

        {/* Derecha: Widget de reserva */}
        <aside className={styles.right}>
          <div className={styles.bookingWidget}>
            <div className={styles.priceHeader}>
              <div className={styles.price}>
                <span className={styles.amount}>${(property.price || 1800000).toLocaleString()}</span>
                <span className={styles.period}>/noche</span>
              </div>
            </div>

            {/* Selector de fechas */}
            <div className={styles.dateSelector}>
              <button 
                className={styles.dateButton}
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                📅 {selectedDates.startDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} - {selectedDates.endDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
              </button>

              {showDatePicker && (
                <div className={styles.datePicker}>
                  <DateRange
                    ranges={[selectedDates]}
                    onChange={(item) => setSelectedDates(item.selection)}
                    minDate={new Date()}
                    months={1}
                    direction="vertical"
                  />
                </div>
              )}
            </div>

            {/* Botón de reserva */}
            <button className={styles.bookButton}>
              Reservar
            </button>

            {/* Detalles de precio */}
            <div className={styles.priceBreakdown}>
              <div className={styles.priceRow}>
                <span>${(property.price || 1800000).toLocaleString()} × 7 noches</span>
                <span>${((property.price || 1800000) * 7).toLocaleString()}</span>
              </div>
              <div className={styles.priceRow}>
                <span>Tarifa de servicio</span>
                <span>${Math.round((property.price || 1800000) * 7 * 0.15).toLocaleString()}</span>
              </div>
              <div className={styles.priceTotal}>
                <span>Total</span>
                <span>${Math.round((property.price || 1800000) * 7 * 1.15).toLocaleString()}</span>
              </div>
            </div>

            {/* Política de cancelación */}
            <p className={styles.cancellationPolicy}>
              Cancelación gratuita antes de la fecha de entrada
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PropertyDetailPremium;
