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
