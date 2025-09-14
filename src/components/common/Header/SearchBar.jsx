// src/components/SearchBar/SearchBar.jsx
import React, { useState } from 'react';
import './SearchBar.css';

const SearchBar = ({ onSearch }) => {
  const [searchData, setSearchData] = useState({
    location: '',
    checkIn: null,
    checkOut: null,
    guests: 1
  });

  const handleInputChange = (field, value) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchData);
    }
  };

  return (
    <div className="search-bar">
      <div className="search-bar-content">
        <div className="search-input-group">
          <div className="search-input">
            <label>Ubicación</label>
            <input
              type="text"
              placeholder="¿Dónde quieres alojarte?"
              value={searchData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
            />
          </div>
          
          <div className="search-divider"></div>
          
          <div className="search-input">
            <label>Llegada</label>
            <input
              type="date"
              value={searchData.checkIn || ''}
              onChange={(e) => handleInputChange('checkIn', e.target.value)}
            />
          </div>
          
          <div className="search-divider"></div>
          
          <div className="search-input">
            <label>Salida</label>
            <input
              type="date"
              value={searchData.checkOut || ''}
              onChange={(e) => handleInputChange('checkOut', e.target.value)}
            />
          </div>
          
          <div className="search-divider"></div>
          
          <div className="search-input">
            <label>Huéspedes</label>
            <input
              type="number"
              min="1"
              value={searchData.guests}
              onChange={(e) => handleInputChange('guests', parseInt(e.target.value))}
            />
          </div>
        </div>
        
        <button className="search-button" onClick={handleSearch}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
            <path d="M10 2a8 8 0 0 1 6.32 12.906l5.387 5.387a1 1 0 0 1-1.414 1.414l-5.387-5.387A8 8 0 1 1 10 2zm0 2a6 6 0 1 0 0 12A6 6 0 0 0 10 4z"/>
          </svg>
          Buscar
        </button>
      </div>
    </div>
  );
};

export default SearchBar;