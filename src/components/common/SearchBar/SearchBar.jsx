import React, { useState } from 'react';
import { MapPin, Calendar, Users, Search } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './SearchBar.css';

const SearchBar = ({ onSearch, minimal = false }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [location, setLocation] = useState(searchParams.get('city') || '');
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [guests, setGuests] = useState(searchParams.get('guests') || 1);
  const [focusedField, setFocusedField] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Build query string for URL
    const queryParams = new URLSearchParams();
    if (location) queryParams.append('city', location);
    if (checkIn) queryParams.append('checkIn', checkIn);
    if (checkOut) queryParams.append('checkOut', checkOut);
    if (guests) queryParams.append('guests', guests);
    
    // Navigate to search page with query params
    navigate(`/search?${queryParams.toString()}`);
    
    // Also call onSearch callback if provided
    if (onSearch) {
      onSearch({ location, checkIn, checkOut, guests });
    }
  };

  if (minimal) {
    return (
      <form className="searchbar-minimal" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="¿A dónde vamos?"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="searchbar-minimal-input"
        />
        <button type="submit" className="searchbar-minimal-btn">
          <Search size={20} />
        </button>
      </form>
    );
  }

  return (
    <form className="searchbar" onSubmit={handleSearch}>
      <div className="searchbar-container">
        {/* Dónde */}
        <div
          className={`searchbar-field ${focusedField === 'location' ? 'focused' : ''}`}
          onFocus={() => setFocusedField('location')}
          onBlur={() => setFocusedField(null)}
        >
          <label className="searchbar-label">Dónde</label>
          <div className="searchbar-input-wrapper">
            <MapPin size={18} className="searchbar-icon" />
            <input
              type="text"
              placeholder="Buscar destinos"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="searchbar-input"
            />
          </div>
        </div>

        {/* Entrada */}
        <div
          className={`searchbar-field ${focusedField === 'checkIn' ? 'focused' : ''}`}
          onFocus={() => setFocusedField('checkIn')}
          onBlur={() => setFocusedField(null)}
        >
          <label className="searchbar-label">Entrada</label>
          <div className="searchbar-input-wrapper">
            <Calendar size={18} className="searchbar-icon" />
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="searchbar-input"
            />
          </div>
        </div>

        {/* Salida */}
        <div
          className={`searchbar-field ${focusedField === 'checkOut' ? 'focused' : ''}`}
          onFocus={() => setFocusedField('checkOut')}
          onBlur={() => setFocusedField(null)}
        >
          <label className="searchbar-label">Salida</label>
          <div className="searchbar-input-wrapper">
            <Calendar size={18} className="searchbar-icon" />
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="searchbar-input"
            />
          </div>
        </div>

        {/* Quién */}
        <div
          className={`searchbar-field ${focusedField === 'guests' ? 'focused' : ''}`}
          onFocus={() => setFocusedField('guests')}
          onBlur={() => setFocusedField(null)}
        >
          <label className="searchbar-label">Quién</label>
          <div className="searchbar-input-wrapper">
            <Users size={18} className="searchbar-icon" />
            <select value={guests} onChange={(e) => setGuests(e.target.value)} className="searchbar-input">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'huésped' : 'huéspedes'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botón de búsqueda */}
        <button type="submit" className="searchbar-submit">
          <Search size={22} />
          <span>Buscar</span>
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
