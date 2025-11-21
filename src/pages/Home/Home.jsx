import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../../components/common/SearchBar/SearchBar';
import PropertyGridOptimized from '../../components/common/PropertyGrid/PropertyGridOptimized';
import './Home.css';

const MOCK_PROPERTIES = [
  { id: 1, title: 'Apartamento El Poblado', location: 'Medellin', price: 1800000, rating: 4.8, reviewCount: 45, bedrooms: 3, bathrooms: 2, sqft: 85, type: 'Apartamento', images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=500&fit=crop', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=500&fit=crop'] },
  { id: 2, title: 'Casa Moderna', location: 'Sabaneta', price: 2500000, rating: 4.9, reviewCount: 23, bedrooms: 4, bathrooms: 3, sqft: 150, type: 'Casa', images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&h=500&fit=crop', 'https://images.unsplash.com/photo-1564582913893-77bd1e8e4a2e?w=500&h=500&fit=crop'] },
  { id: 3, title: 'Estudio Centro', location: 'Medellin', price: 950000, rating: 4.6, reviewCount: 67, bedrooms: 1, bathrooms: 1, sqft: 40, type: 'Estudio', images: ['https://images.unsplash.com/photo-1512197917215-82f0a50eb629?w=500&h=500&fit=crop', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=500&fit=crop'] },
  { id: 4, title: 'Penthouse Laureles', location: 'Laureles', price: 3200000, rating: 5.0, reviewCount: 12, bedrooms: 3, bathrooms: 2, sqft: 120, type: 'Penthouse', images: ['https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=500&h=500&fit=crop', 'https://images.unsplash.com/photo-1564582913893-77bd1e8e4a2e?w=500&h=500&fit=crop'] },
  { id: 5, title: 'Loft Industrial', location: 'Centro', price: 1500000, rating: 4.7, reviewCount: 38, bedrooms: 2, bathrooms: 2, sqft: 95, type: 'Loft', images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=500&fit=crop', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&h=500&fit=crop'] },
  { id: 6, title: 'Villa Exclusiva', location: 'Sabaneta', price: 4200000, rating: 4.95, reviewCount: 28, bedrooms: 5, bathrooms: 4, sqft: 250, type: 'Villa', images: ['https://images.unsplash.com/photo-1564582913893-77bd1e8e4a2e?w=500&h=500&fit=crop', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=500&fit=crop'] }
];

export default function Home() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({ city: '', checkIn: '', checkOut: '', guests: '' });

  const filteredProperties = useMemo(() => {
    if (!searchParams.city) return MOCK_PROPERTIES;
    return MOCK_PROPERTIES.filter(p => 
      p.title.toLowerCase().includes(searchParams.city.toLowerCase()) ||
      p.location.toLowerCase().includes(searchParams.city.toLowerCase())
    );
  }, [searchParams.city]);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="hero-content">
          <h1 className="hero-title">Encuentra tu propiedad perfecta</h1>
          <p className="hero-subtitle">Explora las mejores opciones de alquiler en tu zona</p>
          <SearchBar onSearch={setSearchParams} />
        </div>
      </section>

      {/* Properties Section */}
      <section className="home-properties">
        <div className="properties-container">
          <PropertyGridOptimized 
            properties={filteredProperties}
            isLoading={false}
            onCardClick={(property) => navigate(`/property/${property._id || property.id}`)}
          />
        </div>
      </section>
    </div>
  );
}
