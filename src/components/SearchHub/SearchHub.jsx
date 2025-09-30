import React, { useState, useEffect, useRef, useCallback } from 'react';
import debounce from 'lodash.debounce';
import './SearchHub.css';

// Iconos SVG para amenidades
const WifiIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
    <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
    <line x1="12" y1="20" x2="12.01" y2="20"/>
  </svg>
);

const ParkingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="19" cy="20" r="2"/>
    <circle cx="5" cy="20" r="2"/>
    <path d="M17 5H7a4 4 0 0 0-4 4v6h18V9a4 4 0 0 0-4-4z"/>
    <path d="M9 9v6"/>
    <path d="M15 9v6"/>
  </svg>
);

const PoolIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 20h20"/>
    <path d="M5 8h14"/>
    <path d="M10 4h4"/>
    <path d="M12 8v8"/>
  </svg>
);

const PetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
    <path d="M19 5c-3.5 0-7 3.5-7 7 0 1.5.5 2.5 1.5 3.5L12 21l1.5-5.5c1-.5 1.5-1.5 1.5-3.5 0-3.5-3.5-7-7-7z"/>
  </svg>
);

const KitchenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/>
    <path d="M9 9h6"/>
    <path d="M9 15h6"/>
    <path d="M9 12h6"/>
  </svg>
);

// Mock API fetch function con filtros
const fetchSearchResults = async (filters, signal, page = 1) => {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    setTimeout(() => {
      if (signal.aborted) {
        reject(new DOMException('Aborted', 'AbortError'));
        return;
      }

      // Mock data con filtros aplicados
      const mockProperties = [
        {
          id: 1,
          title: 'Apartamento moderno en el centro',
          location: 'Bogotá, Chapinero',
          price_per_night: 120,
          rating: 4.8,
          badges: ['Superhost', 'Nuevo'],
          image_url: 'https://picsum.photos/600/400?random=1',
          rooms: 2,
          guests: 4,
          amenities: ['wifi', 'cocina', 'parking'],
          description: 'Encantador apartamento completamente amueblado...'
        },
        {
          id: 2,
          title: 'Casa con piscina en las afueras',
          location: 'Medellín, Envigado',
          price_per_night: 200,
          rating: 4.9,
          badges: ['Destacada'],
          image_url: 'https://picsum.photos/600/400?random=2',
          rooms: 3,
          guests: 6,
          amenities: ['wifi', 'piscina', 'parking', 'mascotas'],
          description: 'Casa espaciosa con jardín y piscina privada...'
        },
        {
          id: 3,
          title: 'Estudio acogedor cerca del metro',
          location: 'Cali, San Fernando',
          price_per_night: 80,
          rating: 4.5,
          badges: ['Nuevo'],
          image_url: 'https://picsum.photos/600/400?random=3',
          rooms: 1,
          guests: 2,
          amenities: ['wifi', 'cocina'],
          description: 'Estudio moderno y funcional, ideal para viajes de negocios...'
        },
        {
          id: 4,
          title: 'Habitación privada en casa colonial',
          location: 'Cartagena, Centro Histórico',
          price_per_night: 60,
          rating: 4.7,
          badges: ['Superhost'],
          image_url: 'https://picsum.photos/600/400?random=4',
          rooms: 1,
          guests: 1,
          amenities: ['wifi'],
          description: 'Habitación privada en una hermosa casa colonial con patio...'
        }
      ];

      // Aplicar filtros simples
      let filtered = mockProperties;
      if (filters.location) {
        filtered = filtered.filter(p => p.location.toLowerCase().includes(filters.location.toLowerCase()));
      }
      if (filters.minPrice) {
        filtered = filtered.filter(p => p.price_per_night >= parseInt(filters.minPrice));
      }
      if (filters.maxPrice) {
        filtered = filtered.filter(p => p.price_per_night <= parseInt(filters.maxPrice));
      }
      if (filters.guests) {
        filtered = filtered.filter(p => p.guests >= parseInt(filters.guests));
      }
      if (filters.amenities && filters.amenities.length > 0) {
        filtered = filtered.filter(p => filters.amenities.every(a => p.amenities.includes(a)));
      }
      if (filters.propertyType) {
        // Simular tipo de propiedad
        filtered = filtered.filter(p => p.title.toLowerCase().includes(filters.propertyType.toLowerCase()));
      }

      // Ordenamiento
      if (filters.sortBy === 'price_low') {
        filtered.sort((a, b) => a.price_per_night - b.price_per_night);
      } else if (filters.sortBy === 'price_high') {
        filtered.sort((a, b) => b.price_per_night - a.price_per_night);
      } else if (filters.sortBy === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
      }

      // Paginación
      const perPage = 12;
      const start = (page - 1) * perPage;
      const end = Math.min(start + perPage, filtered.length);
      const results = filtered.slice(start, end);

      resolve({
        results,
        total: filtered.length,
        page,
        pageSize: perPage
      });
    }, 500); // Delay simulado
  });
};

const IntelligentSearchPanel = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    minPrice: '',
    maxPrice: '',
    guests: 1,
    amenities: [],
    propertyType: '',
    sortBy: 'relevance'
  });
  const [results, setResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // Sugerencias de autocomplete
  const mockSuggestions = ['Bogotá', 'Medellín', 'Cali', 'Cartagena', 'Santa Marta', 'Barranquilla', 'Pereira', 'Manizales'];
  useEffect(() => {
    if (query.length > 1) {
      const filteredSuggestions = mockSuggestions.filter(s =>
        s.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const performSearch = useCallback(async (searchFilters, pageNum = 1) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSearchResults(searchFilters, controller.signal, pageNum);
      if (pageNum === 1) {
        setResults(data.results);
      } else {
        setResults(prev => [...prev, ...data.results]);
      }
      setTotalResults(data.total);
      setLoading(false);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError('Error al cargar resultados. Intenta nuevamente.');
        setLoading(false);
      }
    }
  }, []);

  // Debounced search
  const debouncedSearch = useCallback(debounce((filters) => {
    setPage(1);
    performSearch(filters, 1);
  }, 400), [performSearch]);

  // Handle search input change
  const onQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setFilters(prev => ({ ...prev, location: val }));
    debouncedSearch({ ...filters, location: val });
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (key !== 'location') {
      debouncedSearch(newFilters);
    }
  };

  // Handle amenity toggle
  const toggleAmenity = (amenity) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    handleFilterChange('amenities', newAmenities);
  };

  // Clear filters
  const clearFilters = () => {
    const defaultFilters = {
      location: '',
      checkIn: '',
      checkOut: '',
      minPrice: '',
      maxPrice: '',
      guests: 1,
      amenities: [],
      propertyType: '',
      sortBy: 'relevance'
    };
    setFilters(defaultFilters);
    setQuery('');
    setResults([]);
    setTotalResults(0);
  };

  // Load more results
  const loadMore = () => {
    if (loading) return;
    if (results.length >= totalResults) return;
    const nextPage = page + 1;
    setPage(nextPage);
    performSearch(filters, nextPage);
  };

  // Keyboard navigation
  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="intelligent-search-panel">
      {/* Header */}
      <div className="search-header">
        <h1 className="search-title">Búsqueda Inteligente</h1>
        <button className="close-btn" onClick={onClose} aria-label="Cerrar panel">
          ×
        </button>
        <button className="clear-filters-btn" onClick={clearFilters}>
          Limpiar filtros
        </button>
      </div>

      {/* Barra de búsqueda principal */}
      <div className="main-search-bar">
        <div className="search-input-container">
          <input
            type="text"
            placeholder="Buscar ciudad, barrio o palabra clave..."
            value={query}
            onChange={onQueryChange}
            onKeyDown={onKeyDown}
            ref={inputRef}
            autoComplete="off"
            aria-label="Buscar ubicación"
          />
          {loading && <div className="search-loading">Buscando...</div>}
          {suggestions.length > 0 && (
            <ul className="autocomplete-suggestions">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => {
                    setQuery(suggestion);
                    setFilters(prev => ({ ...prev, location: suggestion }));
                    setSuggestions([]);
                    debouncedSearch({ ...filters, location: suggestion });
                  }}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Filtros organizados en secciones */}
      <div className="filters-section">
        {/* Ubicación y Fecha */}
        <div className="filter-group">
          <h3>Ubicación y Fecha</h3>
          <div className="filter-row">
            <input
              type="text"
              placeholder="Ubicación"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
            />
            <input
              type="date"
              value={filters.checkIn}
              onChange={(e) => handleFilterChange('checkIn', e.target.value)}
            />
            <input
              type="date"
              value={filters.checkOut}
              onChange={(e) => handleFilterChange('checkOut', e.target.value)}
            />
          </div>
        </div>

        {/* Precio y Capacidad */}
        <div className="filter-group">
          <h3>Precio y Capacidad</h3>
          <div className="filter-row">
            <input
              type="number"
              placeholder="Precio mínimo"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            />
            <input
              type="number"
              placeholder="Precio máximo"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            />
            <select
              value={filters.guests}
              onChange={(e) => handleFilterChange('guests', e.target.value)}
            >
              <option value={1}>1 huésped</option>
              <option value={2}>2 huéspedes</option>
              <option value={3}>3 huéspedes</option>
              <option value={4}>4+ huéspedes</option>
            </select>
          </div>
        </div>

        {/* Amenidades */}
        <div className="filter-group">
          <h3>Amenidades</h3>
          <div className="amenities-grid">
            {[
              { key: 'wifi', label: 'WiFi', icon: <WifiIcon /> },
              { key: 'parking', label: 'Parking', icon: <ParkingIcon /> },
              { key: 'piscina', label: 'Piscina', icon: <PoolIcon /> },
              { key: 'mascotas', label: 'Mascotas', icon: <PetIcon /> },
              { key: 'cocina', label: 'Cocina', icon: <KitchenIcon /> }
            ].map(({ key, label, icon }) => (
              <label key={key} className="amenity-item">
                <input
                  type="checkbox"
                  checked={filters.amenities.includes(key)}
                  onChange={() => toggleAmenity(key)}
                />
                {icon}
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Tipo de Propiedad y Ordenamiento */}
        <div className="filter-group">
          <h3>Tipo de Propiedad</h3>
          <div className="property-types">
            {['Casa', 'Apartamento', 'Estudio', 'Habitación'].map(type => (
              <button
                key={type}
                className={`property-type-btn ${filters.propertyType === type ? 'active' : ''}`}
                onClick={() => handleFilterChange('propertyType', filters.propertyType === type ? '' : type)}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="sort-by">
            <label>Ordenar por:</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <option value="relevance">Relevancia</option>
              <option value="price_low">Precio: bajo a alto</option>
              <option value="price_high">Precio: alto a bajo</option>
              <option value="rating">Valoración</option>
            </select>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="actions-section">
        <button className="search-btn" onClick={() => performSearch(filters)}>
          Buscar
        </button>
      </div>

      {/* Resultados */}
      <div className="results-section">
        {loading && <p className="loading">Cargando resultados...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && results.length === 0 && query && (
          <p className="no-results">No se encontraron propiedades que coincidan con tus criterios.</p>
        )}
        {totalResults > 0 && (
          <p className="results-count">{totalResults} resultados encontrados</p>
        )}
        <div className="properties-grid">
          {results.map((property) => (
            <div key={property.id} className="property-card">
              <img src={property.image_url} alt={property.title} />
              <div className="property-info">
                <h4>{property.title}</h4>
                <p className="location">{property.location}</p>
                <div className="rating">
                  ⭐ {property.rating} ({property.guests} huéspedes)
                </div>
                <p className="price">${property.price_per_night}/noche</p>
                <div className="badges">
                  {property.badges.map(badge => (
                    <span key={badge} className="badge">{badge}</span>
                  ))}
                </div>
                <p className="description">{property.description}</p>
                <div className="actions">
                  <button className="view-details-btn">Ver detalles</button>
                  <button className="book-btn">Reservar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {results.length > 0 && results.length < totalResults && (
          <button className="load-more-btn" onClick={loadMore} disabled={loading}>
            {loading ? 'Cargando...' : 'Cargar más'}
          </button>
        )}
      </div>
    </div>
  );
};

export default IntelligentSearchPanel;
