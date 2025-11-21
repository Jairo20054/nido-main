// src/pages/Search/Search.jsx (Modified minimally for integration; added responsiveness notes in CSS if needed, but assuming existing CSS handles it)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SearchFilters from '../../components/Search/SearchFilters';
import PropertyGridOptimized from '../../components/common/PropertyGrid/PropertyGridOptimized';
import MapView from '../../components/Search/MapView/MapView';
import ViewToggle from '../../components/Search/ViewToggle/ViewToggle';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage/ErrorMessage';
import SortDropdown from '../../components/Search/SortDropdown/SortDropdown';
import ResultsCounter from '../../components/Search/ResultsCounter/ResultsCounter';
import SearchBar from '../../components/common/SearchBar/SearchBar';
import './Search.css';

const Search = () => {
  const navigate = useNavigate();
  const [urlParams, setUrlParams] = useSearchParams();
  
  // Estados principales
  const [searchParams, setSearchParams] = useState({});
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('preferredViewMode') || 'grid';
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [filtersVisible, setFiltersVisible] = useState(false);

  // Parsear parámetros de URL
  const parseUrlParams = useCallback(() => {
    const params = Object.fromEntries(urlParams.entries());
    return {
      city: params.city || '',
      checkIn: params.checkIn || '',
      checkOut: params.checkOut || '',
      guests: parseInt(params.guests) || 1,
      priceMin: params.priceMin ? parseInt(params.priceMin) : null,
      priceMax: params.priceMax ? parseInt(params.priceMax) : null,
      propertyType: params.propertyType || '',
      amenities: params.amenities ? params.amenities.split(',') : [],
    };
  }, [urlParams]);

  // Actualizar URL con nuevos parámetros
  const updateUrlParams = useCallback((newParams) => {
    const params = new URLSearchParams();
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '' && value !== false) {
        if (Array.isArray(value) && value.length > 0) {
          params.set(key, value.join(','));
        } else if (value !== 1 || key !== 'guests') {
          params.set(key, value.toString());
        }
      }
    });

    setUrlParams(params, { replace: true });
  }, [setUrlParams]);

  // Ejecutar búsqueda en backend
  const executeSearch = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validaciones
      if (!params.city?.trim()) {
        throw new Error('La ubicación es requerida para realizar la búsqueda');
      }

      // Build API query string
      const queryParams = new URLSearchParams();
      queryParams.append('city', params.city);
      if (params.checkIn) queryParams.append('checkIn', params.checkIn);
      if (params.checkOut) queryParams.append('checkOut', params.checkOut);
      if (params.guests) queryParams.append('guests', params.guests);
      if (params.priceMin !== null) queryParams.append('priceMin', params.priceMin);
      if (params.priceMax !== null) queryParams.append('priceMax', params.priceMax);
      if (params.propertyType) queryParams.append('propertyType', params.propertyType);
      if (params.amenities?.length > 0) queryParams.append('amenities', params.amenities.join(','));

      const response = await fetch(`/api/properties/search?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Error al realizar la búsqueda');
      }

      const data = await response.json();
      setProperties(data.data?.properties || []);
    } catch (err) {
      console.error("Search error:", err);
      setError(err.message || 'Error al realizar la búsqueda. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Efecto para inicializar búsqueda desde URL
  useEffect(() => {
    const initialParams = parseUrlParams();
    setSearchParams(initialParams);
    
    if (initialParams.city) {
      executeSearch(initialParams);
    } else {
      setLoading(false);
    }
  }, [parseUrlParams, executeSearch]);

  // Manejar cambios en filtros
  const handleFilterChange = useCallback((newFilters) => {
    const updatedParams = { ...searchParams, ...newFilters };
    setSearchParams(updatedParams);
    updateUrlParams(updatedParams);
    executeSearch(updatedParams);
  }, [searchParams, updateUrlParams, executeSearch]);

  // Manejar cambio de vista
  const handleViewChange = useCallback((newView) => {
    setViewMode(newView);
    localStorage.setItem('preferredViewMode', newView);
  }, []);

  // Manejar ordenamiento
  const handleSortChange = useCallback((newSort) => {
    setSortBy(newSort);
    // Aquí puedes implementar la lógica de ordenamiento
    const sortedProperties = [...properties].sort((a, b) => {
      switch (newSort) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'distance':
          return a.distance - b.distance;
        default:
          return 0;
      }
    });
    setProperties(sortedProperties);
  }, [properties]);

  // Reintentar búsqueda
  const handleRetry = useCallback(() => {
    if (searchParams.location) {
      executeSearch(searchParams);
    }
  }, [searchParams, executeSearch]);

  // Limpiar filtros
  const handleClearFilters = useCallback(() => {
    const basicParams = {
      location: searchParams.location,
      checkIn: searchParams.checkIn,
      checkOut: searchParams.checkOut,
      guests: searchParams.guests || 1
    };
    setSearchParams(basicParams);
    updateUrlParams(basicParams);
    executeSearch(basicParams);
  }, [searchParams, updateUrlParams, executeSearch]);

  // Título dinámico mejorado
  const pageTitle = useMemo(() => {
    if (!searchParams.city) return 'Buscar Alojamientos';
    
    const { city, checkIn, checkOut, guests } = searchParams;
    let title = `Alojamientos en ${city}`;
    
    if (checkIn && checkOut) {
      const startDate = new Date(checkIn).toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short' 
      });
      const endDate = new Date(checkOut).toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short' 
      });
      title += ` • ${startDate} - ${endDate}`;
    }
    
    if (guests > 1) {
      title += ` • ${guests} huéspedes`;
    }
    
    return title;
  }, [searchParams]);

  // Breadcrumb
  const breadcrumb = useMemo(() => {
    return [
      { label: 'Inicio', path: '/' },
      { label: 'Búsqueda', path: '/search' },
      ...(searchParams.city ? [{ label: searchParams.city }] : [])
    ];
  }, [searchParams.city]);

  // Mostrar estado de error
  if (error) {
    return (
      <div className="search-page">
        <div className="search-header">
          <h1>Error en la búsqueda</h1>
        </div>
        <ErrorMessage 
          message={error} 
          onRetry={handleRetry}
          className="search-error"
        />
      </div>
    );
  }

  return (
    <div className="search-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb" aria-label="Navegación">
        {breadcrumb.map((item, index) => (
          <span key={index} className="breadcrumb-item">
            {item.path ? (
              <button 
                onClick={() => navigate(item.path)}
                className="breadcrumb-link"
              >
                {item.label}
              </button>
            ) : (
              <span className="breadcrumb-current">{item.label}</span>
            )}
            {index < breadcrumb.length - 1 && (
              <span className="breadcrumb-separator" aria-hidden="true">›</span>
            )}
          </span>
        ))}
      </nav>

      {/* Barra de búsqueda estilo Airbnb */}
      <SearchBar
        onSearch={handleFilterChange}
      />

      {/* Header */}
      <header className="search-header">
        <div className="header-content">
          <h1 className="search-title">{pageTitle}</h1>
          <ResultsCounter 
            count={properties.length} 
            loading={loading || isLoading}
            location={searchParams.location}
          />
        </div>
        
        <div className="header-controls">
          <button 
            className="filters-toggle mobile-only"
            onClick={() => setFiltersVisible(!filtersVisible)}
            aria-expanded={filtersVisible}
          >
            Filtros {filtersVisible ? '×' : '☰'}
          </button>
          
          <SortDropdown 
            value={sortBy} 
            onChange={handleSortChange}
            disabled={loading || properties.length === 0}
          />
          
          <ViewToggle 
            currentView={viewMode} 
            onViewChange={handleViewChange}
            disabled={loading || properties.length === 0}
          />
        </div>
      </header>

      {/* Layout principal */}
      <div className="search-layout">
      {/* Filtros siempre visibles debajo de la barra de búsqueda */}
      <aside 
        className="filters-container"
        aria-label="Filtros de búsqueda"
      >
        <div className="filters-header">
          <h2>Filtros</h2>
          <button 
            className="clear-filters"
            onClick={handleClearFilters}
            disabled={loading}
          >
            Limpiar
          </button>
        </div>
        
        <SearchFilters 
          filters={searchParams} 
          onFilterChange={handleFilterChange}
          disabled={loading}
        />
      </aside>

        {/* Resultados */}
        <main className="results-container" role="main">
          {loading ? (
            <div className="loading-container">
              <LoadingSpinner />
              <p className="loading-text">
                Buscando alojamientos en {searchParams.city}...
              </p>
            </div>
          ) : properties.length === 0 ? (
            <EmptyState 
              title="No encontramos propiedades que coincidan"
              description="Intenta ajustar tus filtros de búsqueda o buscar en otra ubicación"
              actionLabel="Limpiar filtros"
              onAction={handleClearFilters}
            />
          ) : (
            <div className="results-content">
              {viewMode === 'grid' ? (
                <PropertyGridOptimized 
                  properties={properties} 
                  isLoading={loading}
                  onCardClick={(property) => navigate(`/property/${property._id}`)}
                />
              ) : (
                <MapView 
                  properties={properties}
                  center={searchParams.city}
                  className="search-results-map"
                />
              )}
            </div>
          )}
        </main>
      </div>

      {/* Overlay para filtros móviles */}
      {filtersVisible && (
        <div 
          className="filters-overlay mobile-only"
          onClick={() => setFiltersVisible(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default Search;