import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingState } from '../../components/ui/LoadingState';
import { api } from '../../lib/apiClient';
import { PropertyCard } from '../properties/PropertyCard';

const FILTER_CHIPS = [
  { id: 'all', label: 'Todo' },
  { id: 'apartment', label: 'Apartamento' },
  { id: 'house', label: 'Casa' },
  { id: 'studio', label: 'Estudio' },
  { id: 'furnished', label: 'Amoblado' },
  { id: 'pets', label: 'Mascotas OK' },
  { id: 'parking', label: 'Con parqueadero' },
];

export function HomePage() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchFilters, setSearchFilters] = useState({
    city: '',
    budget: '',
    bedrooms: '',
  });

  useEffect(() => {
    let active = true;

    api
      .get('/properties/featured', { auth: false })
      .then((response) => {
        if (active) {
          setProperties(response.data || []);
        }
      })
      .catch(() => {
        if (active) {
          setProperties([]);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (searchFilters.city) params.set('city', searchFilters.city);
    if (searchFilters.budget) params.set('maxRent', searchFilters.budget);
    if (searchFilters.bedrooms) params.set('bedrooms', searchFilters.bedrooms);
    if (activeFilter !== 'all') params.set('filter', activeFilter);

    navigate(`/properties?${params.toString()}`);
  };

  const handleFilterClick = (filterId) => {
    setActiveFilter(filterId);
  };

  const displayCity = searchFilters.city || 'Colombia';
  const propertyCount = properties.length;

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero__content">
          <h1 className="home-hero__title">Encuentra tu próximo hogar</h1>
          <p className="home-hero__subtitle">Arriendo residencial · Colombia</p>

          <form className="home-search" onSubmit={handleSearch}>
            <div className="home-search__field">
              <input
                type="text"
                placeholder="¿Dónde?"
                value={searchFilters.city}
                onChange={(e) => setSearchFilters({ ...searchFilters, city: e.target.value })}
              />
            </div>

            <div className="home-search__divider"></div>

            <div className="home-search__field">
              <input
                type="number"
                placeholder="Presupuesto"
                value={searchFilters.budget}
                onChange={(e) => setSearchFilters({ ...searchFilters, budget: e.target.value })}
              />
            </div>

            <div className="home-search__divider"></div>

            <div className="home-search__field">
              <input
                type="number"
                placeholder="Cualquiera"
                value={searchFilters.bedrooms}
                onChange={(e) => setSearchFilters({ ...searchFilters, bedrooms: e.target.value })}
              />
            </div>

            <button type="submit" className="home-search__button">
              Buscar <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </section>

      {/* Filter Chips */}
      <div className="home-filters">
        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip.id}
            className={`home-filter-chip ${activeFilter === chip.id ? 'home-filter-chip--active' : ''}`}
            onClick={() => handleFilterClick(chip.id)}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Results Counter */}
      <div className="home-counter">
        {propertyCount} propiedades en {displayCity}
      </div>

      {/* Properties Grid */}
      <section className="home-grid">
        {loading ? (
          <LoadingState label="Cargando propiedades..." />
        ) : properties.length > 0 ? (
          <div className="property-grid">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No hay propiedades disponibles"
            description="Intenta cambiar tus filtros o búsqueda."
          />
        )}
      </section>
    </div>
  );
}
