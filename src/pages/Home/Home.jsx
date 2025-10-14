<<<<<<< HEAD
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PostCardEnhanced from '../../components/PostCard/PostCardEnhanced';
import StoriesBar from '../../components/Stories/StoriesBar';
import ReelsViewer from '../../components/social/ReelsViewer';
import BottomNav from '../../components/social/BottomNav';
import Composer from '../../components/social/Composer';
import { mockPosts, mockStories, mockReels } from '../../utils/socialMocks';
import './Home.css';
=======
// src/pages/Home/Home.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../../components/common/Header/Header';
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar';
import RightSidebar from '../../components/RightSidebar/RightSidebar';
import PostCard from '../../components/PostCard/PostCard';
import StoriesBar from '../../components/Stories/StoriesBar';
import CreatePost from '../../components/CreatePost/CreatePost';
import { api } from '../../services/api';
import './Home.css';

// Transformar datos de API a formato de componente
const transformPropertyData = (property) => ({
  id: property._id || property.id,
  user: {
    name: property.host?.name || 'Anónimo',
    avatar: property.host?.avatar || '/api/placeholder/40/40',
    verified: property.host?.verified || false
  },
  title: property.title,
  location: property.city || property.location,
  price: property.price,
  images: property.images || ['/api/placeholder/500/400'],
  description: property.description,
  specs: {
    rooms: property.bedrooms || property.rooms || 0,
    bathrooms: property.bathrooms || 0,
    area: property.area || 0,
    parking: property.parking || false
  },
  likes: property.likes || 0,
  comments: property.comments || 0,
  isLiked: false,
  isSaved: false,
  isFollowing: false,
  timestamp: property.createdAt ? new Date(property.createdAt).toLocaleString('es-CO') : 'Reciente'
});

const mockStories = [
  { id: 1, user: 'Tu historia', avatar: '/api/placeholder/60/60', isCreate: true },
  { id: 2, user: 'Ana Gómez', avatar: '/api/placeholder/60/60', hasNew: true },
  { id: 3, user: 'Luxury Homes', avatar: '/api/placeholder/60/60', hasNew: false },
  { id: 4, user: 'Miguel Torres', avatar: '/api/placeholder/60/60', hasNew: true },
  { id: 5, user: 'City Apartments', avatar: '/api/placeholder/60/60', hasNew: false }
];
>>>>>>> 7d6191872e2e6da6771f24bf058649816f527586

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [currentImageIndices, setCurrentImageIndices] = useState({});
<<<<<<< HEAD
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [likedReels, setLikedReels] = useState({});
  const [savedReels, setSavedReels] = useState({});
=======
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    rooms: '',
    location: ''
  });
  const [showFilters, setShowFilters] = useState(false);
>>>>>>> 7d6191872e2e6da6771f24bf058649816f527586

  // Cargar datos iniciales desde API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/properties', {
          page: 1,
          limit: 20
        });

        if (response.success) {
          const transformedPosts = response.data.map(transformPropertyData);
          setPosts(transformedPosts);
        }
      } catch (error) {
        console.error('Error cargando propiedades:', error);
        // Fallback a datos mock si falla la API
        const mockProperties = [
          {
            id: 1,
            user: {
              name: 'Carlos Rodríguez',
              avatar: '/api/placeholder/40/40',
              verified: true
            },
            title: 'Apartamento Amoblado en El Poblado',
            location: 'Medellín, Antioquia',
            price: 1800000,
            images: ['/api/placeholder/500/400', '/api/placeholder/500/400', '/api/placeholder/500/400'],
            description: 'Hermoso apartamento en conjunto cerrado con amenities. 3 habitaciones, 2 baños, parqueadero privado.',
            specs: { rooms: 3, bathrooms: 2, area: 85, parking: true },
            likes: 24, comments: 8, isLiked: false, isSaved: false, isFollowing: false,
            timestamp: 'Hace 2 horas'
          },
          {
            id: 2,
            user: {
              name: 'Inmobiliaria Premium',
              avatar: '/api/placeholder/40/40',
              verified: true
            },
            title: 'Casa Campestre con Piscina',
            location: 'Rionegro, Antioquia',
            price: 3200000,
            images: ['/api/placeholder/500/400', '/api/placeholder/500/400'],
            description: 'Casa campestre ideal para familia. 4 habitaciones, 3 baños, jardín amplio, piscina.',
            specs: { rooms: 4, bathrooms: 3, area: 180, parking: true },
            likes: 42, comments: 15, isLiked: true, isSaved: true, isFollowing: true,
            timestamp: 'Hace 5 horas'
          }
        ];
        setPosts(mockProperties);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);



  const handleImageChange = (postId, direction) => {
    setCurrentImageIndices(prev => {
      const currentIndex = prev[postId] || 0;
      const post = posts.find(p => p.id === postId);
      if (!post) return prev;
      
      const imagesCount = post.images.length;
      let newIndex = currentIndex;
      
      if (direction === 'next') {
        newIndex = (currentIndex + 1) % imagesCount;
      } else if (direction === 'prev') {
        newIndex = (currentIndex - 1 + imagesCount) % imagesCount;
      }
      
      return { ...prev, [postId]: newIndex };
    });
  };

  const handleLike = (postId) => {
<<<<<<< HEAD
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 } : post
      )
    );
  };

  const handleSave = (postId) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, isSaved: !post.isSaved } : post
      )
    );
=======
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked, 
            likes: post.isLiked ? post.likes - 1 : post.likes + 1 
          }
        : post
    ));
  };

  const handleSave = (postId) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isSaved: !post.isSaved }
        : post
    ));
>>>>>>> 7d6191872e2e6da6771f24bf058649816f527586
  };

  const handleFollow = (postId) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isFollowing: !post.isFollowing }
        : post
    ));
  };

  // Filtrar posts basado en búsqueda y filtros
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = !searchQuery ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLocation = !filters.location ||
        post.location.toLowerCase().includes(filters.location.toLowerCase());

      const matchesMinPrice = !filters.minPrice || post.price >= parseInt(filters.minPrice);
      const matchesMaxPrice = !filters.maxPrice || post.price <= parseInt(filters.maxPrice);
      const matchesRooms = !filters.rooms || post.specs.rooms >= parseInt(filters.rooms);

      return matchesSearch && matchesLocation && matchesMinPrice && matchesMaxPrice && matchesRooms;
    });
  }, [posts, searchQuery, filters]);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const searchParams = {
        page: 1,
        limit: 20,
        ...(searchQuery && { location: searchQuery }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.location && { location: filters.location })
      };

      const response = await api.get('/properties', searchParams);

      if (response.success) {
        const transformedPosts = response.data.map(transformPropertyData);
        setPosts(transformedPosts);
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (newPost) => {
    try {
      const response = await api.post('/properties', newPost);
      if (response.success) {
        const newProperty = transformPropertyData(response.data);
        setPosts(prev => [newProperty, ...prev]);
        setIsCreatePostOpen(false);
      }
    } catch (error) {
      console.error('Error creando propiedad:', error);
    }
  };

  const handleReelLike = (reelId) => {
    setLikedReels(prev => ({ ...prev, [reelId]: !prev[reelId] }));
  };

  const handleReelComment = (reelId) => {
    // Aquí iría la lógica para abrir modal de comentarios
    console.log('Abrir comentarios para reel:', reelId);
  };

  const handleReelShare = (reelId) => {
    // Aquí iría la lógica para compartir
    console.log('Compartir reel:', reelId);
  };

  const handleReelSave = (reelId) => {
    setSavedReels(prev => ({ ...prev, [reelId]: !prev[reelId] }));
  };

  return (
<<<<<<< HEAD
    <motion.div
      className="home-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Stories Section */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <StoriesBar stories={mockStories} />
      </motion.div>

     

      {/* Feed Section */}
      <main className="feed-container">
        <AnimatePresence>
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <PostCardEnhanced
                property={post}
                currentImageIndex={currentImageIndices[post.id] || 0}
                onImageChange={handleImageChange}
                onLike={handleLike}
                onSave={handleSave}
                onFollow={handleFollow}
              />
            </motion.div>
          ))}
        </AnimatePresence>

         {/* Sección de Reels - Carrusel horizontal como Facebook */}
      <motion.div
        className="reels-section"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <ReelsViewer
          reels={mockReels}
          onLike={handleReelLike}
          onComment={handleReelComment}
          onShare={handleReelShare}
          onSave={handleReelSave}
          horizontal={true}
        />
      </motion.div>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            className="loading-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="loading-spinner"></div>
            <p className="loading-text">Cargando más publicaciones...</p>
          </motion.div>
        )}

        {/* End of feed message */}
        {!hasMore && posts.length > 0 && (
          <motion.div
            className="end-feed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p>¡Has visto todas las publicaciones! 🎉</p>
          </motion.div>
        )}
      </main>

      {/* Floating Action Button */}
      

      {/* Composer Modal */}
      <AnimatePresence>
        {isComposerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Composer onClose={closeComposer} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <BottomNav />
    </motion.div>
=======
    <div className="home-container">
      {/* Header */}
      <Header />

      <div className="home-layout">
        {/* Sidebar Izquierdo */}
        <LeftSidebar />

        {/* Contenido Principal */}
        <main className="home-main">
          {/* Stories */}
          <StoriesBar stories={mockStories} />

          {/* Barra de búsqueda y filtros */}
          <div className="search-filters-bar">
            <div className="search-container">
              <input
                type="text"
                placeholder="Buscar propiedades por ubicación, título..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button onClick={handleSearch} className="search-btn">🔍 Buscar</button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="filters-toggle"
              >
                🎛️ Filtros {showFilters ? '▼' : '▶'}
              </button>
            </div>

            {showFilters && (
              <div className="filters-panel">
                <div className="filter-row">
                  <input
                    type="text"
                    placeholder="Ubicación específica"
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    className="filter-input"
                  />
                  <input
                    type="number"
                    placeholder="Precio mínimo"
                    value={filters.minPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                    className="filter-input"
                  />
                  <input
                    type="number"
                    placeholder="Precio máximo"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                    className="filter-input"
                  />
                  <input
                    type="number"
                    placeholder="Mín. habitaciones"
                    value={filters.rooms}
                    onChange={(e) => setFilters(prev => ({ ...prev, rooms: e.target.value }))}
                    className="filter-input"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Crear Publicación */}
          <div className="create-post-card">
            <div className="create-post-header">
              <img
                src="/api/placeholder/40/40"
                alt="Tu perfil"
                className="user-avatar"
              />
              <button
                className="create-post-input"
                onClick={() => setIsCreatePostOpen(true)}
              >
                ¿Qué propiedad quieres publicar, Andres?
              </button>
            </div>
            <div className="create-post-actions">
              <button className="post-action">
                <span className="action-icon">📹</span>
                Video en vivo
              </button>
              <button className="post-action">
                <span className="action-icon">🖼️</span>
                Foto/Video
              </button>
              <button className="post-action">
                <span className="action-icon">😊</span>
                Sentimiento/Actividad
              </button>
            </div>
          </div>

          {/* Feed de Publicaciones */}
          <div className="posts-feed">
            {loading ? (
              <div className="loading-posts">
                <div className="loading-spinner"></div>
                <p>Cargando propiedades...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="no-results">
                <p>No se encontraron propiedades que coincidan con tu búsqueda.</p>
              </div>
            ) : (
              <AnimatePresence>
                {filteredPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <PostCard
                      property={post}
                      currentImageIndex={currentImageIndices[post.id] || 0}
                      onImageChange={handleImageChange}
                      onLike={handleLike}
                      onSave={handleSave}
                      onFollow={handleFollow}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </main>

        {/* Sidebar Derecho */}
        <RightSidebar />
      </div>

      {/* Modal Crear Publicación */}
      <AnimatePresence>
        {isCreatePostOpen && (
          <CreatePost
            onClose={() => setIsCreatePostOpen(false)}
            onSubmit={handleCreatePost}
          />
        )}
      </AnimatePresence>
    </div>
>>>>>>> 7d6191872e2e6da6771f24bf058649816f527586
  );
};

export default Home;
