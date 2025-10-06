import React, { useState } from 'react';
import './Remodelaciones.css';

// ========== COMPONENTES DE ICONOS ==========
const PlayIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);

const HeartIcon = ({ size = 20, filled = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const CommentIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const ShareIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/>
    <circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

const FilterIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);

const SearchIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.3-4.3"/>
  </svg>
);

const TrendingIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

const RecentIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const PopularIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const Remodelaciones = () => {
  // ========== ESTADOS ==========
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [selectedContent, setSelectedContent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('recientes');
  const [likedPosts, setLikedPosts] = useState(new Set());

  // ========== DATOS MOCK DE PUBLICACIONES ==========
  const [publicaciones] = useState([
    {
      id: 1,
      tipo: 'video',
      titulo: 'Transformación completa de cocina en 30 días',
      usuario: {
        nombre: 'Ana Martínez',
        avatar: '/api/placeholder/40/40',
        seguidores: 1240,
        verificado: true
      },
      descripcion: 'Comparto el proceso completo de cómo renové mi cocina con un presupuesto ajustado. ¡Quedé encantada con el resultado!',
      contenido: '/api/placeholder/400/600',
      duracion: '4:32',
      vistas: 15420,
      likes: 1243,
      comentarios: 89,
      compartido: 45,
      fecha: '2024-01-15',
      categoria: 'cocina',
      tags: ['#cocina', '#renovación', '#diy', '#hogar'],
      ubicacion: 'Madrid, España',
      presupuesto: 3500
    },
    {
      id: 2,
      tipo: 'imagen',
      titulo: 'Antes y después: Baño principal renovado',
      usuario: {
        nombre: 'Carlos Rodríguez',
        avatar: '/api/placeholder/40/40',
        seguidores: 890,
        verificado: false
      },
      descripcion: 'De baño antiguo a spa moderno. Incluyo todos los materiales que usé y consejos para ahorrar.',
      contenido: ['/api/placeholder/400/500', '/api/placeholder/400/500'],
      vistas: 8920,
      likes: 756,
      comentarios: 67,
      compartido: 23,
      fecha: '2024-01-14',
      categoria: 'baño',
      tags: ['#baño', '#renovación', '#decoración', '#hogar'],
      ubicacion: 'Barcelona, España',
      presupuesto: 2800
    },
    {
      id: 3,
      tipo: 'video',
      titulo: 'Mi sala se convirtió en el lugar favorito de la casa',
      usuario: {
        nombre: 'María López',
        avatar: '/api/placeholder/40/40',
        seguidores: 2150,
        verificado: true
      },
      descripcion: 'Time-lapse de 2 semanas de trabajo. Muebles hechos a medida y sistema de iluminación inteligente.',
      contenido: '/api/placeholder/400/600',
      duracion: '2:15',
      vistas: 23100,
      likes: 1987,
      comentarios: 134,
      compartido: 78,
      fecha: '2024-01-13',
      categoria: 'sala',
      tags: ['#sala', '#decoración', '#iluminación', '#muebles'],
      ubicacion: 'Valencia, España',
      presupuesto: 5200
    },
    {
      id: 4,
      tipo: 'imagen',
      titulo: 'Habitación infantil temática del espacio',
      usuario: {
        nombre: 'David García',
        avatar: '/api/placeholder/40/40',
        seguidores: 670,
        verificado: false
      },
      descripcion: 'Proyecto DIY para mi hijo. Pintura glow in the dark y muebles espaciales personalizados.',
      contenido: ['/api/placeholder/400/500', '/api/placeholder/400/500', '/api/placeholder/400/500'],
      vistas: 15600,
      likes: 1342,
      comentarios: 98,
      compartido: 56,
      fecha: '2024-01-12',
      categoria: 'habitacion',
      tags: ['#infantil', '#diy', '#decoración', '#niños'],
      ubicacion: 'Sevilla, España',
      presupuesto: 1200
    },
    {
      id: 5,
      tipo: 'video',
      titulo: 'Terraza transformada en jardín vertical',
      usuario: {
        nombre: 'Elena Torres',
        avatar: '/api/placeholder/40/40',
        seguidores: 1780,
        verificado: true
      },
      descripcion: 'Cómo convertí mi pequeña terraza en un oasis urbano con sistema de riego automático.',
      contenido: '/api/placeholder/400/600',
      duracion: '3:45',
      vistas: 18700,
      likes: 1654,
      comentarios: 112,
      compartido: 67,
      fecha: '2024-01-11',
      categoria: 'exterior',
      tags: ['#terraza', '#jardín', '#plantas', '#exterior'],
      ubicacion: 'Bilbao, España',
      presupuesto: 1800
    },
    {
      id: 6,
      tipo: 'imagen',
      titulo: 'Oficina en casa minimalista y funcional',
      usuario: {
        nombre: 'Javier Ruiz',
        avatar: '/api/placeholder/40/40',
        seguidores: 950,
        verificado: false
      },
      descripcion: 'Home office con almacenamiento inteligente y cableado oculto. Perfecto para teletrabajo.',
      contenido: ['/api/placeholder/400/500', '/api/placeholder/400/500'],
      vistas: 11200,
      likes: 987,
      comentarios: 76,
      compartido: 34,
      fecha: '2024-01-10',
      categoria: 'oficina',
      tags: ['#oficina', '#teletrabajo', '#minimalista', '#hogar'],
      ubicacion: 'Málaga, España',
      presupuesto: 2200
    }
  ]);

  // ========== CATEGORÍAS ==========
  const categories = [
    { id: 'todos', label: 'Todos', icon: '🏠' },
    { id: 'cocina', label: 'Cocinas', icon: '👨‍🍳' },
    { id: 'baño', label: 'Baños', icon: '🚿' },
    { id: 'sala', label: 'Salas', icon: '🛋️' },
    { id: 'habitacion', label: 'Habitaciones', icon: '🛏️' },
    { id: 'exterior', label: 'Exterior', icon: '🌳' },
    { id: 'oficina', label: 'Oficinas', icon: '💻' }
  ];

  // ========== OPCIONES DE ORDEN ==========
  const sortOptions = [
    { id: 'recientes', label: 'Más recientes', icon: <RecentIcon /> },
    { id: 'populares', label: 'Más populares', icon: <PopularIcon /> },
    { id: 'tendencia', label: 'En tendencia', icon: <TrendingIcon /> }
  ];

  // ========== MANEJADORES ==========
  const handleContentClick = (publicacion) => {
    setSelectedContent(publicacion);
  };

  const closeContentDetail = () => {
    setSelectedContent(null);
  };

  const handleLike = (id, e) => {
    e.stopPropagation();
    const newLiked = new Set(likedPosts);
    if (newLiked.has(id)) {
      newLiked.delete(id);
    } else {
      newLiked.add(id);
    }
    setLikedPosts(newLiked);
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const filteredPublicaciones = publicaciones
    .filter(publicacion => {
      const matchesCategory = selectedCategory === 'todos' || publicacion.categoria === selectedCategory;
      const matchesSearch = publicacion.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           publicacion.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           publicacion.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recientes':
          return new Date(b.fecha) - new Date(a.fecha);
        case 'populares':
          return b.likes - a.likes;
        case 'tendencia':
          return (b.vistas + b.likes * 2 + b.comentarios * 3) - (a.vistas + a.likes * 2 + a.comentarios * 3);
        default:
          return 0;
      }
    });

  // ========== RENDERIZADO ==========
  return (
    <div className="remodelaciones-social">
      {/* Header */}
      <div className="social-header">
        <div className="header-content">
          <h1 className="social-title">Comunidad Remodelaciones</h1>
          <p className="social-subtitle">Inspírate con proyectos reales de nuestra comunidad</p>
        </div>

        <div className="header-controls">
          {/* Barra de búsqueda */}
          <div className="search-bar">
            <SearchIcon />
            <input
              type="text"
              placeholder="Buscar publicaciones, tags o usuarios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Botón de filtros */}
          <button
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FilterIcon />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* Filtros y ordenamiento */}
      <div className="content-controls">
        <div className="categories-filter">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className="category-emoji">{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>

        <div className="sort-options">
          {sortOptions.map(option => (
            <button
              key={option.id}
              className={`sort-btn ${sortBy === option.id ? 'active' : ''}`}
              onClick={() => setSortBy(option.id)}
            >
              {option.icon}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Feed de publicaciones */}
      <div className="social-feed">
        {filteredPublicaciones.map(publicacion => (
          <div
            key={publicacion.id}
            className="post-card"
            onClick={() => handleContentClick(publicacion)}
          >
            {/* Header del post */}
            <div className="post-header">
              <div className="user-info">
                <img src={publicacion.usuario.avatar} alt={publicacion.usuario.nombre} className="user-avatar" />
                <div className="user-details">
                  <div className="user-name">
                    {publicacion.usuario.nombre}
                    {publicacion.usuario.verificado && <span className="verified-badge">✓</span>}
                  </div>
                  <div className="post-meta">
                    <span>{new Date(publicacion.fecha).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{publicacion.ubicacion}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido del post */}
            <div className="post-content">
              <h3 className="post-title">{publicacion.titulo}</h3>
              <p className="post-description">{publicacion.descripcion}</p>

              {/* Media */}
              <div className="post-media">
                {publicacion.tipo === 'video' ? (
                  <div className="video-container">
                    <img src={publicacion.contenido} alt={publicacion.titulo} />
                    <div className="video-overlay">
                      <button className="play-button">
                        <PlayIcon size={48} />
                      </button>
                      <span className="video-duration">{publicacion.duracion}</span>
                    </div>
                  </div>
                ) : (
                  <div className={`image-grid ${publicacion.contenido.length > 1 ? 'multiple' : 'single'}`}>
                    {publicacion.contenido.slice(0, 3).map((imagen, index) => (
                      <img key={index} src={imagen} alt={`${publicacion.titulo} ${index + 1}`} />
                    ))}
                    {publicacion.contenido.length > 3 && (
                      <div className="image-count">+{publicacion.contenido.length - 3}</div>
                    )}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="post-tags">
                {publicacion.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>

              {/* Stats */}
              <div className="post-stats">
                <div className="stat">
                  <EyeIcon size={16} />
                  <span>{formatNumber(publicacion.vistas)}</span>
                </div>
                <div className="stat">
                  <span>Presupuesto: €{publicacion.presupuesto}</span>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="post-actions">
              <button 
                className={`action-btn ${likedPosts.has(publicacion.id) ? 'liked' : ''}`}
                onClick={(e) => handleLike(publicacion.id, e)}
              >
                <HeartIcon filled={likedPosts.has(publicacion.id)} />
                <span>{formatNumber(publicacion.likes + (likedPosts.has(publicacion.id) ? 1 : 0))}</span>
              </button>
              <button className="action-btn">
                <CommentIcon />
                <span>{formatNumber(publicacion.comentarios)}</span>
              </button>
              <button className="action-btn">
                <ShareIcon />
                <span>{formatNumber(publicacion.compartido)}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de detalle */}
      {selectedContent && (
        <div className="post-modal-overlay" onClick={closeContentDetail}>
          <div className="post-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeContentDetail}>×</button>
            <div className="modal-content">
              {/* Contenido principal */}
              <div className="modal-media">
                {selectedContent.tipo === 'video' ? (
                  <div className="video-player">
                    <img src={selectedContent.contenido} alt={selectedContent.titulo} />
                    <div className="video-controls">
                      <button className="play-button large">
                        <PlayIcon size={64} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="image-carousel">
                    <img src={selectedContent.contenido[0]} alt={selectedContent.titulo} />
                  </div>
                )}
              </div>

              {/* Información detallada */}
              <div className="modal-info">
                <div className="modal-header">
                  <div className="user-info">
                    <img src={selectedContent.usuario.avatar} alt={selectedContent.usuario.nombre} className="user-avatar" />
                    <div className="user-details">
                      <div className="user-name">
                        {selectedContent.usuario.nombre}
                        {selectedContent.usuario.verificado && <span className="verified-badge">✓</span>}
                      </div>
                      <div className="user-followers">
                        {formatNumber(selectedContent.usuario.seguidores)} seguidores
                      </div>
                    </div>
                  </div>
                  <button className="follow-btn">Seguir</button>
                </div>

                <div className="modal-body">
                  <h2 className="modal-title">{selectedContent.titulo}</h2>
                  <p className="modal-description">{selectedContent.descripcion}</p>

                  <div className="modal-details">
                    <div className="detail-item">
                      <strong>Ubicación:</strong>
                      <span>{selectedContent.ubicacion}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Presupuesto:</strong>
                      <span>€{selectedContent.presupuesto}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Publicado:</strong>
                      <span>{new Date(selectedContent.fecha).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="modal-tags">
                    {selectedContent.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="modal-stats">
                  <div className="stat-item">
                    <span className="stat-number">{formatNumber(selectedContent.vistas)}</span>
                    <span className="stat-label">Visualizaciones</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{formatNumber(selectedContent.likes)}</span>
                    <span className="stat-label">Me gusta</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{formatNumber(selectedContent.comentarios)}</span>
                    <span className="stat-label">Comentarios</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{formatNumber(selectedContent.compartido)}</span>
                    <span className="stat-label">Compartido</span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="modal-actions">
                  <button 
                    className={`action-btn large ${likedPosts.has(selectedContent.id) ? 'liked' : ''}`}
                    onClick={(e) => handleLike(selectedContent.id, e)}
                  >
                    <HeartIcon filled={likedPosts.has(selectedContent.id)} />
                    <span>Me gusta</span>
                  </button>
                  <button className="action-btn large">
                    <CommentIcon />
                    <span>Comentar</span>
                  </button>
                  <button className="action-btn large">
                    <ShareIcon />
                    <span>Compartir</span>
                  </button>
                </div>

                {/* Sección de comentarios (simplificada) */}
                <div className="comments-section">
                  <h3>Comentarios ({selectedContent.comentarios})</h3>
                  <div className="add-comment">
                    <input type="text" placeholder="Añade un comentario..." className="comment-input" />
                    <button className="comment-btn">Publicar</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Icono adicional para las vistas
const EyeIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

export default Remodelaciones;