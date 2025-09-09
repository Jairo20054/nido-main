import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from './HeroSection';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage/ErrorMessage';
import Footer from '../../components/common/Footer/Footer';
import './Home.css';

const Home = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [likedPosts, setLikedPosts] = useState({});
  const [savedPosts, setSavedPosts] = useState({});
  const navigate = useNavigate();

  // Datos mock para propiedades destacadas
  const mockFeaturedProperties = [
    {
      id: 1,
      title: "Acabo de renovar mi apartamento en Zona Rosa! 📍",
      location: "Zona Rosa, Bogotá",
      price: 150000,
      rating: 4.8,
      images: [
        "https://apartamento-bogota-zona-rosa.bogota-hotels-co.net/data/Photos/OriginalPhoto/1820/182016/182016102.JPEG",
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
      ],
      amenities: ["WiFi", "Cocina", "Accesible"],
      type: "apartment",
      user: {
        name: "Carlos Méndez",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        verified: true
      },
      likes: 245,
      comments: 32,
      shares: 12,
      description: "Después de meses de trabajo, finalmente terminé la renovación de mi apartamento. ¡Estoy encantado con los resultados! Tiene todas las comodidades para una estancia perfecta. #interiordesign #apartamento #bogota",
      timestamp: "2 horas ago",
      isFollowing: false
    },
    {
      id: 2,
      title: "Mi casa familiar ahora disponible para estancias cortas",
      location: "Chapinero, Bogotá",
      price: 280000,
      rating: 4.9,
      images: [
        "https://a0.muscache.com/im/pictures/cacd930a-dd65-4c56-95de-032d4e162ebb.jpg",
        "https://cf.bstatic.com/xdata/images/hotel/max1024x768/540297069.jpg?k=43a388f82614e8438d0bbacba5249fc9e642c73322b2e2da3141580848bd4968&o=&hp=1"
      ],
      amenities: ["WiFi", "Jardín", "Parking", "Accesible"],
      type: "house",
      user: {
        name: "María Rodríguez",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        verified: true
      },
      likes: 312,
      comments: 45,
      shares: 21,
      description: "Debido a que estaré de viaje los próximos meses, decidí abrir mi casa familiar para quienes busquen una estancia cómoda y acogedora en Chapinero. Tiene un jardín precioso y está cerca de todo. #casa #viajes #bogota",
      timestamp: "5 horas ago",
      isFollowing: true
    },
    {
      id: 3,
      title: "Loft con vista panorámica en el centro histórico",
      location: "La Candelaria, Bogotá",
      price: 120000,
      rating: 4.7,
      images: ["https://cf.bstatic.com/xdata/images/hotel/max1024x768/540297069.jpg?k=43a388f82614e8438d0bbacba5249fc9e642c73322b2e2da3141580848bd4968&o=&hp=1"],
      amenities: ["WiFi", "Vista panorámica", "Accesible"],
      type: "loft",
      user: {
        name: "Andrés López",
        avatar: "https://randomuser.me/api/portraits/men/22.jpg",
        verified: false
      },
      likes: 198,
      comments: 28,
      shares: 7,
      description: "Este loft tiene una de las mejores vistas de La Candelaria. Perfecto para artistas, escritores o cualquier persona que busque inspiración. #loft #vista #candelaria",
      timestamp: "1 día ago",
      isFollowing: false
    },
    {
      id: 4,
      title: "Apartamento premium con vista al parque",
      location: "Usaquén, Bogotá",
      price: 180000,
      rating: 4.6,
      images: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGhvdXNlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
      ],
      amenities: ["WiFi", "Piscina", "Gimnasio", "Accesible"],
      type: "apartment",
      user: {
        name: "Laura Sánchez",
        avatar: "https://randomuser.me/api/portraits/women/65.jpg",
        verified: true
      },
      likes: 276,
      comments: 41,
      shares: 15,
      description: "Vista espectacular al parque desde este apartamento completamente equipado. Ideal para quienes buscan comodidad y tranquilidad. #apartamento #usaquen #vista",
      timestamp: "1 día ago",
      isFollowing: false
    },
    {
      id: 5,
      title: "Casa campestre a solo 30 min de Bogotá",
      location: "La Calera, Bogotá",
      price: 350000,
      rating: 4.9,
      images: [
        "https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8GhoustfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
      ],
      amenities: ["WiFi", "Jardín", "Chimenea", "Parking", "Accesible"],
      type: "house",
      user: {
        name: "Roberto Díaz",
        avatar: "https://randomuser.me/api/portraits/men/72.jpg",
        verified: true
      },
      likes: 421,
      comments: 67,
      shares: 34,
      description: "Escápate de la ciudad sin ir demasiado lejos. Esta casa campestre ofrece tranquilidad y naturaleza con todas las comodidades. #campestre #naturaleza #escapada",
      timestamp: "2 días ago",
      isFollowing: true
    },
    {
      id: 6,
      title: "Estudio céntrico para estudiantes o viajeros",
      location: "El Chicó, Bogotá",
      price: 95000,
      rating: 4.5,
      images: [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
        "https://a0.muscache.com/im/pictures/cacd930a-dd65-4c56-95de-032d4e162ebb.jpg"
      ],
      amenities: ["WiFi", "Cocina", "Lavandería", "Accesible"],
      type: "studio",
      user: {
        name: "Camila Vargas",
        avatar: "https://randomuser.me/api/portraits/women/33.jpg",
        verified: false
      },
      likes: 154,
      comments: 19,
      shares: 5,
      description: "Estudio perfecto para estudiantes o viajeros que buscan una ubicación céntrica a un precio accesible. ¡Totalmente equipado! #estudio #económico #chico",
      timestamp: "3 días ago",
      isFollowing: false
    }
  ];

  const fetchFeaturedProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFeaturedProperties(mockFeaturedProperties);
      
      // Inicializar índices de imágenes
      const initialIndexes = {};
      mockFeaturedProperties.forEach(property => {
        initialIndexes[property.id] = 0;
      });
      setCurrentImageIndexes(initialIndexes);
    } catch (err) {
      console.error("Error fetching featured properties:", err);
      setError("No pudimos cargar las propiedades destacadas. Intenta de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeaturedProperties();
  }, [fetchFeaturedProperties]);

  const handleSearch = useCallback((searchParams) => {
    navigate('/search', { state: { searchParams } });
  }, [navigate]);

  const handleRetry = useCallback(() => {
    fetchFeaturedProperties();
  }, [fetchFeaturedProperties]);

  const handleCardClick = useCallback((propertyId) => {
    navigate(`/property/${propertyId}`);
  }, [navigate]);

  const handleLike = useCallback((propertyId, e) => {
    e.stopPropagation();
    setLikedPosts(prev => ({
      ...prev,
      [propertyId]: !prev[propertyId]
    }));
  }, []);

  const handleSave = useCallback((propertyId, e) => {
    e.stopPropagation();
    setSavedPosts(prev => ({
      ...prev,
      [propertyId]: !prev[propertyId]
    }));
  }, []);

  const handleFollow = useCallback((propertyId, e) => {
    e.stopPropagation();
    setFeaturedProperties(prev => 
      prev.map(property => 
        property.id === propertyId 
          ? { ...property, isFollowing: !property.isFollowing } 
          : property
      )
    );
  }, []);

  const handleImageChange = useCallback((propertyId, direction) => {
    setCurrentImageIndexes(prevIndexes => {
      const currentIndex = prevIndexes[propertyId];
      const property = featuredProperties.find(p => p.id === propertyId);
      if (!property) return prevIndexes;
      
      let newIndex;
      if (direction === 'next') {
        newIndex = (currentIndex + 1) % property.images.length;
      } else {
        newIndex = (currentIndex - 1 + property.images.length) % property.images.length;
      }
      
      return {
        ...prevIndexes,
        [propertyId]: newIndex
      };
    });
  }, [featuredProperties]);

  if (error) {
    return (
      <div className="home-page">
        <HeroSection onSearch={handleSearch} />
        <ErrorMessage 
          message={error} 
          onRetry={handleRetry}
          className="home-error"
        />
      </div>
    );
  }

  return (
    <div className="home-page">
      
      <main className="social-feed">
        <div className="feed-container">


          {/* Feed de propiedades */}
          <div className="posts-grid">
            {loading ? (
              <div className="loading-container">
                <LoadingSpinner />
                <p className="loading-text">Cargando publicaciones...</p>
              </div>
            ) : (
              featuredProperties.map((property) => (
                <PostCard 
                  key={property.id} 
                  property={property} 
                  onClick={handleCardClick}
                  onLike={handleLike}
                  onSave={handleSave}
                  onFollow={handleFollow}
                  currentImageIndex={currentImageIndexes[property.id] || 0}
                  onImageChange={handleImageChange}
                  isLiked={likedPosts[property.id]}
                  isSaved={savedPosts[property.id]}
                />
              ))
            )}
          </div>
        </div>
      </main>

      {/* Barra de navegación inferior para móviles */}
      <nav className="bottom-nav">
        <button className="nav-button active">
          <svg aria-label="Inicio" fill="#262626" height="24" viewBox="0 0 48 48" width="24">
            <path d="M45.5 48H30.1c-.8 0-1.5-.7-1.5-1.5V34.2c0-2.6-2.1-4.6-4.6-4.6s-4.6 2.1-4.6 4.6v12.3c0 .8-.7 1.5-1.5 1.5H2.5c-.8 0-1.5-.7-1.5-1.5V23c0-.4.2-.8.4-1.1L22.9.4c.6-.6 1.6-.6 2.1 0l21.5 21.5c.3.3.4.7.4 1.1v23.5c.1.8-.6 1.5-1.4 1.5z"></path>
          </svg>
        </button>
        <button className="nav-button">
          <svg aria-label="Buscar" fill="#262626" height="24" viewBox="0 0 48 48" width="24">
            <path d="M20 40C9 40 0 31 0 20S9 0 20 0s20 9 20 20-9 20-20 20zm0-37C10.6 3 3 10.6 3 20s7.6 17 17 17 17-7.6 17-17S29.4 3 20 3z"></path>
            <path d="M46.6 48.1c-.4 0-.8-.1-1.1-.4L32 34.2c-.6-.6-.6-1.5 0-2.1s1.5-.6 2.1 0l13.5 13.5c.6.6.6 1.5 0 2.1-.3.3-.7.4-1 .4z"></path>
          </svg>
        </button>
        <button className="nav-button">
          <svg aria-label="Explorar" fill="#262626" height="24" viewBox="0 0 48 48" width="24">
            <path d="M47.9 23.9c0-13.3-10.8-24.1-24.1-24.1S-.1 10.6-.1 23.9c0 13.3 10.8 24.1 24.1 24.1 13.3.1 24.1-10.7 24.1-24.1zm-44.2 0c0-11.1 9-20.1 20.1-20.1s20.1 9 20.1 20.1-9 20.1-20.1 20.1-20.1-9-20.1-20.1z"></path>
            <path d="M25.6 32.2l-9.7-5.3c-.4-.2-.6-.6-.6-1.1s.2-.9.6-1.1l9.7-5.3c.4-.2.9-.2 1.3 0 .4.2.6.6.6 1.1v10.5c0 .5-.2.9-.6 1.1-.2.1-.4.2-.7.2s-.5-.1-.6-.2z"></path>
          </svg>
        </button>
        <button className="nav-button">
          <svg aria-label="Reels" fill="#262626" height="24" viewBox="0 0 48 48" width="24">
            <path d="M39.2 12.5H8.8c-1.5 0-2.8 1.2-2.8 2.8v20.3c0 1.5 1.2 2.8 2.8 2.8h30.3c1.5 0 2.8-1.2 2.8-2.8V15.3c.1-1.6-1.2-2.8-2.7-2.8zm-4.2 16.3l-12.7 7.5c-.6.4-1.4-.1-1.4-.8V20.3c0-.7.8-1.2 1.4-.8l12.7 7.5c.6.3.6 1.2 0 1.5z"></path>
          </svg>
        </button>
        <button className="nav-button">
          <svg aria-label="Perfil" fill="#262626" height="24" viewBox="0 0 48 48" width="24">
            <path d="M24 27.3c6.9 0 12.4-5.6 12.4-12.4S30.9 2.5 24 2.5 11.6 8.1 11.6 14.9s5.6 12.4 12.4 12.4zm0-21.9c5.2 0 9.5 4.2 9.5 9.5s-4.2 9.5-9.5 9.5-9.5-4.2-9.5-9.5 4.3-9.5 9.5-9.5zM42.9 45.5H5.1c-1.5 0-2.8-1.2-2.8-2.8 0-8.6 7-15.6 15.6-15.6h13.1c8.6 0 15.6 7 15.6 15.6 0 1.6-1.2 2.8-2.7 2.8zM17.9 30.2c-6.9 0-12.5 5.6-12.5 12.5 0 .2.2.4.4.4h37.3c.2 0 .4-.2.4-.4.1-6.9-5.5-12.5-12.4-12.5H17.9z"></path>
          </svg>
        </button>
      </nav>
      
      <Footer />
    </div>
  );
};

// Componente PostCard con diseño de red social
const PostCard = ({ 
  property, 
  onClick, 
  onLike, 
  onSave, 
  onFollow,
  currentImageIndex,
  onImageChange,
  isLiked,
  isSaved
}) => {
  const hasMultipleImages = property.images.length > 1;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="post-card">
      {/* Header del post */}
      <div className="post-header">
        <div className="user-info">
          <img src={property.user.avatar} alt={property.user.name} className="user-avatar" />
          <div className="user-details">
            <span className="username">{property.user.name}</span>
            <span className="location">{property.location}</span>
          </div>
        </div>
        {property.user.verified && <span className="verified-badge">✓</span>}
        <button className="options-button">⋯</button>
      </div>

      {/* Carrusel de imágenes */}
      <div className="post-image">
        <img 
          src={property.images[currentImageIndex]} 
          alt={`${property.title} - Imagen ${currentImageIndex + 1}`} 
        />
        {hasMultipleImages && (
          <>
            <button 
              className="carousel-button prev" 
              onClick={(e) => {
                e.stopPropagation();
                onImageChange(property.id, 'prev');
              }}
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </button>
            <button 
              className="carousel-button next" 
              onClick={(e) => {
                e.stopPropagation();
                onImageChange(property.id, 'next');
              }}
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </button>
            <div className="carousel-dots">
              {property.images.map((_, index) => (
                <span 
                  key={index} 
                  className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Acciones del post */}
      <div className="post-actions">
        <div className="action-buttons">
          <button 
            className={`action-button ${isLiked ? 'liked' : ''}`}
            onClick={(e) => onLike(property.id, e)}
          >
            <svg aria-label="Me gusta" height="24" viewBox="0 0 48 48" width="24">
              <path d="M34.6 6.1c5.7 0 10.4 5.2 10.4 11.5 0 6.8-5.9 11-11.5 16S25 41.3 24 41.9c-1.1-.7-4.7-4-9.5-8.3-5.7-5-11.5-9.2-11.5-16C3 11.3 7.7 6.1 13.4 6.1c4.2 0 6.5 2 8.1 4.3 1.9 2.6 2.2 3.9 2.5 3.9.3 0 .6-1.3 2.5-3.9 1.6-2.3 3.9-4.3 8.1-4.3z" 
                fill={isLiked ? "#ed4956" : "none"} 
                stroke={isLiked ? "none" : "#262626"} 
                strokeWidth="2"
              />
            </svg>
          </button>
          <button className="action-button">
            <svg aria-label="Comentar" fill="#262626" height="24" viewBox="0 0 48 48" width="24">
              <path clipRule="evenodd" d="M47.5 46.1l-2.8-11c1.8-3.3 2.8-7.1 2.8-11.1C47.5 11 37 .5 24 .5S.5 11 .5 24 11 47.5 24 47.5c4 0 7.8-1 11.1-2.8l11 2.8c.8.2 1.6-.6 1.4-1.4zm-3-22.1c0 4-1 7-2.6 10-.2.4-.3.9-.2 1.4l2.1 8.4-8.3-2.1c-.5-.1-1-.1-1.4.2-1.8 1-5.2 2.6-10 2.6-11.4 0-20.6-9.2-20.6-20.5S12.7 3.5 24 3.5 44.5 12.7 44.5 24z" fillRule="evenodd"></path>
            </svg>
          </button>
          <button className="action-button">
            <svg aria-label="Compartir" fill="#262626" height="24" viewBox="0 0 48 48" width="24">
              <path d="M47.8 3.8c-.3-.5-.8-.8-1.3-.8h-45C.9 3.1.3 3.5.1 4S0 5.2.4 5.7l15.9 15.6 5.5 22.6c.1.6.6 1 1.2 1.1h.2c.5 0 1-.3 1.3-.7l23.2-39c.4-.4.4-1 .1-1.5zM5.2 6.1h35.5L18 18.7 5.2 6.1zm18.7 33.6l-4.4-18.4L42.4 8.6 23.9 39.7z"></path>
            </svg>
          </button>
        </div>
        <button 
          className={`save-button ${isSaved ? 'saved' : ''}`}
          onClick={(e) => onSave(property.id, e)}
        >
          <svg aria-label="Guardar" height="24" viewBox="0 0 48 48" width="24">
            <path d="M43.5 48c-.4 0-.8-.2-1.1-.4L24 29 5.6 47.6c-.4.4-1.1.6-1.6.3-.6-.2-1-.8-1-1.4v-45C3 .7 3.7 0 4.5 0h39c.8 0 1.5.7 1.5 1.5v45c0 .6-.4 1.2-.9 1.4-.2.1-.4.1-.6.1zM24 26c.8 0 1.6.3 2.2.9l15.8 16V3H6v39.9l15.8-16c.6-.6 1.4-.9 2.2-.9z" 
              fill={isSaved ? "#262626" : "none"} 
              stroke={isSaved ? "none" : "#262626"} 
              strokeWidth="2"
            />
          </svg>
        </button>
      </div>

      {/* Estadísticas del post */}
      <div className="post-stats">
        <span className="likes-count">{property.likes + (isLiked ? 1 : 0)} me gusta</span>
        <div className="post-caption">
          <span className="username">{property.user.name}</span>
          <span className="caption">{property.description}</span>
        </div>
        <button className="view-comments">Ver los {property.comments} comentarios</button>
        <div className="price-tag">
          <span className="price">{formatPrice(property.price)}</span>
          <span className="night">/noche</span>
        </div>
        <span className="post-time">{property.timestamp}</span>
      </div>

      {/* Añadir comentario */}
      <div className="add-comment">
        <input type="text" placeholder="Añade un comentario..." />
        <button className="post-comment-button">Publicar</button>
      </div>
    </div>
  );
};

export default Home;
