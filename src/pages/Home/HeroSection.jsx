// src/components/Home/HeroSection/HeroSection.jsx
import React, { useState } from 'react';
import './HeroSection.css';

const HeroSection = ({ onSearch }) => {
  const [searchParams, setSearchParams] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 1
  });
  

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchParams);
  };
  


  return (
    <section className="hero-section" aria-labelledby="hero-heading">
      <div className="hero-content"> 
        <form onSubmit={handleSubmit} className="search-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location" className="form-label">¿Dónde vas?</label>
              <div className="input-with-icon">
                <span className="icon">📍</span>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={searchParams.location}
                  onChange={handleChange}
                  placeholder="Ciudad, barrio o dirección"
                  className="form-input"
                  aria-required="true"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="checkIn" className="form-label">Llegada</label>
              <div className="input-with-icon">
                <span className="icon">📅</span>
                <input
                  type="date"
                  id="checkIn"
                  name="checkIn"
                  value={searchParams.checkIn}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="checkOut" className="form-label">Salida</label>
              <div className="input-with-icon">
                <span className="icon">📅</span>
                <input
                  type="date"
                  id="checkOut"
                  name="checkOut"
                  value={searchParams.checkOut}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="guests" className="form-label">Huéspedes</label>
              <div className="input-with-icon">
                <span className="icon">👥</span>
                <select
                  id="guests"
                  name="guests"
                  value={searchParams.guests}
                  onChange={handleChange}
                  className="form-input"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'huésped' : 'huéspedes'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <button type="submit" className="search-button">
              Buscar
            </button>
          </div>
          

        </form>
      </div>
    </section>
  );
};

export default HeroSection;