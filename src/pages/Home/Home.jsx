// src/pages/Home/Home.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar';
import PropertyStories from '../../components/PropertyStories/PropertyStories';
import PostCard from '../../components/PostCard/PostCard';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage/ErrorMessage';
import './Home.css';

const Home = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [likedPosts, setLikedPosts] = useState({});
  const [savedPosts, setSavedPosts] = useState({});
  const [showSearchBar, setShowSearchBar] = useState(false);
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
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXBhrtmentfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
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
      id: 1,
      title: "Acabo de renovar mi apartamento en Zona Rosa! 📍",
      location: "Zona Rosa, Bogotá",
      price: 150000,
      rating: 4.8,
      images: [
        "https://apartamento-bogota-zona-rosa.bogota-hotels-co.net/data/Photos/OriginalPhoto/1820/182016/182016102.JPEG",
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXBhrtmentfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
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

    // ... más propiedades (igual que en tu código original)
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

  const handleExploreClick = useCallback(() => {
    setShowSearchBar(true);
  }, []);

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
        <LeftSidebar />
        <div className="home-main-content">
          <div className="stories-and-search">
            <PropertyStories />
          </div>
          <ErrorMessage 
            message={error} 
            onRetry={handleRetry}
            className="home-error"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <LeftSidebar onExploreClick={handleExploreClick} />
      
      <div className="home-main-content">
        {showSearchBar ? (
          <SearchBar onSearch={(params) => {
            setShowSearchBar(false);
            handleSearch(params);
          }} />
        ) : (
          <>
            <div className="stories-and-search">
              <PropertyStories />
            </div>

            <main className="social-feed">
              <div className="feed-container">
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
          </>
        )}
      </div>
      
    </div>
  );
};

export default Home;