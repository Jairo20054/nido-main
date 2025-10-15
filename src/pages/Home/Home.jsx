// src/pages/Home/Home.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// import Header from '../../components/common/Header/Header';
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar';
import RightSidebar from '../../components/RightSidebar/RightSidebar';
import PostCard from '../../components/PostCard/PostCard';
import StoriesBar from '../../components/Stories/StoriesBar';
import SearchBar from '../../components/common/Header/SearchBar';
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

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [currentImageIndices, setCurrentImageIndices] = useState({});
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchForm, setSearchForm] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 1
  });

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
      const matchesLocation = !searchForm.location ||
        post.title.toLowerCase().includes(searchForm.location.toLowerCase()) ||
        post.location.toLowerCase().includes(searchForm.location.toLowerCase()) ||
        post.description.toLowerCase().includes(searchForm.location.toLowerCase());

      const matchesGuests = searchForm.guests <= (post.specs.rooms * 2); // Assume 2 guests per room

      // For dates, assume all posts available if no availability data; backend handles
      const matchesDates = true;

      return matchesLocation && matchesGuests && matchesDates;
    });
  }, [posts, searchForm]);

  const handleHomeSearch = async (formData) => {
    setSearchForm(formData);
    try {
      setLoading(true);
      const searchParams = {
        page: 1,
        limit: 20,
        ...(formData.location && { location: formData.location }),
        ...(formData.checkIn && { checkIn: formData.checkIn }),
        ...(formData.checkOut && { checkOut: formData.checkOut }),
        ...(formData.guests && { guests: formData.guests })
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

  return (
    <div className="home-container">
      {/* Header */}
      {/* <Header /> */}

      <div className="home-layout">
        {/* Sidebar Izquierdo */}
        <LeftSidebar />

        {/* Contenido Principal */}
        <main className="home-main">
          {/* Hero Search Bar (Airbnb-style) */}
          <div className="home-hero-search">
            <SearchBar onSearch={handleHomeSearch} />
          </div>

          {/* Stories */}
          <StoriesBar stories={mockStories} />

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
  );
};

export default Home;
