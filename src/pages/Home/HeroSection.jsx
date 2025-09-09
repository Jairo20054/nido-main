// src/components/Home/HeroSection/HeroSection.jsx
import React from 'react';
import SearchBar from '../../components/common/Header/SearchBar';
import './HeroSection.css';

const HeroSection = ({ onSearch }) => {
  


  return (
    <section className="hero-section" aria-labelledby="hero-heading">
      <div className="hero-content">
        <SearchBar onSearch={onSearch} />
      </div>
    </section>
  );
};

export default HeroSection;