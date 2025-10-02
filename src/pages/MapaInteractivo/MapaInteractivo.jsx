import React, { useState, useEffect } from 'react';
import './MapaInteractivo.css';

// ========== COMPONENTES DE ICONOS ==========
const MapPinIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
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

const LayersIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
  </svg>
);

const MapaInteractivo = () => {
  // ========== ESTADOS ==========
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [filters, setFilters] = useState({
    precioMin: '',
    precioMax: '',
    habitaciones: '',
    tipo: 'todos'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [mapLayer, setMapLayer] = useState('satelite');
  const [showFilters, setShowFilters] = useState(false);

  // ========== DATOS MOCK DE PROPIEDADES ==========
  const [properties] = useState([
    {
      id: 1,
      titulo: 'Apartamento Moderno Centro',
      precio: 2500000,
      ubicacion: 'Centro Histórico',
      habitaciones: 3,
      banos: 2,
      area: 85,
      lat: 4.6097,
      lng: -74.0817,
      tipo: 'apartamento',
      imagen: '/api/placeholder/300/200',
      descripcion: 'Hermoso apartamento completamente remodelado en el corazón de la ciudad.'
    },
    {
      id: 2,
      titulo: 'Casa Familiar Zona Norte',
      precio: 4500000,
      ubicacion: 'Zona Norte',
      habitaciones: 4,
      banos: 3,
      area: 150,
      lat: 4.6500,
      lng: -74.1000,
      tipo: 'casa',
      imagen: '/api/placeholder/300/200',
      descripcion: 'Casa espaciosa perfecta para familias, con jardín y garaje.'
    },
    {
      id: 3,
      titulo: 'Loft Industrial',
      precio: 1800000,
      ubicacion: 'Zona Industrial',
      habitaciones: 1,
      banos: 1,
      area: 60,
      lat: 4.5800,
      lng: -74.1200,
      tipo: 'loft',
      imagen: '/api/placeholder/300/200',
      descripcion: 'Loft moderno con diseño industrial, ideal para profesionales.'
    }
  ]);

  // ========== MANEJADORES ==========
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handlePropertyClick = (property) => {
    setSelectedProperty(property);
  };

  const closePropertyDetail = () => {
    setSelectedProperty(null);
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.ubicacion.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrecio = (!filters.precioMin || property.precio >= parseInt(filters.precioMin)) &&
                         (!filters.precioMax || property.precio <= parseInt(filters.precioMax));
    const matchesHabitaciones = !filters.habitaciones || property.habitaciones >= parseInt(filters.habitaciones);
    const matchesTipo = filters.tipo === 'todos' || property.tipo === filters.tipo;

    return matchesSearch && matchesPrecio && matchesHabitaciones && matchesTipo;
  });

  // ========== RENDERIZADO ==========
  return (
    <div className="mapa-interactivo">
      {/* Header con controles */}
      <div className="mapa-header">
        <div className="mapa-title-section">
          <h1 className="mapa-title">Mapa Interactivo</h1>
          <p className="mapa-subtitle">Explora propiedades en tiempo real</p>
        </div>

        <div className="mapa-controls">
          {/* Barra de búsqueda */}
          <div className="search-bar">
            <SearchIcon />
            <input
              type="text"
              placeholder="Buscar por ubicación o título..."
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

          {/* Selector de capas */}
          <div className="layer-selector">
            <LayersIcon />
            <select
              value={mapLayer}
              onChange={(e) => setMapLayer(e.target.value)}
              className="layer-select"
            >
              <option value="satelite">Satélite</option>
              <option value="terreno">Terreno</option>
              <option value="calles">Calles</option>
            </select>
          </div>
        </div>
      </div>

      {/* Panel de filtros expandible */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            <div className="filter-group">
              <label className="filter-label">Precio Mínimo</label>
              <input
                type="number"
                placeholder="Ej: 1000000"
                value={filters.precioMin}
                onChange={(e) => handleFilterChange('precioMin', e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Precio Máximo</label>
              <input
                type="number"
                placeholder="Ej: 5000000"
                value={filters.precioMax}
                onChange={(e) => handleFilterChange('precioMax', e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Mínimo Habitaciones</label>
              <select
                value={filters.habitaciones}
                onChange={(e) => handleFilterChange('habitaciones', e.target.value)}
                className="filter-select"
              >
                <option value="">Todas</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Tipo de Propiedad</label>
              <select
                value={filters.tipo}
                onChange={(e) => handleFilterChange('tipo', e.target.value)}
                className="filter-select"
              >
                <option value="todos">Todos</option>
                <option value="apartamento">Apartamento</option>
                <option value="casa">Casa</option>
                <option value="loft">Loft</option>
              </select>
            </div>
          </div>

          <div className="filters-actions">
            <button
              className="clear-filters-btn"
              onClick={() => setFilters({ precioMin: '', precioMax: '', habitaciones: '', tipo: 'todos' })}
            >
              Limpiar Filtros
            </button>
            <span className="results-count">
              {filteredProperties.length} propiedades encontradas
            </span>
          </div>
        </div>
      )}

      {/* Contenedor principal mapa y lista */}
      <div className="mapa-content">
        {/* Mapa simulado */}
        <div className="mapa-container">
          <div className="mapa-viewport">
            {/* Placeholder del mapa */}
            <div className="mapa-placeholder">
              <div className="mapa-background" data-layer={mapLayer}>
                {/* Marcadores de propiedades */}
                {filteredProperties.map(property => (
                  <div
                    key={property.id}
                    className={`property-marker ${selectedProperty?.id === property.id ? 'selected' : ''}`}
                    style={{
                      left: `${(property.lng + 74.12) * 100}%`,
                      top: `${(4.65 - property.lat) * 100}%`
                    }}
                    onClick={() => handlePropertyClick(property)}
                  >
                    <MapPinIcon size={24} />
                    <div className="marker-price">
                      ${property.precio.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Controles del mapa */}
              <div className="mapa-controls-overlay">
                <button className="mapa-zoom-in">+</button>
                <button className="mapa-zoom-out">-</button>
              </div>
            </div>
          </div>
        </div>

        {/* Panel lateral con lista de propiedades */}
        <div className="properties-panel">
          <div className="properties-header">
            <h3 className="properties-title">Propiedades ({filteredProperties.length})</h3>
          </div>

          <div className="properties-list">
            {filteredProperties.map(property => (
              <div
                key={property.id}
                className={`property-card ${selectedProperty?.id === property.id ? 'selected' : ''}`}
                onClick={() => handlePropertyClick(property)}
              >
                <div className="property-image">
                  <img src={property.imagen} alt={property.titulo} />
                </div>

                <div className="property-info">
                  <h4 className="property-title">{property.titulo}</h4>
                  <p className="property-location">{property.ubicacion}</p>
                  <div className="property-details">
                    <span className="property-price">${property.precio.toLocaleString()}</span>
                    <span className="property-specs">
                      {property.habitaciones} hab • {property.area}m²
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de detalle de propiedad */}
      {selectedProperty && (
        <div className="property-modal-overlay" onClick={closePropertyDetail}>
          <div className="property-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closePropertyDetail}>×</button>

            <div className="modal-content">
              <div className="modal-image">
                <img src={selectedProperty.imagen} alt={selectedProperty.titulo} />
              </div>

              <div className="modal-details">
                <h2 className="modal-title">{selectedProperty.titulo}</h2>
                <p className="modal-location">{selectedProperty.ubicacion}</p>

                <div className="modal-price-section">
                  <span className="modal-price">${selectedProperty.precio.toLocaleString()}</span>
                  <span className="modal-price-unit">COP</span>
                </div>

                <div className="modal-specs">
                  <div className="spec-item">
                    <span className="spec-label">Habitaciones:</span>
                    <span className="spec-value">{selectedProperty.habitaciones}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Baños:</span>
                    <span className="spec-value">{selectedProperty.banos}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Área:</span>
                    <span className="spec-value">{selectedProperty.area}m²</span>
                  </div>
                </div>

                <p className="modal-description">{selectedProperty.descripcion}</p>

                <div className="modal-actions">
                  <button className="contact-btn">Contactar Agente</button>
                  <button className="favorite-btn">Agregar a Favoritos</button>
                  <button className="share-btn">Compartir</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapaInteractivo;
