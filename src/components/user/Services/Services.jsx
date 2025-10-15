import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiMapPin, FiGrid, FiStar, FiTrendingUp, FiZap, FiBell, FiMoreHorizontal, FiHome, FiCamera, FiShield, FiDroplet, FiTool } from 'react-icons/fi';
import './Services.css';

const Services = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const moreMenuRef = useRef(null);

  const services = [
    {
      id: 1,
      title: 'Limpieza Profesional',
      description: 'Servicio de limpieza profunda para propiedades con productos ecológicos y personal certificado',
      price: 50000,
      image: '/images/cleaning.jpg',
      category: 'hogar',
      rating: 4.8,
      reviews: 127,
      featured: true,
      location: 'Bogotá'
    },
    {
      id: 2,
      title: 'Mantenimiento Eléctrico',
      description: 'Reparaciones y mantenimiento eléctrico con técnicos especializados y garantía incluida',
      price: 30000,
      image: '/images/electric.jpg',
      category: 'hogar',
      rating: 4.6,
      reviews: 89,
      location: 'Medellín'
    },
    {
      id: 3,
      title: 'Jardinería Profesional',
      description: 'Cuidado y mantenimiento de jardines con diseño paisajístico y plantas nativas',
      price: 25000,
      image: '/images/gardening.jpg',
      category: 'hogar',
      rating: 4.9,
      reviews: 156,
      featured: true,
      location: 'Cali'
    },
    {
      id: 4,
      title: 'Fotografía Profesional',
      description: 'Sesiones fotográficas para propiedades con equipo profesional y edición avanzada',
      price: 80000,
      image: '/images/photography.jpg',
      category: 'oportunidades',
      rating: 4.7,
      reviews: 203,
      location: 'Bogotá'
    },
    {
      id: 5,
      title: 'Decoración de Interiores',
      description: 'Asesoría en decoración y ambientación para maximizar el atractivo de tu propiedad',
      price: 60000,
      image: '/images/decoracion.jpg',
      category: 'diseño',
      rating: 4.5,
      reviews: 94,
      location: 'Medellín'
    },
    {
      id: 6,
      title: 'Seguridad 24/7',
      description: 'Sistemas de seguridad y monitoreo continuo para tu tranquilidad',
      price: 45000,
      image: '/images/security.jpg',
      category: 'seguridad',
      rating: 4.8,
      reviews: 178,
      location: 'Cartagena'
    },
    {
      id: 7,
      title: 'Consultoría Inmobiliaria',
      description: 'Asesoría experta para maximizar el valor de tu propiedad en el mercado',
      price: 75000,
      image: '/images/consultoria.jpg',
      category: 'oportunidades',
      rating: 4.9,
      reviews: 95,
      location: 'Bogotá'
    },
    {
      id: 8,
      title: 'Diseño de Espacios',
      description: 'Transformación creativa de espacios para aumentar su atractivo visual',
      price: 65000,
      image: '/images/diseno.jpg',
      category: 'diseño',
      rating: 4.7,
      reviews: 112,
      location: 'Medellín'
    },
    {
      id: 9,
      title: 'Smart Home Installation',
      description: 'Instalación de dispositivos inteligentes para automatizar tu hogar',
      price: 90000,
      image: '/images/smarthome.jpg',
      category: 'tecnologia',
      rating: 4.8,
      reviews: 67,
      location: 'Bogotá',
      featured: true
    },
    {
      id: 10,
      title: 'Energy Efficiency Audit',
      description: 'Auditoría completa para optimizar el consumo energético de tu propiedad',
      price: 55000,
      image: '/images/energy.jpg',
      category: 'sostenibilidad',
      rating: 4.6,
      reviews: 43,
      location: 'Medellín'
    },
    {
      id: 11,
      title: 'Pintura Profesional',
      description: 'Servicios de pintura interior y exterior con garantía de calidad',
      price: 40000,
      image: '/images/painting.jpg',
      category: 'hogar',
      rating: 4.7,
      reviews: 89,
      location: 'Barranquilla'
    },
    {
      id: 12,
      title: 'Fontanería Especializada',
      description: 'Reparación e instalación de sistemas de fontanería',
      price: 35000,
      image: '/images/plumbing.jpg',
      category: 'hogar',
      rating: 4.5,
      reviews: 76,
      location: 'Cali'
    }
  ];

  // Categorías principales que siempre se muestran
  const mainCategories = [
    { 
      id: 'all', 
      name: 'Todos', 
      icon: <FiGrid />, 
      count: services.length 
    },
    { 
      id: 'hogar', 
      name: 'Espacios del hogar', 
      icon: <FiHome />, 
      count: services.filter(s => s.category === 'hogar').length 
    },
    { 
      id: 'oportunidades', 
      name: 'Oportunidades', 
      icon: <FiTrendingUp />, 
      count: services.filter(s => s.category === 'oportunidades').length 
    },
    { 
      id: 'novedades', 
      name: 'Novedades', 
      icon: <FiBell />, 
      count: services.filter(s => s.category === 'novedades').length 
    }
  ];

  // Categorías adicionales que se muestran en el menú "Más"
  const additionalCategories = [
    { 
      id: 'diseño', 
      name: 'Diseño', 
      icon: <FiCamera />, 
      count: services.filter(s => s.category === 'diseño').length 
    },
    { 
      id: 'seguridad', 
      name: 'Seguridad', 
      icon: <FiShield />, 
      count: services.filter(s => s.category === 'seguridad').length 
    },
    { 
      id: 'tecnologia', 
      name: 'Tecnología', 
      icon: <FiZap />, 
      count: services.filter(s => s.category === 'tecnologia').length 
    },
    { 
      id: 'sostenibilidad', 
      name: 'Sostenibilidad', 
      icon: <FiDroplet />, 
      count: services.filter(s => s.category === 'sostenibilidad').length 
    }
  ];

  // Cerrar el menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setShowMoreCategories(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesCategory = activeFilter === 'all' || service.category === activeFilter;
      const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }, [activeFilter, searchTerm]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleServiceClick = (serviceId) => {
    // Navegación a la página de detalles
    console.log('Navegar al detalle del servicio:', serviceId);
  };

  const handleMoreCategoryClick = (categoryId) => {
    setActiveFilter(categoryId);
    setShowMoreCategories(false);
  };

  return (
    <motion.div
      className="services-container-compact"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Filtros en la parte superior - Compactos */}
      <motion.div 
        className="filters-compact-top"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {/* Barra de Búsqueda Compacta */}
        <div className="search-compact">
          <div className="search-input-compact">
            <input
              type="text"
              placeholder="Buscar servicios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-field-compact"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="clear-search-compact"
              >
                <FiX />
              </button>
            )}
          </div>
        </div>

        {/* Filtros Horizontales Compactos */}
        <div className="horizontal-filters-compact">
          <div className="filters-scroll-compact">
            {/* Categorías principales */}
            {mainCategories.map(category => (
              <motion.button
                key={category.id}
                className={`filter-tab-compact ${activeFilter === category.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(category.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="filter-icon-compact">{category.icon}</span>
                <span className="filter-name-compact">{category.name}</span>
                {category.count > 0 && (
                  <span className="filter-count-compact">{category.count}</span>
                )}
              </motion.button>
            ))}

            {/* Botón "Más" con menú desplegable */}
            <div className="more-categories-wrapper" ref={moreMenuRef}>
              <motion.button
                className={`filter-tab-compact more-categories-btn ${showMoreCategories ? 'active' : ''}`}
                onClick={() => setShowMoreCategories(!showMoreCategories)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="filter-icon-compact">
                  <FiMoreHorizontal />
                </span>
                <span className="filter-name-compact">Más</span>
              </motion.button>

              {/* Menú desplegable de categorías adicionales */}
              <AnimatePresence>
                {showMoreCategories && (
                  <motion.div
                    className="more-categories-menu"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    {additionalCategories.map(category => (
                      <button
                        key={category.id}
                        className={`more-category-item ${activeFilter === category.id ? 'active' : ''}`}
                        onClick={() => handleMoreCategoryClick(category.id)}
                      >
                        <span className="more-category-icon">{category.icon}</span>
                        <span className="more-category-name">{category.name}</span>
                        <span className="more-category-count">{category.count}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Información de Resultados Compacta */}
      <motion.div 
        className="results-compact"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="results-count-compact">
          <span className="count-number-compact">{filteredServices.length}</span>
          <span className="count-label-compact">servicios</span>
        </div>
        {searchTerm && (
          <div className="search-term-compact">
            para "<strong>{searchTerm}</strong>"
          </div>
        )}
      </motion.div>

      {/* Grid de Servicios Compacto */}
      <motion.div 
        className="services-grid-compact"
        layout
      >
        <AnimatePresence>
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id}
              className="service-card-compact"
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ 
                y: -4,
                transition: { duration: 0.2 }
              }}
              onClick={() => handleServiceClick(service.id)}
            >
              <div className="service-image-compact">
                <img src={service.image} alt={service.title} />
                {service.featured && (
                  <div className="featured-compact">
                    <FiStar />
                    Destacado
                  </div>
                )}
                <div className="image-overlay-compact">
                  <span className="view-details-compact">Ver detalles</span>
                </div>
              </div>

              <div className="service-info-compact">
                <h3 className="service-title-compact">{service.title}</h3>
                <div className="service-meta-compact">
                  <div className="service-location-compact">
                    <FiMapPin />
                    <span>{service.location}</span>
                  </div>
                  <div className="service-price-compact">
                    {formatPrice(service.price)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Estado Sin Resultados Compacto */}
      {filteredServices.length === 0 && (
        <motion.div 
          className="no-results-compact"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="no-results-content-compact">
            <h3>No encontramos servicios que coincidan</h3>
            <p>Prueba ajustando los filtros o los términos de búsqueda</p>
            <button 
              className="reset-filters-compact"
              onClick={() => {
                setSearchTerm('');
                setActiveFilter('all');
              }}
            >
              Mostrar todos los servicios
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Services;