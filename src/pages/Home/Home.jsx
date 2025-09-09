import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from './HeroSection';
import CategorySection from './CategorySection';
import PropertyGrid from '../../components/property/PropertyGrid/PropertyGrid';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage/ErrorMessage';
import Footer from '../../components/common/Footer/Footer';
import './Home.css';

const Home = () => {
  const [featuredProperties, setFeaturedProperties] = useState([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Datos mock para propiedades destacadas
  const mockFeaturedProperties = [
    {
      id: 1,
      title: "Apartamento Moderno en Zona Rosa",
      location: "Zona Rosa, Bogotá",
      price: 150000,
      rating: 4.8,
      images: ["https://apartamento-bogota-zona-rosa.bogota-hotels-co.net/data/Photos/OriginalPhoto/1820/182016/182016102.JPEG"],
      amenities: ["WiFi", "Cocina", "Accesible"],
      type: "apartment",
      user: {
        name: "Carlos Méndez",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        verified: true
      },
      likes: 245,
      comments: 32,
      shares: 12
    },
    {
      id: 2,
      title: "Casa Familiar en Chapinero",
      location: "Chapinero, Bogotá",
      price: 280000,
      rating: 4.9,
      images: ["https://a0.muscache.com/im/pictures/cacd930a-dd65-4c56-95de-032d4e162ebb.jpg"],
      amenities: ["WiFi", "Jardín", "Parking", "Accesible"],
      type: "house",
      user: {
        name: "María Rodríguez",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        verified: true
      },
      likes: 312,
      comments: 45,
      shares: 21
    },
    {
      id: 3,
      title: "Loft Contemporáneo La Candelaria",
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
      shares: 7
    },
    {
      id: 4,
      title: "Apartamento con Vista al Parque",
      location: "Usaquén, Bogotá",
      price: 180000,
      rating: 4.6,
      images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"],
      amenities: ["WiFi", "Piscina", "Gimnasio", "Accesible"],
      type: "apartment",
      user: {
        name: "Laura Sánchez",
        avatar: "https://randomuser.me/api/portraits/women/65.jpg",
        verified: true
      },
      likes: 276,
      comments: 41,
      shares: 15
    },
    {
      id: 5,
      title: "Casa Campestre en las Afueras",
      location: "La Calera, Bogotá",
      price: 350000,
      rating: 4.9,
      images: ["https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGhvdXNlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"],
      amenities: ["WiFi", "Jardín", "Chimenea", "Parking", "Accesible"],
      type: "house",
      user: {
        name: "Roberto Díaz",
        avatar: "https://randomuser.me/api/portraits/men/72.jpg",
        verified: true
      },
      likes: 421,
      comments: 67,
      shares: 34
    },
    {
      id: 6,
      title: "Estudio en El Chicó",
      location: "El Chicó, Bogotá",
      price: 95000,
      rating: 4.5,
      images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"],
      amenities: ["WiFi", "Cocina", "Lavandería", "Accesible"],
      type: "studio",
      user: {
        name: "Camila Vargas",
        avatar: "https://randomuser.me/api/portraits/women/33.jpg",
        verified: false
      },
      likes: 154,
      comments: 19,
      shares: 5
    }
  ];

  const fetchFeaturedProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFeaturedProperties(mockFeaturedProperties);
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

  // Función para manejar búsquedas
  const handleSearch = useCallback((searchParams) => {
    navigate('/search', { 
      state: { searchParams }  // Pasamos parámetros como estado de navegación
    });
  }, [navigate]);

  const handleRetry = useCallback(() => {
    fetchFeaturedProperties();
  }, [fetchFeaturedProperties]);

  // Nueva función para manejar click en card
  const handleCardClick = useCallback((property) => {
    navigate(`/property/${property.id}`);
  }, [navigate]);

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
      <HeroSection onSearch={handleSearch} />
      
      <main className="social-feed">
        <div className="feed-container">
          {/* Historias destacadas */}
          <div className="stories-section">
            <h2 className="stories-title">Historias destacadas</h2>
            <div className="stories-list">
              {mockFeaturedProperties.slice(0, 6).map((property) => (
                <div key={property.id} className="story">
                  <div className="story-avatar">
                    <img src={property.user.avatar} alt={property.user.name} />
                  </div>
                  <span className="story-username">{property.user.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Feed de propiedades */}
          <div className="posts-grid">
            {loading ? (
              <div className="loading-container">
                <LoadingSpinner />
                <p className="loading-text">Cargando propiedades...</p>
              </div>
            ) : (
              featuredProperties.map((property) => (
                <div key={property.id} className="post-card">
                  {/* Header del post con información del usuario */}
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

                  {/* Imagen de la propiedad */}
                  <div className="post-image" onClick={() => handleCardClick(property)}>
                    <img src={property.images[0]} alt={property.title} />
                    <button className="like-button">
                      <svg aria-label="Me gusta" fill="#ffffff" height="24" viewBox="0 0 48 48" width="24">
                        <path d="M34.6 6.1c5.7 0 10.4 5.2 10.4 11.5 0 6.8-5.9 11-11.5 16S25 41.3 24 41.9c-1.1-.7-4.7-4-9.5-8.3-5.7-5-11.5-9.2-11.5-16C3 11.3 7.7 6.1 13.4 6.1c4.2 0 6.5 2 8.1 4.3 1.9 2.6 2.2 3.9 2.5 3.9.3 0 .6-1.3 2.5-3.9 1.6-2.3 3.9-4.3 8.1-4.3z"></path>
                      </svg>
                    </button>
                  </div>

                  {/* Acciones y estadísticas */}
                  <div className="post-actions">
                    <div className="action-buttons">
                      <button className="action-button">
                        <svg aria-label="Me gusta" fill="#262626" height="24" viewBox="0 0 48 48" width="24">
                          <path d="M34.6 6.1c5.7 0 10.4 5.2 10.4 11.5 0 6.8-5.9 11-11.5 16S25 41.3 24 41.9c-1.1-.7-4.7-4-9.5-8.3-5.7-5-11.5-9.2-11.5-16C3 11.3 7.7 6.1 13.4 6.1c4.2 0 6.5 2 8.1 4.3 1.9 2.6 2.2 3.9 2.5 3.9.3 0 .6-1.3 2.5-3.9 1.6-2.3 3.9-4.3 8.1-4.3z"></path>
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
                    <button className="save-button">
                      <svg aria-label="Guardar" fill="#262626" height="24" viewBox="0 0 48 48" width="24">
                        <path d="M43.5 48c-.4 0-.8-.2-1.1-.4L24 29 5.6 47.6c-.4.4-1.1.6-1.6.3-.6-.2-1-.8-1-1.4v-45C3 .7 3.7 0 4.5 0h39c.8 0 1.5.7 1.5 1.5v45c0 .6-.4 1.2-.9 1.4-.2.1-.4.1-.6.1zM24 26c.8 0 1.6.3 2.2.9l15.8 16V3H6v39.9l15.8-16c.6-.6 1.4-.9 2.2-.9z"></path>
                      </svg>
                    </button>
                  </div>

                  <div className="post-stats">
                    <span className="likes-count">{property.likes} me gusta</span>
                    <div className="post-caption">
                      <span className="username">{property.user.name}</span>
                      <span className="caption">{property.title}</span>
                    </div>
                    <button className="view-comments">Ver los {property.comments} comentarios</button>
                    <span className="post-time">Hace 2 horas</span>
                  </div>

                  {/* Comentar */}
                  <div className="add-comment">
                    <input type="text" placeholder="Añade un comentario..." />
                    <button className="post-comment-button">Publicar</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar (solo en desktop) */}
        <aside className="sidebar">
          <div className="sidebar-profile">
            <img src="https://randomuser.me/api/portraits/men/41.jpg" alt="Perfil" className="profile-avatar" />
            <div className="profile-info">
              <span className="profile-username">tu_usuario</span>
              <span className="profile-name">Tu Nombre</span>
            </div>
            <button className="switch-button">Cambiar</button>
          </div>

          <div className="suggestions-section">
            <div className="suggestions-header">
              <span>Sugerencias para ti</span>
              <button>Ver todo</button>
            </div>
            
            {mockFeaturedProperties.slice(0, 5).map((property) => (
              <div key={`suggestion-${property.id}`} className="suggestion">
                <div className="suggestion-user">
                  <img src={property.user.avatar} alt={property.user.name} />
                  <div className="suggestion-info">
                    <span className="suggestion-username">{property.user.name.split(' ')[0].toLowerCase()}</span>
                    <span className="suggestion-detail">Te sigue</span>
                  </div>
                </div>
                <button className="follow-button">Seguir</button>
              </div>
            ))}
          </div>

          <div className="sidebar-footer">
            <div className="footer-links">
              <a href="#">Información</a> • <a href="#">Ayuda</a> • <a href="#">Prensa</a> • <a href="#">API</a> • <a href="#">Empleo</a> • <a href="#">Privacidad</a> • <a href="#">Condiciones</a> • <a href="#">Ubicaciones</a> • <a href="#">Idioma</a> • <a href="#">Meta Verified</a>
            </div>
            <div className="copyright">© 2023 HOUSEPLA</div>
          </div>
        </aside>
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

export default Home;