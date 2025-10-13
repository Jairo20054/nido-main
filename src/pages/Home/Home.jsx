// src/pages/Home/Home.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../../components/common/Header/Header';
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar';
import RightSidebar from '../../components/RightSidebar/RightSidebar';
import PostCard from '../../components/PostCard/PostCard';
import StoriesBar from '../../components/Stories/StoriesBar';
import CreatePost from '../../components/CreatePost/CreatePost';
import './Home.css';

// Mock data para propiedades
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
    images: [
      '/api/placeholder/500/400',
      '/api/placeholder/500/400',
      '/api/placeholder/500/400'
    ],
    description: 'Hermoso apartamento en conjunto cerrado con amenities. 3 habitaciones, 2 baños, parqueadero privado. Excelente ubicación cerca de centros comerciales y transporte.',
    specs: {
      rooms: 3,
      bathrooms: 2,
      area: 85,
      parking: true
    },
    likes: 24,
    comments: 8,
    isLiked: false,
    isSaved: false,
    isFollowing: false,
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
    images: [
      '/api/placeholder/500/400',
      '/api/placeholder/500/400'
    ],
    description: 'Casa campestre ideal para familia. 4 habitaciones, 3 baños, jardín amplio, piscina y zona de BBQ. Perfecta para disfrutar del clima de la región.',
    specs: {
      rooms: 4,
      bathrooms: 3,
      area: 180,
      parking: true
    },
    likes: 42,
    comments: 15,
    isLiked: true,
    isSaved: true,
    isFollowing: true,
    timestamp: 'Hace 5 horas'
  }
];

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

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // Simular carga de datos
      setTimeout(() => {
        setPosts(mockProperties);
        setLoading(false);
      }, 1000);
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

  const handleCreatePost = (newPost) => {
    // Aquí integrarías con tu backend
    console.log('Nueva publicación:', newPost);
    setIsCreatePostOpen(false);
  };

  return (
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
            ) : (
              <AnimatePresence>
                {posts.map((post, index) => (
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