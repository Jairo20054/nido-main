import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, FiX, FiMapPin, FiGrid, FiStar, FiTrendingUp, 
  FiZap, FiBell, FiMoreHorizontal, FiHome, FiCamera, 
  FiShield, FiDroplet, FiTool, FiFilter, FiChevronDown,
  FiSliders, FiCheck, FiClock, FiDollarSign, FiAward
} from 'react-icons/fi';
import './Services.css';

const Services = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    priceRange: [0, 100000],
    rating: 0,
    locations: [],
    features: [],
    sortBy: 'relevance',
    availability: 'all'
  });

  const moreMenuRef = useRef(null);
  const filtersMenuRef = useRef(null);

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
      location: 'Bogotá',
      availability: 'immediate',
      tags: ['eco-friendly', 'certificado', 'rápido'],
      deliveryTime: '2-4 horas'
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
      location: 'Medellín',
      availability: '24/7',
      tags: ['garantía', 'especializado', 'emergencia'],
      deliveryTime: '1-2 días'
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
      location: 'Cali',
      availability: 'scheduled',
      tags: ['diseño', 'plantas nativas', 'mantenimiento'],
      deliveryTime: '3-5 días'
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
      location: 'Bogotá',
      availability: 'immediate',
      tags: ['equipo profesional', 'edición', 'sesiones'],
      deliveryTime: '5-7 días'
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
      location: 'Medellín',
      availability: 'scheduled',
      tags: ['asesoría', 'diseño', 'personalizado'],
      deliveryTime: '7-10 días'
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
      location: 'Cartagena',
      availability: '24/7',
      tags: ['monitoreo', '24/7', 'instalación'],
      deliveryTime: '1-3 días'
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
      location: 'Bogotá',
      availability: 'immediate',
      tags: ['experto', 'valoración', 'mercado'],
      deliveryTime: '2-4 días'
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
      location: 'Medellín',
      availability: 'scheduled',
      tags: ['transformación', 'creativo', 'visual'],
      deliveryTime: '10-14 días'
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
      featured: true,
      availability: '24/7',
      tags: ['automación', 'tecnología', 'instalación'],
      deliveryTime: '3-6 días'
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
      location: 'Medellín',
      availability: 'scheduled',
      tags: ['auditoría', 'eficiencia', 'optimización'],
      deliveryTime: '5-8 días'
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
      location: 'Barranquilla',
      availability: 'immediate',
      tags: ['calidad', 'garantía', 'profesional'],
      deliveryTime: '4-7 días'
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
      location: 'Cali',
      availability: '24/7',
      tags: ['reparación', 'emergencia', 'especializado'],
      deliveryTime: '1-2 días'
    }
  ];

  // Categorías principales
  const mainCategories = [
    { id: 'all', name: 'Todos', icon: <FiGrid />, count: services.length },
    { id: 'hogar', name: 'Espacios del hogar', icon: <FiHome />, count: services.filter(s => s.category === 'hogar').length },
    { id: 'oportunidades', name: 'Oportunidades', icon: <FiTrendingUp />, count: services.filter(s => s.category === 'oportunidades').length },
    { id: 'novedades', name: 'Novedades', icon: <FiBell />, count: services.filter(s => s.featured).length }
  ];

  // Categorías adicionales
  const additionalCategories = [
    { id: 'diseño', name: 'Diseño', icon: <FiCamera />, count: services.filter(s => s.category === 'diseño').length },
    { id: 'seguridad', name: 'Seguridad', icon: <FiShield />, count: services.filter(s => s.category === 'seguridad').length },
    { id: 'tecnologia', name: 'Tecnología', icon: <FiZap />, count: services.filter(s => s.category === 'tecnologia').length },
    { id: 'sostenibilidad', name: 'Sostenibilidad', icon: <FiDroplet />, count: services.filter(s => s.category === 'sostenibilidad').length }
  ];

  // Opciones de filtros avanzados
  const filterOptions = {
    locations: ['Bogotá', 'Medellín', 'Cali', 'Cartagena', 'Barranquilla'],
    ratings: [4.5, 4.0, 3.5, 3.0],
    features: ['eco-friendly', 'certificado', 'garantía', '24/7', 'emergencia'],
    sortOptions: [
      { id: 'relevance', name: 'Relevancia' },
      { id: 'price_asc', name: 'Precio: Menor a Mayor' },
      { id: 'price_desc', name: 'Precio: Mayor a Menor' },
      { id: 'rating', name: 'Mejor Calificados' },
      { id: 'newest', name: 'Más Recientes' }
    ],
    availabilityOptions: [
      { id: 'all', name: 'Todos' },
      { id: 'immediate', name: 'Disponibilidad Inmediata' },
      { id: '24/7', name: 'Servicio 24/7' },
      { id: 'scheduled', name: 'Con Cita' }
    ]
  };

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setShowMoreCategories(false);
      }
      if (filtersMenuRef.current && !filtersMenuRef.current.contains(event.target)) {
        setShowAdvancedFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Función para manejar cambios en filtros
  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prev => {
      if (filterType === 'locations' || filterType === 'features') {
        const currentArray = prev[filterType];
        return {
          ...prev,
          [filterType]: currentArray.includes(value)
            ? currentArray.filter(item => item !== value)
            : [...currentArray, value]
        };
      }
      return { ...prev, [filterType]: value };
    });
  };

  // Función para limpiar todos los filtros
  const clearAllFilters = () => {
    setSelectedFilters({
      priceRange: [0, 100000],
      rating: 0,
      locations: [],
      features: [],
      sortBy: 'relevance',
      availability: 'all'
    });
    setSearchTerm('');
    setActiveFilter('all');
  };

  // Servicios filtrados con useMemo para optimización
  const filteredServices = useMemo(() => {
    let filtered = services.filter(service => {
      const matchesCategory = activeFilter === 'all' || 
        (activeFilter === 'novedades' ? service.featured : service.category === activeFilter);
      
      const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesPrice = service.price >= selectedFilters.priceRange[0] && 
                          service.price <= selectedFilters.priceRange[1];
      
      const matchesRating = service.rating >= selectedFilters.rating;
      
      const matchesLocation = selectedFilters.locations.length === 0 || 
                            selectedFilters.locations.includes(service.location);
      
      const matchesFeatures = selectedFilters.features.length === 0 ||
                            selectedFilters.features.some(feature => service.tags.includes(feature));
      
      const matchesAvailability = selectedFilters.availability === 'all' ||
                                service.availability === selectedFilters.availability;

      return matchesCategory && matchesSearch && matchesPrice && matchesRating && 
             matchesLocation && matchesFeatures && matchesAvailability;
    });

    // Ordenar resultados
    switch (selectedFilters.sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => b.id - a.id);
        break;
      default:
        // Relevancia - mantener orden original con featured primero
        filtered.sort((a, b) => (b.featured - a.featured) || (b.rating - a.rating));
    }

    return filtered;
  }, [activeFilter, searchTerm, selectedFilters, services]);

  // Contar filtros activos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedFilters.priceRange[0] > 0 || selectedFilters.priceRange[1] < 100000) count++;
    if (selectedFilters.rating > 0) count++;
    if (selectedFilters.locations.length > 0) count++;
    if (selectedFilters.features.length > 0) count++;
    if (selectedFilters.availability !== 'all') count++;
    if (selectedFilters.sortBy !== 'relevance') count++;
    return count;
  }, [selectedFilters]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleServiceClick = (serviceId) => {
    console.log('Navegar al detalle del servicio:', serviceId);
  };

  const handleMoreCategoryClick = (categoryId) => {
    setActiveFilter(categoryId);
    setShowMoreCategories(false);
  };

  return (
    <motion.div
      className="services-container-advanced"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header con Búsqueda y Filtros */}
      <motion.div 
        className="filters-header-advanced"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {/* Barra de Búsqueda Mejorada */}
        <div className="search-section-advanced">
          <div className="search-input-advanced">
            <FiSearch className="search-icon-advanced" />
            <input
              type="text"
              placeholder="Buscar servicios, categorías o características..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-field-advanced"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="clear-search-advanced"
              >
                <FiX />
              </button>
            )}
          </div>

          {/* Botón Filtros Avanzados - POSICIONADO CORRECTAMENTE */}
          <div className="filters-trigger-wrapper" ref={filtersMenuRef}>
            <motion.button
              className={`filters-trigger-btn ${showAdvancedFilters ? 'active' : ''}`}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiSliders />
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="filters-badge">{activeFiltersCount}</span>
              )}
            </motion.button>
          </div>
        </div>

        {/* Filtros Rápidos Horizontales */}
        <div className="quick-filters-section">
          <div className="filters-scroll-advanced">
            {mainCategories.map(category => (
              <motion.button
                key={category.id}
                className={`filter-tab-advanced ${activeFilter === category.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(category.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="filter-icon-advanced">{category.icon}</span>
                <span className="filter-name-advanced">{category.name}</span>
                {category.count > 0 && (
                  <span className="filter-count-advanced">{category.count}</span>
                )}
              </motion.button>
            ))}

            {/* Botón "Más" - COMPLETO Y FUNCIONAL */}
            <div className="more-categories-wrapper-advanced" ref={moreMenuRef}>
              <motion.button
                className={`filter-tab-advanced more-categories-btn ${showMoreCategories ? 'active' : ''}`}
                onClick={() => setShowMoreCategories(!showMoreCategories)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="filter-icon-advanced">
                  <FiMoreHorizontal />
                </span>
                <span className="filter-name-advanced">Más</span>
                <FiChevronDown className={`more-chevron ${showMoreCategories ? 'rotated' : ''}`} />
              </motion.button>

              <AnimatePresence>
                {showMoreCategories && (
                  <motion.div
                    className="more-categories-menu-advanced"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    {additionalCategories.map(category => (
                      <button
                        key={category.id}
                        className={`more-category-item-advanced ${activeFilter === category.id ? 'active' : ''}`}
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

      {/* Panel de Filtros Avanzados */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            className="advanced-filters-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="filters-panel-content">
              {/* Precio */}
              <div className="filter-group-advanced">
                <h4>Rango de Precio</h4>
                <div className="price-range-inputs">
                  <div className="price-input">
                    <span>Desde</span>
                    <input
                      type="number"
                      value={selectedFilters.priceRange[0]}
                      onChange={(e) => handleFilterChange('priceRange', [
                        parseInt(e.target.value) || 0,
                        selectedFilters.priceRange[1]
                      ])}
                    />
                  </div>
                  <div className="price-input">
                    <span>Hasta</span>
                    <input
                      type="number"
                      value={selectedFilters.priceRange[1]}
                      onChange={(e) => handleFilterChange('priceRange', [
                        selectedFilters.priceRange[0],
                        parseInt(e.target.value) || 100000
                      ])}
                    />
                  </div>
                </div>
              </div>

              {/* Calificación Mínima */}
              <div className="filter-group-advanced">
                <h4>Calificación Mínima</h4>
                <div className="rating-filters">
                  {filterOptions.ratings.map(rating => (
                    <button
                      key={rating}
                      className={`rating-filter-btn ${selectedFilters.rating === rating ? 'active' : ''}`}
                      onClick={() => handleFilterChange('rating', rating)}
                    >
                      <FiStar />
                      <span>{rating}+</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ubicaciones */}
              <div className="filter-group-advanced">
                <h4>Ubicación</h4>
                <div className="location-filters">
                  {filterOptions.locations.map(location => (
                    <label key={location} className="checkbox-label-advanced">
                      <input
                        type="checkbox"
                        checked={selectedFilters.locations.includes(location)}
                        onChange={() => handleFilterChange('locations', location)}
                      />
                      <span className="checkmark"></span>
                      <span>{location}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Características */}
              <div className="filter-group-advanced">
                <h4>Características</h4>
                <div className="feature-filters">
                  {filterOptions.features.map(feature => (
                    <label key={feature} className="checkbox-label-advanced">
                      <input
                        type="checkbox"
                        checked={selectedFilters.features.includes(feature)}
                        onChange={() => handleFilterChange('features', feature)}
                      />
                      <span className="checkmark"></span>
                      <span>{feature}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Disponibilidad */}
              <div className="filter-group-advanced">
                <h4>Disponibilidad</h4>
                <div className="availability-filters">
                  {filterOptions.availabilityOptions.map(option => (
                    <label key={option.id} className="radio-label-advanced">
                      <input
                        type="radio"
                        name="availability"
                        checked={selectedFilters.availability === option.id}
                        onChange={() => handleFilterChange('availability', option.id)}
                      />
                      <span className="radiomark"></span>
                      <span>{option.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Ordenar por */}
              <div className="filter-group-advanced">
                <h4>Ordenar por</h4>
                <select
                  value={selectedFilters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="sort-select-advanced"
                >
                  {filterOptions.sortOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Acciones */}
              <div className="filter-actions-advanced">
                <button 
                  className="clear-filters-btn"
                  onClick={clearAllFilters}
                >
                  <FiX />
                  Limpiar Filtros
                </button>
                <button 
                  className="apply-filters-btn"
                  onClick={() => setShowAdvancedFilters(false)}
                >
                  <FiCheck />
                  Aplicar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Encabezado de Resultados */}
      <motion.div 
        className="results-header-advanced"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="results-info-advanced">
          <div className="results-count-advanced">
            <span className="count-number-advanced">{filteredServices.length}</span>
            <span className="count-label-advanced">
              {filteredServices.length === 1 ? 'servicio encontrado' : 'servicios encontrados'}
            </span>
          </div>
          
          {activeFiltersCount > 0 && (
            <div className="active-filters-indicator">
              <FiFilter />
              <span>{activeFiltersCount} filtro(s) activo(s)</span>
              <button 
                onClick={clearAllFilters}
                className="clear-filters-small"
              >
                Limpiar
              </button>
            </div>
          )}
        </div>

        {searchTerm && (
          <div className="search-term-advanced">
            Búsqueda: "<strong>{searchTerm}</strong>"
          </div>
        )}
      </motion.div>

      {/* Grid de Servicios Mejorado */}
      <motion.div 
        className="services-grid-advanced"
        layout
      >
        <AnimatePresence>
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id}
              className="service-card-advanced"
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ 
                y: -4,
                transition: { duration: 0.2 }
              }}
              onClick={() => handleServiceClick(service.id)}
            >
              <div className="service-image-advanced">
                <img src={service.image} alt={service.title} />
                {service.featured && (
                  <div className="featured-badge-advanced">
                    <FiAward />
                    Destacado
                  </div>
                )}
                <div className="service-overlay-advanced">
                  <div className="service-tags-advanced">
                    {service.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="service-tag-advanced">{tag}</span>
                    ))}
                  </div>
                  <span className="view-details-advanced">Ver detalles</span>
                </div>
              </div>

              <div className="service-content-advanced">
                <div className="service-header-advanced">
                  <h3 className="service-title-advanced">{service.title}</h3>
                  <div className="service-rating-advanced">
                    <FiStar className="rating-star" />
                    <span>{service.rating}</span>
                    <span className="reviews-count">({service.reviews})</span>
                  </div>
                </div>

                <p className="service-description-advanced">{service.description}</p>

                <div className="service-meta-advanced">
                  <div className="meta-item-advanced">
                    <FiMapPin />
                    <span>{service.location}</span>
                  </div>
                  <div className="meta-item-advanced">
                    <FiClock />
                    <span>{service.deliveryTime}</span>
                  </div>
                  <div className="meta-item-advanced availability-tag">
                    <span className={`availability-status ${service.availability}`}>
                      {service.availability === 'immediate' ? 'Inmediato' : 
                       service.availability === '24/7' ? '24/7' : 'Con cita'}
                    </span>
                  </div>
                </div>

                <div className="service-footer-advanced">
                  <div className="service-price-advanced">
                    {formatPrice(service.price)}
                  </div>
                  <button className="service-action-btn">
                    Contratar
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Estado Sin Resultados */}
      {filteredServices.length === 0 && (
        <motion.div 
          className="no-results-advanced"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="no-results-content-advanced">
            <h3>No encontramos servicios que coincidan con tus criterios</h3>
            <p>Prueba ajustando los filtros o los términos de búsqueda</p>
            <button 
              className="reset-all-filters-btn"
              onClick={clearAllFilters}
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