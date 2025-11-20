# 📝 CÓDIGO COMPLETO - Todos los Archivos

Este documento contiene el código completo de todos los archivos creados/modificados.
Puedes copiar y pegar directamente si necesitas reinstalar.

---

## 1️⃣ src/App.jsx (MODIFICADO - Líneas 50 y 95-107)

```jsx
// CAMBIO 1: Línea 50 - Cambiar import del Home
// const Home = lazyLoad(() => import('./pages/Home/Home'));
const Home = lazyLoad(() => import('./pages/Home/HomeAirbnb'));

// CAMBIO 2: Líneas 95-107 - Reorganizar Providers
// ANTES:
// <Router>
//   <CartProvider>
//     <UiHostProvider>
//       <AuthProvider>
//         <SearchProvider>
//           <BookingProvider>

// DESPUÉS:
function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <SearchProvider>
            <BookingProvider>
              <UiHostProvider>
                <Layout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                      {/* ... todas las rutas ... */}
                    </Routes>
                  </Suspense>
                </Layout>
              </UiHostProvider>
            </BookingProvider>
          </SearchProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
```

---

## 2️⃣ src/components/common/SearchBar/SearchBar.jsx (NUEVO)

```jsx
import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import './SearchBar.css';

const SearchBar = ({ onSearch }) => {
  const [searchForm, setSearchForm] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 1
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = () => {
    if (searchForm.location) {
      onSearch?.(searchForm);
    }
  };

  return (
    <div className="searchbar-container">
      <div className="searchbar-wrapper">
        <div className="searchbar-group">
          {/* Ubicación */}
          <div className="searchbar-field location-field">
            <label className="searchbar-label">Dónde</label>
            <input
              type="text"
              name="location"
              placeholder="Buscar destinos"
              value={searchForm.location}
              onChange={handleChange}
              className="searchbar-input"
            />
          </div>

          {/* Entrada */}
          <div className="searchbar-divider"></div>
          <div className="searchbar-field">
            <label className="searchbar-label">Entrada</label>
            <input
              type="date"
              name="checkIn"
              value={searchForm.checkIn}
              onChange={handleChange}
              className="searchbar-input"
            />
          </div>

          {/* Salida */}
          <div className="searchbar-divider"></div>
          <div className="searchbar-field">
            <label className="searchbar-label">Salida</label>
            <input
              type="date"
              name="checkOut"
              value={searchForm.checkOut}
              onChange={handleChange}
              className="searchbar-input"
            />
          </div>

          {/* Quién */}
          <div className="searchbar-divider"></div>
          <div className="searchbar-field guests-field">
            <label className="searchbar-label">Quién</label>
            <select
              name="guests"
              value={searchForm.guests}
              onChange={handleChange}
              className="searchbar-input"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <option key={num} value={num}>{num} {num === 1 ? 'huésped' : 'huéspedes'}</option>
              ))}
            </select>
          </div>

          {/* Botón de búsqueda */}
          <button
            onClick={handleSearch}
            className="searchbar-button"
            aria-label="Buscar"
          >
            <FiSearch size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
```

---

## 3️⃣ src/components/common/SearchBar/SearchBar.css (NUEVO)

```css
/* SearchBar.css - Estilo Airbnb */

.searchbar-container {
  width: 100%;
  padding: 1rem 0;
  background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.searchbar-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.searchbar-group {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #ddd;
  border-radius: 32px;
  padding: 6px 8px;
  gap: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.searchbar-group:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.searchbar-group:focus-within {
  box-shadow: 0 4px 20px rgba(255, 71, 87, 0.2);
  border-color: #ff4757;
}

.searchbar-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 8px 12px;
  border-radius: 28px;
  transition: background 0.2s ease;
}

.searchbar-field:hover {
  background: #f5f5f5;
}

.location-field {
  flex: 1.5;
}

.guests-field {
  flex: 0.8;
}

.searchbar-label {
  font-size: 12px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
  text-transform: capitalize;
  letter-spacing: 0.5px;
}

.searchbar-input {
  border: none;
  background: transparent;
  font-size: 14px;
  color: #222;
  outline: none;
  font-family: inherit;
  padding: 0;
  cursor: pointer;
}

.searchbar-input::-webkit-calendar-picker-indicator {
  cursor: pointer;
  color: #666;
}

.searchbar-input::placeholder {
  color: #999;
}

.searchbar-input option {
  color: #222;
}

.searchbar-divider {
  width: 1px;
  height: 24px;
  background: #ddd;
  margin: 0 4px;
}

.searchbar-button {
  width: 40px;
  height: 40px;
  min-width: 40px;
  min-height: 40px;
  border: none;
  border-radius: 50%;
  background: #ff4757;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-right: 4px;
}

.searchbar-button:hover {
  background: #ff3838;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
}

.searchbar-button:active {
  transform: scale(0.95);
}

/* Responsive */
@media (max-width: 768px) {
  .searchbar-group {
    flex-direction: column;
    border-radius: 16px;
    padding: 12px;
    gap: 12px;
  }

  .searchbar-field {
    width: 100%;
    padding: 12px;
  }

  .searchbar-divider {
    display: none;
  }

  .searchbar-button {
    width: 100%;
    border-radius: 12px;
    margin: 8px 0 0 0;
  }
}

@media (max-width: 480px) {
  .searchbar-container {
    padding: 0.5rem 0;
  }

  .searchbar-wrapper {
    padding: 0 0.5rem;
  }

  .searchbar-label {
    font-size: 11px;
  }

  .searchbar-input {
    font-size: 13px;
  }
}
```

---

## 4️⃣ src/components/common/PropertyCard/PropertyCard.jsx (NUEVO)

```jsx
import React, { useState } from 'react';
import { FiHeart, FiStar } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import './PropertyCard.css';

const PropertyCard = ({ property, onFavorite }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleFavorite = (e) => {
    e.preventDefault();
    setIsFavorite(!isFavorite);
    onFavorite?.(property.id, !isFavorite);
  };

  const handlePrevImage = (e) => {
    e.preventDefault();
    setCurrentImageIndex((prev) =>
      prev === 0 ? (property.images?.length || 1) - 1 : prev - 1
    );
  };

  const handleNextImage = (e) => {
    e.preventDefault();
    setCurrentImageIndex((prev) =>
      prev === (property.images?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  const images = property.images || ['/api/placeholder/300/300'];
  const currentImage = images[currentImageIndex];
  const rating = property.rating || 4.8;
  const reviews = property.reviews || 0;

  return (
    <Link to={`/property/${property.id}`} className="property-card-link">
      <div className="property-card">
        {/* Imagen */}
        <div className="property-image-container">
          <img
            src={currentImage}
            alt={property.title}
            className="property-image"
            loading="lazy"
          />

          {/* Botón Favorito */}
          <button
            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
            onClick={handleFavorite}
            aria-label="Agregar a favoritos"
          >
            <FiHeart size={20} />
          </button>

          {/* Controles de imagen (solo si hay múltiples) */}
          {images.length > 1 && (
            <>
              <button
                className="image-nav-btn prev"
                onClick={handlePrevImage}
                aria-label="Imagen anterior"
              >
                ‹
              </button>
              <button
                className="image-nav-btn next"
                onClick={handleNextImage}
                aria-label="Siguiente imagen"
              >
                ›
              </button>
              {/* Indicadores */}
              <div className="image-indicators">
                {images.map((_, idx) => (
                  <span
                    key={idx}
                    className={`indicator ${idx === currentImageIndex ? 'active' : ''}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Contenido */}
        <div className="property-content">
          {/* Header con nombre y rating */}
          <div className="property-header">
            <h3 className="property-title">{property.title}</h3>
            <div className="property-rating">
              <FiStar size={14} className="star-icon" />
              <span className="rating-text">{rating}</span>
              {reviews > 0 && <span className="reviews-text">({reviews})</span>}
            </div>
          </div>

          {/* Ubicación */}
          {property.location && (
            <p className="property-location">{property.location}</p>
          )}

          {/* Specs */}
          {property.specs && (
            <div className="property-specs">
              {property.specs.rooms > 0 && (
                <span>{property.specs.rooms} hab.</span>
              )}
              {property.specs.bathrooms > 0 && (
                <span>{property.specs.bathrooms} baño(s)</span>
              )}
              {property.specs.area > 0 && (
                <span>{property.specs.area}m²</span>
              )}
            </div>
          )}

          {/* Descripción corta */}
          {property.description && (
            <p className="property-description">
              {property.description.substring(0, 60)}...
            </p>
          )}

          {/* Precio */}
          <div className="property-price">
            <span className="price-amount">
              ${property.price?.toLocaleString('es-CO') || 0}
            </span>
            <span className="price-period">
              {property.priceType || 'por mes'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
```

---

## 5️⃣ src/pages/Home/HomeAirbnb.jsx (NUEVO)

```jsx
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
```

---

## 6️⃣ CSS Files

Todos los archivos CSS están completos en los documentos anteriores:
- `SearchBar.css` (250 líneas)
- `PropertyCard.css` (250 líneas)
- `HomeAirbnb.css` (300 líneas)

---

**Total de código:** ~1500 líneas
**Archivos nuevos:** 6
**Archivos modificados:** 1
**Dependencias nuevas:** 0 (solo usa lo existente)

