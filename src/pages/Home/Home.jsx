import React, { useState, useMemo } from 'react';
import SearchBar from '../../components/common/SearchBar/SearchBar';
import PropertyCard from '../../components/common/PropertyCard/PropertyCard';
import './Home.css';

const MOCK_PROPERTIES = [
  { id: 1, title: 'Apartamento El Poblado', location: 'Medellín', price: 1800000, rating: 4.8, reviewCount: 45, bedrooms: 3, bathrooms: 2, sqft: 85, type: 'Apartamento', images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=500&fit=crop'] },
  { id: 2, title: 'Casa Moderna', location: 'Sabaneta', price: 2500000, rating: 4.9, reviewCount: 23, bedrooms: 4, bathrooms: 3, sqft: 150, type: 'Casa', images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&h=500&fit=crop'] },
  { id: 3, title: 'Estudio Centro', location: 'Medellín', price: 950000, rating: 4.6, reviewCount: 67, bedrooms: 1, bathrooms: 1, sqft: 40, type: 'Estudio', images: ['https://images.unsplash.com/photo-1512197917215-82f0a50eb629?w=500&h=500&fit=crop'] },
  { id: 4, title: 'Penthouse', location: 'Laureles', price: 3200000, rating: 5.0, reviewCount: 12, bedrooms: 3, bathrooms: 2, sqft: 120, type: 'Penthouse', images: ['https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=500&h=500&fit=crop'] }
];

export default function Home() {
  const [searchParams, setSearchParams] = useState({ location: '', checkIn: '', checkOut: '', guests: '' });
  const [favorites, setFavorites] = useState(new Set());

  const filteredProperties = useMemo(() => {
    if (!searchParams.location) return MOCK_PROPERTIES;
    return MOCK_PROPERTIES.filter(p => 
      p.title.toLowerCase().includes(searchParams.location.toLowerCase()) ||
      p.location.toLowerCase().includes(searchParams.location.toLowerCase())
    );
  }, [searchParams.location]);

  return (
    <div className="home">
      <section className="home-hero">
        <div className="hero-content">
          <h1 className="hero-title">Encuentra tu propiedad perfecta</h1>
          <p className="hero-subtitle">Explora las mejores opciones de alquiler en tu zona</p>
          <SearchBar onSearch={setSearchParams} />
        </div>
      </section>
      <section className="home-properties">
        <div className="properties-container">
          {filteredProperties.length > 0 ? (
            <div className="properties-grid">
              {filteredProperties.map(p => (
                <PropertyCard key={p.id} property={p} onFavoriteToggle={() => {}} />
              ))}
            </div>
          ) : (
            <div className="empty-state">No se encontraron propiedades</div>
          )}
        </div>
      </section>
    </div>
  );
}
