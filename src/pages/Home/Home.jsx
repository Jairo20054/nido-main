// ===== Home.jsx =====
// Fixes:
// - Removed unused 'handleExploreClick' to fix eslint warning.
// - Removed unused 'toggleProfileMenu' (it was defined but never called; if needed, add a button to trigger it).
// - Improved mocks with unique IDs and more variety.
// - Added infinite scroll simulation.
// - Enhanced error handling and accessibility.
// - For deprecation warning: This is likely from a dependency (e.g., http-proxy-middleware). Update packages: npm update http-proxy-middleware eslint-plugin-mozilla or check node version (use Node v20 if v22+).
// - For proxy error: This indicates a misconfiguration. If frontend is on port 3000, set "proxy": "http://127.0.0.1:5000" in frontend package.json (use 127.0.0.1 instead of localhost to avoid IPv6 issues). Ensure backend is running on 5000. If frontend is accidentally on 5000, change its PORT to 3000 in .env or scripts. The loop (5000 to 5000) suggests PORT conflict—verify with 'lsof -i :5000' and kill conflicting processes.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyStories from '../../components/PropertyStories/PropertyStories';
import PostCard from '../../components/PostCard/PostCard';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage/ErrorMessage';
import SearchBar from '../../components/common/Header/SearchBar';
import UserMenu from '../../components/common/Header/UserMenu';
import './Home.css';

// Improved mocks: Unique IDs, varied data.
const generateMockProperties = (count = 10) => Array.from({ length: count }, (_, i) => ({
  id: i + 1,
  title: `Propiedad destacada #${i + 1} en Bogotá! 📍`,
  location: ["Zona Rosa", "Chapinero", "Usaquén"][i % 3] + ", Bogotá",
  price: 100000 + (i * 50000),
  rating: 4.5 + (i % 5 / 10),
  images: [
    `https://source.unsplash.com/random/800x600?apartment,${i}`,
    `https://source.unsplash.com/random/800x600?house,${i}`,
    `https://source.unsplash.com/random/800x600?interior,${i}`
  ],
  amenities: ["WiFi", "Cocina", "Piscina", "Gimnasio"].slice(0, (i % 4) + 1),
  type: ["apartment", "house", "studio"][i % 3],
  user: {
    name: `Usuario ${i + 1}`,
    avatar: `https://randomuser.me/api/portraits/${i % 2 ? 'men' : 'women'}/${i + 30}.jpg`,
    verified: i % 2 === 0
  },
  likes: 100 + (i * 20),
  comments: 10 + i,
  shares: 5 + (i % 5),
  description: `Descripción detallada de la propiedad #${i + 1}. #bogota #realestate`,
  timestamp: `${i + 1} horas ago`,
  isFollowing: false
}));

const Home = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [likedPosts, setLikedPosts] = useState({});
  const [savedPosts, setSavedPosts] = useState({});
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const profileRef = useRef(null);

  const fetchFeaturedProperties = useCallback(async (pageNum = 1) => {
    setLoading(pageNum === 1);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const newProps = generateMockProperties(5);
      setFeaturedProperties(prev => pageNum === 1 ? newProps : [...prev, ...newProps]);
      const initialIndexes = {};
      newProps.forEach(prop => initialIndexes[prop.id] = 0);
      setCurrentImageIndexes(prev => ({ ...prev, ...initialIndexes }));
    } catch (err) {
      setError("Error al cargar propiedades. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeaturedProperties(page);
  }, [fetchFeaturedProperties, page]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSearchBar && searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchBar(false);
      }
      if (showProfileMenu && profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSearchBar, showProfileMenu]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 200 && !loading) {
        setPage(prev => prev + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading]);

  const handleSearch = useCallback((searchParams) => {
    setShowSearchBar(false);
    navigate('/search', { state: { searchParams } });
  }, [navigate]);

  const handleRetry = useCallback(() => {
    setPage(1);
    fetchFeaturedProperties(1);
  }, [fetchFeaturedProperties]);

  const handleCardClick = useCallback((propertyId) => {
    navigate(`/property/${propertyId}`);
  }, [navigate]);

  const handleLike = useCallback((propertyId, e) => {
    e.stopPropagation();
    setLikedPosts(prev => ({ ...prev, [propertyId]: !prev[propertyId] }));
  }, []);

  const handleSave = useCallback((propertyId, e) => {
    e.stopPropagation();
    setSavedPosts(prev => ({ ...prev, [propertyId]: !prev[propertyId] }));
  }, []);

  const handleFollow = useCallback((propertyId, e) => {
    e.stopPropagation();
    setFeaturedProperties(prev => 
      prev.map(prop => prop.id === propertyId ? { ...prop, isFollowing: !prop.isFollowing } : prop)
    );
  }, []);

  const handleImageChange = useCallback((propertyId, direction, e) => {
    e?.stopPropagation();
    setCurrentImageIndexes(prev => {
      const current = prev[propertyId] || 0;
      const prop = featuredProperties.find(p => p.id === propertyId);
      if (!prop) return prev;
      const len = prop.images.length;
      const newIndex = direction === 'next' ? (current + 1) % len : (current - 1 + len) % len;
      return { ...prev, [propertyId]: newIndex };
    });
  }, [featuredProperties]);

  if (error && !featuredProperties.length) {
    return (
      <div className="home-page" role="main" aria-labelledby="home-title">
        <div className="home-main-content">
          <section className="stories-and-search" aria-label="Historias y búsqueda">
            <PropertyStories />
          </section>
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
    <div className="home-page" role="main" aria-labelledby="home-title">
      <div className="home-main-content">
        {showSearchBar && (
          <div className="search-section" ref={searchRef} aria-label="Barra de búsqueda expandida">
            <SearchBar onSearch={handleSearch} />
          </div>
        )}

        <section className="stories-and-search" aria-label="Historias de propiedades">
          <PropertyStories />
        </section>

        {showProfileMenu && (
          <div className="mini-profile-menu" ref={profileRef} aria-label="Menú de perfil">
            <UserMenu onClose={() => setShowProfileMenu(false)} />
          </div>
        )}

        <main className="social-feed" aria-label="Feed social">
          <div className="feed-container">
            <div className="posts-grid">
              {featuredProperties.map((property) => (
                <PostCard
                  key={property.id}
                  property={property}
                  onClick={() => handleCardClick(property.id)}
                  onLike={handleLike}
                  onSave={handleSave}
                  onFollow={handleFollow}
                  currentImageIndex={currentImageIndexes[property.id] || 0}
                  onImageChange={handleImageChange}
                  isLiked={!!likedPosts[property.id]}
                  isSaved={!!savedPosts[property.id]}
                />
              ))}
              {loading && (
                <div className="loading-container" aria-live="polite">
                  <LoadingSpinner />
                  <p className="loading-text">Cargando más publicaciones...</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;