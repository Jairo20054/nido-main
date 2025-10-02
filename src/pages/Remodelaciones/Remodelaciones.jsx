import React, { useState, useEffect } from 'react';
import './Remodelaciones.css';

// ========== COMPONENTES DE ICONOS ==========
const HammerIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);

const PaintIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l3 3-3 3-3-3 3-3"/>
    <path d="M12 9l3 3-3 3-3-3 3-3"/>
    <path d="M12 16l3 3-3 3-3-3 3-3"/>
    <path d="M2 12h20"/>
  </svg>
);

const WrenchIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);

const StarIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const ClockIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const DollarIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const CheckIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
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

const Remodelaciones = () => {
  // ========== ESTADOS ==========
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // ========== DATOS MOCK DE PROYECTOS ==========
  const [projects] = useState([
    {
      id: 1,
      titulo: 'Renovación Completa de Cocina Moderna',
      categoria: 'cocina',
      descripcion: 'Transformación total de cocina con electrodomésticos de última generación y diseño minimalista.',
      precio: 8500000,
      duracion: '3 semanas',
      imagenes: ['/api/placeholder/400/300', '/api/placeholder/400/300', '/api/placeholder/400/300'],
      servicios: ['Demolición', 'Instalación eléctrica', 'Plomería', 'Acabados'],
      calificacion: 4.8,
      reseñas: 24,
      antes: '/api/placeholder/400/300',
      despues: '/api/placeholder/400/300'
    },
    {
      id: 2,
      titulo: 'Baño Principal de Lujo',
      categoria: 'baño',
      descripcion: 'Renovación de baño principal con jacuzzi, ducha italiana y acabados premium.',
      precio: 5200000,
      duracion: '2 semanas',
      imagenes: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
      servicios: ['Demolición', 'Plomería especializada', 'Acabados de lujo'],
      calificacion: 4.9,
      reseñas: 18,
      antes: '/api/placeholder/400/300',
      despues: '/api/placeholder/400/300'
    },
    {
      id: 3,
      titulo: 'Sala de Estar Contemporánea',
      categoria: 'sala',
      descripcion: 'Rediseño completo de sala de estar con muebles integrados y iluminación LED.',
      precio: 6800000,
      duracion: '4 semanas',
      imagenes: ['/api/placeholder/400/300', '/api/placeholder/400/300', '/api/placeholder/400/300', '/api/placeholder/400/300'],
      servicios: ['Demolición', 'Instalación eléctrica', 'Acabados', 'Muebles a medida'],
      calificacion: 4.7,
      reseñas: 31,
      antes: '/api/placeholder/400/300',
      despues: '/api/placeholder/400/300'
    },
    {
      id: 4,
      titulo: 'Habitación Infantil Temática',
      categoria: 'habitacion',
      descripcion: 'Diseño personalizado de habitación infantil con muebles temáticos y almacenamiento inteligente.',
      precio: 3200000,
      duracion: '2 semanas',
      imagenes: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
      servicios: ['Pintura especializada', 'Muebles a medida', 'Instalación de iluminación'],
      calificacion: 4.6,
      reseñas: 15,
      antes: '/api/placeholder/400/300',
      despues: '/api/placeholder/400/300'
    },
    {
      id: 5,
      titulo: 'Terraza Residencial',
      categoria: 'exterior',
      descripcion: 'Transformación de terraza en espacio habitable con jardín vertical y zona de BBQ.',
      precio: 4500000,
      duracion: '3 semanas',
      imagenes: ['/api/placeholder/400/300', '/api/placeholder/400/300', '/api/placeholder/400/300'],
      servicios: ['Construcción', 'Jardinería', 'Instalación eléctrica', 'Acabados exteriores'],
      calificacion: 4.8,
      reseñas: 22,
      antes: '/api/placeholder/400/300',
      despues: '/api/placeholder/400/300'
    },
    {
      id: 6,
      titulo: 'Oficina en Casa Moderna',
      categoria: 'oficina',
      descripcion: 'Conversión de espacio en oficina productiva con ergonomía y tecnología integrada.',
      precio: 2800000,
      duracion: '1.5 semanas',
      imagenes: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
      servicios: ['Instalación eléctrica', 'Cableado de red', 'Muebles ergonómicos'],
      calificacion: 4.5,
      reseñas: 12,
      antes: '/api/placeholder/400/300',
      despues: '/api/placeholder/400/300'
    }
  ]);

  // ========== CATEGORÍAS ==========
  const categories = [
    { id: 'todos', label: 'Todos los Proyectos', icon: <HammerIcon /> },
    { id: 'cocina', label: 'Cocinas', icon: <PaintIcon /> },
    { id: 'baño', label: 'Baños', icon: <WrenchIcon /> },
    { id: 'sala', label: 'Salas', icon: <StarIcon /> },
    { id: 'habitacion', label: 'Habitaciones', icon: <StarIcon /> },
    { id: 'exterior', label: 'Exterior', icon: <HammerIcon /> },
    { id: 'oficina', label: 'Oficinas', icon: <WrenchIcon /> }
  ];

  // ========== MANEJADORES ==========
  const handleProjectClick = (project) => {
    setSelectedProject(project);
  };

  const closeProjectDetail = () => {
    setSelectedProject(null);
  };

  const filteredProjects = projects.filter(project => {
    const matchesCategory = selectedCategory === 'todos' || project.categoria === selectedCategory;
    const matchesSearch = project.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.descripcion.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatCurrency = (value) => `$${value.toLocaleString()}`;

  // ========== RENDERIZADO ==========
  return (
    <div className="remodelaciones">
      {/* Header con filtros */}
      <div className="remodelaciones-header">
        <div className="header-content">
          <h1 className="remodelaciones-title">Remodelaciones</h1>
          <p className="remodelaciones-subtitle">Transforma tu hogar con nuestros servicios profesionales</p>
        </div>

        <div className="header-controls">
          {/* Barra de búsqueda */}
          <div className="search-bar">
            <SearchIcon />
            <input
              type="text"
              placeholder="Buscar proyectos..."
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

      {/* Filtros de categoría */}
      <div className="categories-filter">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.icon}
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      {/* Galería de proyectos */}
      <div className="projects-gallery">
        {filteredProjects.map(project => (
          <div
            key={project.id}
            className="project-card"
            onClick={() => handleProjectClick(project)}
          >
            <div className="project-image">
              <img src={project.imagenes[0]} alt={project.titulo} />
              <div className="project-overlay">
                <div className="project-price">{formatCurrency(project.precio)}</div>
                <div className="project-duration">
                  <ClockIcon />
                  <span>{project.duracion}</span>
                </div>
              </div>
            </div>

            <div className="project-info">
              <h3 className="project-title">{project.titulo}</h3>
              <p className="project-description">{project.descripcion}</p>

              <div className="project-meta">
                <div className="project-rating">
                  <StarIcon className="star-filled" />
                  <span className="rating-value">{project.calificacion}</span>
                  <span className="rating-count">({project.reseñas})</span>
                </div>

                <div className="project-services">
                  {project.servicios.slice(0, 2).map((servicio, index) => (
                    <span key={index} className="service-tag">{servicio}</span>
                  ))}
                  {project.servicios.length > 2 && (
                    <span className="service-tag">+{project.servicios.length - 2}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Estadísticas */}
      <div className="remodelaciones-stats">
        <div className="stat-item">
          <div className="stat-number">150+</div>
          <div className="stat-label">Proyectos Completados</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">4.7</div>
          <div className="stat-label">Calificación Promedio</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">98%</div>
          <div className="stat-label">Clientes Satisfechos</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">5</div>
          <div className="stat-label">Años de Experiencia</div>
        </div>
      </div>

      {/* Modal de detalle de proyecto */}
      {selectedProject && (
        <div className="project-modal-overlay" onClick={closeProjectDetail}>
          <div className="project-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeProjectDetail}>×</button>

            <div className="modal-content">
              {/* Galería de imágenes */}
              <div className="modal-gallery">
                <div className="main-image">
                  <img src={selectedProject.imagenes[0]} alt={selectedProject.titulo} />
                </div>
                <div className="thumbnail-grid">
                  {selectedProject.imagenes.slice(1).map((imagen, index) => (
                    <img key={index} src={imagen} alt={`${selectedProject.titulo} ${index + 2}`} />
                  ))}
                </div>
              </div>

              {/* Información detallada */}
              <div className="modal-details">
                <div className="modal-header">
                  <h2 className="modal-title">{selectedProject.titulo}</h2>
                  <div className="modal-rating">
                    <StarIcon className="star-filled" />
                    <span>{selectedProject.calificacion}</span>
                    <span className="rating-count">({selectedProject.reseñas} reseñas)</span>
                  </div>
                </div>

                <p className="modal-description">{selectedProject.descripcion}</p>

                <div className="modal-specs">
                  <div className="spec-item">
                    <DollarIcon />
                    <span className="spec-label">Precio:</span>
                    <span className="spec-value">{formatCurrency(selectedProject.precio)}</span>
                  </div>
                  <div className="spec-item">
                    <ClockIcon />
                    <span className="spec-label">Duración:</span>
                    <span className="spec-value">{selectedProject.duracion}</span>
                  </div>
                </div>

                <div className="modal-services">
                  <h3>Servicios Incluidos</h3>
                  <div className="services-grid">
                    {selectedProject.servicios.map((servicio, index) => (
                      <div key={index} className="service-item">
                        <CheckIcon />
                        <span>{servicio}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comparación antes/después */}
                <div className="before-after">
                  <h3>Transformación</h3>
                  <div className="comparison-grid">
                    <div className="comparison-item">
                      <h4>Antes</h4>
                      <img src={selectedProject.antes} alt="Antes de la remodelación" />
                    </div>
                    <div className="comparison-item">
                      <h4>Después</h4>
                      <img src={selectedProject.despues} alt="Después de la remodelación" />
                    </div>
                  </div>
                </div>

                <div className="modal-actions">
                  <button className="contact-btn">Solicitar Cotización</button>
                  <button className="favorite-btn">Agregar a Favoritos</button>
                  <button className="share-btn">Compartir Proyecto</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Remodelaciones;
