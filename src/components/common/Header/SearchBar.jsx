// src/components/SearchBar/SearchBar.jsx
import React, { useState } from 'react';
import './SearchBar.css';

/*
  SearchBar (estilo compacto tipo Airbnb)
  - onSearch(searchData) se ejecuta al hacer click en Buscar
  - Comentarios en español en todo el archivo
*/

const SearchBar = ({ onSearch }) => {
  // Estado local para los campos de búsqueda
  const [searchData, setSearchData] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 1
  });

  // Actualiza un campo específico del estado
  const handleInputChange = (field, value) => {
    setSearchData(prev => ({ ...prev, [field]: value }));
  };

  // Botones para aumentar/disminuir huéspedes
  const incrementGuests = () => {
    setSearchData(prev => ({ ...prev, guests: Math.min(16, prev.guests + 1) }));
  };
  const decrementGuests = () => {
    setSearchData(prev => ({ ...prev, guests: Math.max(1, prev.guests - 1) }));
  };

  // Llamada al callback pasado por props
  const handleSearch = () => {
    if (onSearch) onSearch(searchData);
  };

  return (
    <div className="sb-wrapper">
      {/* Barra en forma de 'pill' */}
      <div className="sb-pill" role="search" aria-label="Buscar alojamiento">
        {/* Ubicación */}
        <div className="sb-field sb-location">
          {/* label accesible para lectores de pantalla */}
          <label className="sr-only" htmlFor="sb-location">Ubicación</label>
          <svg className="sb-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden>
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
          </svg>
          <input
            id="sb-location"
            className="sb-input"
            type="text"
            placeholder="¿Dónde quieres alojarte?"
            value={searchData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
          />
        </div>

        {/* Separador sutil */}
        <div className="sb-sep" />

        {/* Fechas: llegada */}
        <div className="sb-field sb-date">
          <label className="sr-only" htmlFor="sb-checkin">Llegada</label>
          <svg className="sb-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden>
            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM5 9h14v10H5V9z" />
          </svg>
          {/* Usamos input type=date pero con estilo para mantener tamaño uniforme */}
          <input
            id="sb-checkin"
            className="sb-input sb-input-date"
            type="date"
            value={searchData.checkIn}
            onChange={(e) => handleInputChange('checkIn', e.target.value)}
          />
        </div>

        <div className="sb-sep" />

        {/* Fechas: salida */}
        <div className="sb-field sb-date">
          <label className="sr-only" htmlFor="sb-checkout">Salida</label>
          <svg className="sb-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden>
            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM5 9h14v10H5V9z" />
          </svg>
          <input
            id="sb-checkout"
            className="sb-input sb-input-date"
            type="date"
            value={searchData.checkOut}
            onChange={(e) => handleInputChange('checkOut', e.target.value)}
          />
        </div>

        <div className="sb-sep" />

        {/* Huéspedes con controles ± */}
        <div className="sb-field sb-guests" role="group" aria-label="Huéspedes">
          <label className="sr-only">Huéspedes</label>
          <svg className="sb-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden>
            <path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zM2 20v-1c0-2.21 4.03-4 9-4s9 1.79 9 4v1H2z" />
          </svg>

          {/* controles de huéspedes (botones + número) */}
          <div className="sb-guests-controls">
            <button
              type="button"
              className="guest-btn"
              aria-label="Disminuir huéspedes"
              onClick={decrementGuests}
            >−</button>

            <div className="guest-count" aria-live="polite">{searchData.guests}</div>

            <button
              type="button"
              className="guest-btn"
              aria-label="Aumentar huéspedes"
              onClick={incrementGuests}
            >+</button>
          </div>
        </div>

        {/* Botón de búsqueda compacto */}
        <button
          className="sb-search-btn"
          type="button"
          onClick={handleSearch}
          aria-label="Buscar"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
            <path d="M10 2a8 8 0 0 1 6.32 12.906l5.387 5.387a1 1 0 0 1-1.414 1.414l-5.387-5.387A8 8 0 1 1 10 2zm0 2a6 6 0 1 0 0 12A6 6 0 0 0 10 4z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
