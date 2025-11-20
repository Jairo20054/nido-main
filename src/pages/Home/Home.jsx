import React, { useState, useEffect } from 'react';import React, { useState, useEffect } from 'react';

import { motion } from 'framer-motion';import { motion } from 'framer-motion';

import SearchBar from '../../components/common/SearchBar/SearchBar';import SearchBar from '../../components/common/SearchBar/SearchBar';

import PropertyCard from '../../components/common/PropertyCard/PropertyCard';import PropertyCard from '../../components/common/PropertyCard/PropertyCard';

import { api } from '../../services/api';import { api } from '../../services/api';

import './Home.css';import './Home.css';



const Home = () => {const Home = () => {

  const [properties, setProperties] = useState([]);  const [properties, setProperties] = useState([]);

  const [loading, setLoading] = useState(true);  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useState({  const [searchParams, setSearchParams] = useState({

    location: '',    location: '',

    checkIn: '',    checkIn: '',

    checkOut: '',    checkOut: '',

    guests: ''    guests: ''

  });  });

  const [favorites, setFavorites] = useState(new Set());  const [favorites, setFavorites] = useState(new Set());



  useEffect(() => {  // Cargar propiedades

    const loadProperties = async () => {  useEffect(() => {

      try {    const loadProperties = async () => {

        setLoading(true);      try {

        const response = await api.get('/properties', { page: 1, limit: 20 });        setLoading(true);

                const response = await api.get('/properties', { page: 1, limit: 20 });

        if (response.success) {        

          setProperties(response.data);        if (response.success) {

        } else {          setProperties(response.data);

          setProperties(getMockProperties());        } else {

        }          // Mock data si falla la API

      } catch (error) {          setProperties(getMockProperties());

        console.error('Error cargando propiedades:', error);        }

        setProperties(getMockProperties());      } catch (error) {

      } finally {        console.error('Error cargando propiedades:', error);

        setLoading(false);        setProperties(getMockProperties());

      }      } finally {

    };        setLoading(false);

      }

    loadProperties();    };

  }, []);

    loadProperties();

  const getMockProperties = () => [  }, []);

    {

      id: 1,  const getMockProperties = () => [

      title: 'Apartamento Amoblado en El Poblado',    {

      location: 'Medellín, Antioquia',      id: 1,

      price: 1800000,      title: 'Apartamento Amoblado en El Poblado',

      rating: 4.8,      location: 'Medellín, Antioquia',

      reviewCount: 45,      price: 1800000,

      bedrooms: 3,      rating: 4.8,

      bathrooms: 2,      reviewCount: 45,

      sqft: 85,      bedrooms: 3,

      type: 'Apartamento',      bathrooms: 2,

      images: [      sqft: 85,

        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=400&fit=crop',      type: 'Apartamento',

        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=400&fit=crop'      images: [

      ]        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=400&fit=crop',

    },        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=400&fit=crop'

    {      ]

      id: 2,    },

      title: 'Casa Moderna con Jardín',    {

      location: 'Sabaneta, Antioquia',      id: 2,

      price: 2500000,      title: 'Casa Moderna con Jardín',

      rating: 4.9,      location: 'Sabaneta, Antioquia',

      reviewCount: 23,      price: 2500000,

      bedrooms: 4,      rating: 4.9,

      bathrooms: 3,      reviewCount: 23,

      sqft: 150,      bedrooms: 4,

      type: 'Casa',      bathrooms: 3,

      images: [      sqft: 150,

        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=400&fit=crop',      type: 'Casa',

        'https://images.unsplash.com/photo-1570129477492-45a003537e1f?w=400&h=400&fit=crop'      images: [

      ]        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=400&fit=crop',

    },        'https://images.unsplash.com/photo-1570129477492-45a003537e1f?w=400&h=400&fit=crop'

    {      ]

      id: 3,    },

      title: 'Estudio Centro Comercial',    {

      location: 'Downtown, Medellín',      id: 3,

      price: 950000,      title: 'Estudio Centro Comercial',

      rating: 4.6,      location: 'Downtown, Medellín',

      reviewCount: 67,      price: 950000,

      bedrooms: 1,      rating: 4.6,

      bathrooms: 1,      reviewCount: 67,

      sqft: 40,      bedrooms: 1,

      type: 'Estudio',      bathrooms: 1,

      images: [      sqft: 40,

        'https://images.unsplash.com/photo-1512197917215-82f0a50eb629?w=400&h=400&fit=crop'      type: 'Estudio',

      ]      images: [

    },        'https://images.unsplash.com/photo-1512197917215-82f0a50eb629?w=400&h=400&fit=crop'

    {      ]

      id: 4,    },

      title: 'Penthouse con Terraza',    {

      location: 'Laureles, Medellín',      id: 4,

      price: 3200000,      title: 'Penthouse con Terraza',

      rating: 5.0,      location: 'Laureles, Medellín',

      reviewCount: 12,      price: 3200000,

      bedrooms: 3,      rating: 5.0,

      bathrooms: 2,      reviewCount: 12,

      sqft: 120,      bedrooms: 3,

      type: 'Penthouse',      bathrooms: 2,

      images: [      sqft: 120,

        'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=400&h=400&fit=crop'      type: 'Penthouse',

      ]      images: [

    },        'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=400&h=400&fit=crop'

    {      ]

      id: 5,    },

      title: 'Loft Industrial',    {

      location: 'Provenza, Medellín',      id: 5,

      price: 2100000,      title: 'Loft Industrial',

      rating: 4.7,      location: 'Provenza, Medellín',

      reviewCount: 34,      price: 2100000,

      bedrooms: 2,      rating: 4.7,

      bathrooms: 2,      reviewCount: 34,

      sqft: 95,      bedrooms: 2,

      type: 'Loft',      bathrooms: 2,

      images: [      sqft: 95,

        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=400&fit=crop'      type: 'Loft',

      ]      images: [

    },        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=400&fit=crop'

    {      ]

      id: 6,    },

      title: 'Casa Campestre',    {

      location: 'Envigado, Antioquia',      id: 6,

      price: 2800000,      title: 'Casa Campestre',

      rating: 4.9,      location: 'Envigado, Antioquia',

      reviewCount: 28,      price: 2800000,

      bedrooms: 5,      rating: 4.9,

      bathrooms: 4,      reviewCount: 28,

      sqft: 200,      bedrooms: 5,

      type: 'Casa',      bathrooms: 4,

      images: [      sqft: 200,

        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=400&fit=crop'      type: 'Casa',

      ]      images: [

    }        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=400&fit=crop'

  ];      ]

    }

  const handleSearch = (params) => {  ];

    console.log('Búsqueda realizada:', params);

    setSearchParams(params);  const handleSearch = (params) => {

  };    console.log('Búsqueda realizada:', params);

    setSearchParams(params);

  const handleFavoriteToggle = (propertyId, isFavorite) => {    // Aquí puedes filtrar propiedades basado en los parámetros

    if (isFavorite) {  };

      setFavorites(prev => new Set([...prev, propertyId]));

    } else {  const handleFavoriteToggle = (propertyId, isFavorite) => {

      setFavorites(prev => {    if (isFavorite) {

        const newSet = new Set(prev);      setFavorites(prev => new Set([...prev, propertyId]));

        newSet.delete(propertyId);    } else {

        return newSet;      setFavorites(prev => {

      });        const newSet = new Set(prev);

    }        newSet.delete(propertyId);

  };        return newSet;

      });

  const containerVariants = {    }

    hidden: { opacity: 0 },  };

    visible: {

      opacity: 1,  const containerVariants = {

      transition: {    hidden: { opacity: 0 },

        staggerChildren: 0.1,    visible: {

        delayChildren: 0.2      opacity: 1,

      }      transition: {

    }        staggerChildren: 0.1,

  };        delayChildren: 0.2

      }

  const itemVariants = {    }

    hidden: { opacity: 0, y: 20 },  };

    visible: {

      opacity: 1,  const itemVariants = {

      y: 0,    hidden: { opacity: 0, y: 20 },

      transition: { duration: 0.4, ease: 'easeOut' }    visible: {

    }      opacity: 1,

  };      y: 0,

      transition: { duration: 0.4, ease: 'easeOut' }

  return (    }

    <div className="home">  };

      <section className="home-hero">

        <div className="hero-content">  return (

          <motion.h1    <div className="home">

            className="hero-title"      {/* HERO SECTION CON SEARCHBAR */}

            initial={{ opacity: 0, y: -20 }}      <section className="home-hero">

            animate={{ opacity: 1, y: 0 }}        <div className="hero-content">

            transition={{ duration: 0.6 }}          <motion.h1

          >            className="hero-title"

            Encuentra tu propiedad perfecta            initial={{ opacity: 0, y: -20 }}

          </motion.h1>            animate={{ opacity: 1, y: 0 }}

          <motion.p            transition={{ duration: 0.6 }}

            className="hero-subtitle"          >

            initial={{ opacity: 0, y: -10 }}            Encuentra tu propiedad perfecta

            animate={{ opacity: 1, y: 0 }}          </motion.h1>

            transition={{ duration: 0.6, delay: 0.1 }}          <motion.p

          >            className="hero-subtitle"

            Explora las mejores opciones de alquiler en tu zona            initial={{ opacity: 0, y: -10 }}

          </motion.p>            animate={{ opacity: 1, y: 0 }}

                      transition={{ duration: 0.6, delay: 0.1 }}

          <motion.div          >

            initial={{ opacity: 0, y: 20 }}            Explora las mejores opciones de alquiler en tu zona

            animate={{ opacity: 1, y: 0 }}          </motion.p>

            transition={{ duration: 0.6, delay: 0.2 }}          

          >          <motion.div

            <SearchBar onSearch={handleSearch} />            initial={{ opacity: 0, y: 20 }}

          </motion.div>            animate={{ opacity: 1, y: 0 }}

        </div>            transition={{ duration: 0.6, delay: 0.2 }}

      </section>          >

            <SearchBar onSearch={handleSearch} />

      <section className="home-properties">          </motion.div>

        <div className="properties-container">        </div>

          {loading ? (      </section>

            <div className="loading-grid">

              {[...Array(6)].map((_, i) => (      {/* GRID DE PROPIEDADES */}

                <div key={i} className="skeleton-card">      <section className="home-properties">

                  <div className="skeleton-image" />        <div className="properties-container">

                  <div className="skeleton-content">          {loading ? (

                    <div className="skeleton-title" />            <div className="loading-grid">

                    <div className="skeleton-text" />              {[...Array(6)].map((_, i) => (

                    <div className="skeleton-text" />                <div key={i} className="skeleton-card">

                  </div>                  <div className="skeleton skeleton-image" />

                </div>                  <div className="skeleton-content">

              ))}                    <div className="skeleton skeleton-title" />

            </div>                    <div className="skeleton skeleton-text" />

          ) : properties.length > 0 ? (                    <div className="skeleton skeleton-text" />

            <motion.div                  </div>

              className="properties-grid"                </div>

              variants={containerVariants}              ))}

              initial="hidden"            </div>

              animate="visible"          ) : properties.length > 0 ? (

            >            <motion.div

              {properties.map((property) => (              className="properties-grid"

                <motion.div              variants={containerVariants}

                  key={property.id}              initial="hidden"

                  variants={itemVariants}              animate="visible"

                >            >

                  <PropertyCard              {properties.map((property) => (

                    property={property}                <motion.div

                    onFavoriteToggle={handleFavoriteToggle}                  key={property.id}

                  />                  variants={itemVariants}

                </motion.div>                >

              ))}                  <PropertyCard

            </motion.div>                    property={property}

          ) : (                    onFavoriteToggle={handleFavoriteToggle}

            <div className="empty-state">                  />

              <p>No se encontraron propiedades</p>                </motion.div>

            </div>              ))}

          )}            </motion.div>

        </div>          ) : (

      </section>            <div className="empty-state">

    </div>              <p>No se encontraron propiedades</p>

  );            </div>

};          )}

        </div>

export default Home;      </section>

    </div>
  );
};

export default Home;
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
