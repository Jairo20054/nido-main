import React, { useState, useEffect } from 'react';
import SearchBar from '../../components/common/SearchBar/SearchBar';
import PropertyCard from '../../components/common/PropertyCard/PropertyCard';
import { api } from '../../services/api';
import './HomeAirbnb.css';

const HomeAirbnb = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Cargar propiedades desde API
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        const response = await api.get('/properties', {
          page: 1,
          limit: 50
        });

        if (response.success && Array.isArray(response.data)) {
          const transformed = response.data.map(prop => ({
            id: prop._id || prop.id,
            title: prop.title || 'Sin título',
            location: prop.city || prop.location || 'Ubicación desconocida',
            price: prop.price || 0,
            priceType: prop.priceType || 'por mes',
            images: prop.images || ['/api/placeholder/400/300'],
            description: prop.description || '',
            rating: prop.rating || 4.8,
            reviews: prop.reviews || 0,
            specs: {
              rooms: prop.bedrooms || 0,
              bathrooms: prop.bathrooms || 0,
              area: prop.area || 0,
              parking: prop.parking || false
            }
          }));
          setProperties(transformed);
          setFilteredProperties(transformed);
        }
      } catch (err) {
        console.error('Error cargando propiedades:', err);
        setError('No se pudieron cargar las propiedades');
        // Mock data como fallback
        setProperties(getMockProperties());
        setFilteredProperties(getMockProperties());
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, []);

  // Guardar favoritos en localStorage
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleSearch = (searchForm) => {
    const filtered = properties.filter(prop => {
      const matchLocation = prop.location
        .toLowerCase()
        .includes(searchForm.location.toLowerCase());
      
      const matchGuests = !searchForm.guests || searchForm.guests <= (prop.specs.rooms * 2 || 2);

      return matchLocation && matchGuests;
    });

    setFilteredProperties(filtered);
  };

  const handleFavorite = (propertyId, isFavorited) => {
    if (isFavorited) {
      setFavorites([...favorites, propertyId]);
    } else {
      setFavorites(favorites.filter(id => id !== propertyId));
    }
  };

  return (
    <div className="home-airbnb">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-overlay"></div>
          <h1 className="hero-title">Explora lugares únicos</h1>
        </div>
        <SearchBar onSearch={handleSearch} />
      </section>

      {/* Main Content */}
      <main className="home-content">
        {/* Header con título */}
        <div className="content-header">
          <h2 className="section-title">
            {filteredProperties.length > 0
              ? `${filteredProperties.length} lugares disponibles`
              : 'Lugares disponibles'}
          </h2>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="skeleton-grid">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-image"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line short"></div>
                    <div className="skeleton-line"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button onClick={() => window.location.reload()} className="retry-button">
              Reintentar
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProperties.length === 0 && !error && (
          <div className="empty-container">
            <p className="empty-message">No se encontraron propiedades</p>
            <p className="empty-submessage">Prueba con otros criterios de búsqueda</p>
          </div>
        )}

        {/* Grid de propiedades */}
        {!loading && filteredProperties.length > 0 && (
          <div className="properties-grid">
            {filteredProperties.map(property => (
              <PropertyCard
                key={property.id}
                property={property}
                onFavorite={handleFavorite}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

// Mock data como fallback
const getMockProperties = () => {
  return [
    {
      id: 1,
      title: 'Apartamento luminoso en el Centro',
      location: 'Centro, Bogotá',
      price: 2500000,
      priceType: 'por mes',
      images: ['/api/placeholder/400/300'],
      description: 'Hermoso apartamento con vista a la ciudad, totalmente amoblado',
      rating: 4.9,
      reviews: 48,
      specs: { rooms: 3, bathrooms: 2, area: 85, parking: true }
    },
    {
      id: 2,
      title: 'Casa moderna en Chapinero',
      location: 'Chapinero, Bogotá',
      price: 3200000,
      priceType: 'por mes',
      images: ['/api/placeholder/400/300'],
      description: 'Casa de 3 pisos con terraza y jardín',
      rating: 4.8,
      reviews: 32,
      specs: { rooms: 4, bathrooms: 3, area: 120, parking: true }
    },
    {
      id: 3,
      title: 'Loft en Usaquén',
      location: 'Usaquén, Bogotá',
      price: 1800000,
      priceType: 'por mes',
      images: ['/api/placeholder/400/300'],
      description: 'Loft industrial con diseño moderno',
      rating: 4.7,
      reviews: 25,
      specs: { rooms: 2, bathrooms: 1, area: 65, parking: false }
    }
  ];
};

export default HomeAirbnb;
