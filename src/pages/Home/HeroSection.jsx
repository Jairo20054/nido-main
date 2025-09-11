// src/components/Home/HeroSection/HeroSection.jsx (Modified: Removed LinkedIn elements, centered SearchBar like Airbnb, made compact=false for larger size, added responsive classes)
import React from 'react';
import SearchBar from '../../components/common/Header/SearchBar';
import './HeroSection.css';

const HeroSection = ({ onSearch }) => {
  return (
    <section className="hero-section" aria-labelledby="hero-heading">
      <div className="hero-container">
        <div className="hero-main-content">
          <div className="hero-content">
            <h1 id="hero-heading" className="hero-title">
              Encuentra tu próximo alojamiento ideal
            </h1>
            <p className="hero-subtitle">
              Descubre lugares únicos para hospedarte en todo el mundo
            </p>
            
            {/* SearchBar centered and prominent like Airbnb */}
            <div className="hero-search-bar">
              <SearchBar onSearch={onSearch} compact={false} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;