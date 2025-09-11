// src/components/common/Header/SearchBar.jsx (Modified: Changed trigger to multi-section like Airbnb, removed single input, added sections for location, checkIn, checkOut, guests, and search button. Adjusted placeholders and labels in Spanish. Removed clear button from trigger.)
import React, { useState, useRef, useEffect, useCallback } from "react";
import "./SearchBar.css";

const SearchBar = ({ onSearch, compact = false, initialData = {} }) => {
  const [activeField, setActiveField] = useState(null);
  const [error, setError] = useState("");
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  const [searchData, setSearchData] = useState({
    location: initialData.location || "",
    checkIn: initialData.checkIn || null,
    checkOut: initialData.checkOut || null,
    guests: initialData.guests || {
      adults: 1,
      children: 0,
      babies: 0,
      pets: false,
    },
  });

  const popularLocations = [
    { name: "Bogotá", icon: "🏙️" },
    { name: "Medellín", icon: "🌸" },
    { name: "Cali", icon: "💃" },
    { name: "Cartagena", icon: "🏰" },
    { name: "Barranquilla", icon: "🌊" },
    { name: "Santa Marta", icon: "⛰️" },
    { name: "San Andrés", icon: "🏝️" },
  ];

  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [dropdownStyle, setDropdownStyle] = useState({});

  // Cerrar dropdown al click afuera y ESC
  useEffect(() => {
    const onDocClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setActiveField(null);
      }
    };
    
    const onEsc = (e) => {
      if (e.key === "Escape") setActiveField(null);
    };
    
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  // Ajusta el ancho/posición del dropdown para que coincida con la barra
  const updateDropdownPosition = useCallback(() => {
    if (!searchRef.current) return;
    
    const rect = searchRef.current.getBoundingClientRect();
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      setDropdownStyle({
        position: "fixed",
        left: 0,
        right: 0,
        top: "auto",
        bottom: 0,
        width: "100%",
      });
    } else {
      setDropdownStyle({
        position: "absolute",
        left: 0,
        top: rect.height + 8 + "px",
        width: rect.width + "px",
      });
    }
  }, []);

  useEffect(() => {
    updateDropdownPosition();
    window.addEventListener("resize", updateDropdownPosition);
    
    return () => window.removeEventListener("resize", updateDropdownPosition);
  }, [updateDropdownPosition]);

  useEffect(() => {
    if (activeField) {
      updateDropdownPosition();
      if (activeField === "location" && inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [activeField, updateDropdownPosition]);

  const handleLocationSearch = (value) => {
    setError("");
    setSearchData((p) => ({ ...p, location: value }));
    
    if (value.length > 1) {
      const filtered = popularLocations.filter((l) =>
        l.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
    
    setSelectedSuggestionIndex(-1);
  };

  const selectSuggestion = (s) => {
    setSearchData((p) => ({ ...p, location: s.name }));
    setSuggestions([]);
    setActiveField(null);
    setSelectedSuggestionIndex(-1);
  };

  const handleDateChange = (value, type) => {
    const date = value ? new Date(value) : null;
    setError("");
    
    setSearchData((prev) => {
      const next = { ...prev, [type]: date };
      
      if (type === "checkIn" && prev.checkOut && date && date >= prev.checkOut) {
        next.checkOut = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      }
      
      if (type === "checkOut" && prev.checkIn && date && date <= prev.checkIn) {
        next.checkOut = new Date(prev.checkIn.getTime() + 24 * 60 * 60 * 1000);
      }
      
      return next;
    });
  };

  const updateGuests = (type, op) => {
    setSearchData((prev) => {
      const current = prev.guests[type];
      const nextValue = op === "increment" ? Math.min(10, current + 1) : Math.max(0, current - 1);
      const nextAdults = type === "adults" ? Math.max(1, nextValue) : Math.max(1, prev.guests.adults);
      
      return {
        ...prev,
        guests: {
          ...prev.guests,
          [type]: type === "adults" ? nextAdults : nextValue,
        },
      };
    });
  };

  const totalGuests = searchData.guests.adults + searchData.guests.children + searchData.guests.babies;

  const validate = useCallback(() => {
    if (!searchData.location.trim()) return "Por favor ingresa un destino.";
    if (searchData.checkIn && searchData.checkOut && searchData.checkOut <= searchData.checkIn)
      return "La fecha de salida debe ser posterior a la de llegada.";
    return "";
  }, [searchData]);

  const handleSearch = () => {
    const v = validate();
    setError(v);
    if (v) return;
    
    if (typeof onSearch === "function") onSearch(searchData);
    setActiveField(null);
  };

  const handleKeyDown = (e) => {
    if (activeField === "location" && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedSuggestionIndex((p) => (p < suggestions.length - 1 ? p + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedSuggestionIndex((p) => (p > 0 ? p - 1 : suggestions.length - 1));
      } else if (e.key === "Enter" && selectedSuggestionIndex >= 0) {
        e.preventDefault();
        selectSuggestion(suggestions[selectedSuggestionIndex]);
      } else if (e.key === "Enter") {
        handleSearch();
      }
    } else if (e.key === "Enter") {
      handleSearch();
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const clearSearch = () => {
    setSearchData({
      location: "",
      checkIn: null,
      checkOut: null,
      guests: { adults: 1, children: 0, babies: 0, pets: false }
    });
    setError("");
    setActiveField(null);
  };

  const checkInDisplay = searchData.checkIn ? formatDate(searchData.checkIn) : "Agrega fech...";
  const checkOutDisplay = searchData.checkOut ? formatDate(searchData.checkOut) : "Agrega fech...";
  const guestsDisplay = totalGuests > 0 ? `${totalGuests} huésped${totalGuests > 1 ? 'es' : ''}` : "¿Cuántos?";

  return (
    <div className={`search-bar ${compact ? "search-bar--compact" : ""}`} ref={searchRef}>
      <div className="search-bar__trigger">
        <div 
          className={`trigger-section ${activeField === "location" ? "active" : ""}`} 
          onClick={() => setActiveField("location")}
        >
          <label>Dónde</label>
          <span>{searchData.location || "Explora destinos"}</span>
        </div>
        <div className="trigger-divider" />
        <div 
          className={`trigger-section ${activeField === "checkIn" ? "active" : ""}`} 
          onClick={() => setActiveField("checkIn")}
        >
          <label>Check-in</label>
          <span>{checkInDisplay}</span>
        </div>
        <div className="trigger-divider" />
        <div 
          className={`trigger-section ${activeField === "checkOut" ? "active" : ""}`} 
          onClick={() => setActiveField("checkOut")}
        >
          <label>Check-out</label>
          <span>{checkOutDisplay}</span>
        </div>
        <div className="trigger-divider" />
        <div 
          className={`trigger-section ${activeField === "guests" ? "active" : ""}`} 
          onClick={() => setActiveField("guests")}
        >
          <label>Quién</label>
          <span>{guestsDisplay}</span>
        </div>
        <button className="trigger-search-btn" onClick={handleSearch} aria-label="Buscar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M21 21l-4.35-4.35" />
            <circle cx="11" cy="11" r="6" />
          </svg>
        </button>
      </div>

      {/* Dropdown / panel */}
      {activeField && (
        <div className="search-dropdown" style={dropdownStyle} role="dialog" aria-label="Filtros de búsqueda">
          <div className="dropdown-header">
            <h3>Buscar alojamiento</h3>
            <button className="close-button" onClick={() => setActiveField(null)} aria-label="Cerrar búsqueda">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="dropdown-content">
            {/* Destino */}
            <div className="search-section">
              <label className="section-label">Destino</label>
              <div className="input-with-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <input
                  ref={inputRef}
                  className="text-input"
                  type="text"
                  value={searchData.location}
                  onChange={(e) => handleLocationSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ciudad o barrio"
                  aria-autocomplete="list"
                />
              </div>
              
              <div className="suggestions-container">
                {suggestions.length > 0 ? (
                  <div className="suggestions-list">
                    {suggestions.map((s, i) => (
                      <button
                        key={s.name + i}
                        className={`suggestion-item ${selectedSuggestionIndex === i ? "selected" : ""}`}
                        onClick={() => selectSuggestion(s)}
                      >
                        <span className="suggestion-icon">{s.icon}</span>
                        <span className="suggestion-text">{s.name}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="popular-suggestions">
                    <p className="suggestion-title">Destinos populares</p>
                    <div className="suggestions-grid">
                      {popularLocations.map((l) => (
                        <button key={l.name} className="suggestion-chip" onClick={() => selectSuggestion(l)}>
                          <span className="chip-icon">{l.icon}</span>
                          <span className="chip-text">{l.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Fechas */}
            <div className="search-section">
              <label className="section-label">Fechas</label>
              <div className="dates-container">
                <div className="date-input-group">
                  <label className="input-label">Entrada</label>
                  <div className="input-with-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <input
                      className="text-input"
                      type="date"
                      value={searchData.checkIn ? searchData.checkIn.toISOString().slice(0, 10) : ""}
                      onChange={(e) => handleDateChange(e.target.value, "checkIn")}
                      min={new Date().toISOString().slice(0, 10)}
                    />
                    {searchData.checkIn && (
                      <span className="date-display">{formatDate(searchData.checkIn)}</span>
                    )}
                  </div>
                </div>
                
                <div className="date-input-group">
                  <label className="input-label">Salida</label>
                  <div className="input-with-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <input
                      className="text-input"
                      type="date"
                      value={searchData.checkOut ? searchData.checkOut.toISOString().slice(0, 10) : ""}
                      onChange={(e) => handleDateChange(e.target.value, "checkOut")}
                      min={searchData.checkIn ? searchData.checkIn.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)}
                    />
                    {searchData.checkOut && (
                      <span className="date-display">{formatDate(searchData.checkOut)}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Huéspedes */}
            <div className="search-section">
              <label className="section-label">Huéspedes</label>
              <div className="guests-summary" onClick={() => setActiveField("guests")}>
                <div className="guests-info">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span>{guestsDisplay}</span>
                  {searchData.guests.pets && <span className="pets-indicator">· Mascotas</span>}
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </div>
              
              {activeField === "guests" && (
                <div className="guests-selector">
                  <div className="guest-type">
                    <div className="guest-info">
                      <span className="guest-label">Adultos</span>
                      <span className="guest-age">13+ años</span>
                    </div>
                    <div className="guest-controls">
                      <button 
                        onClick={() => updateGuests("adults", "decrement")} 
                        disabled={searchData.guests.adults <= 1}
                        aria-label="Disminuir adultos"
                      >
                        −
                      </button>
                      <span>{searchData.guests.adults}</span>
                      <button 
                        onClick={() => updateGuests("adults", "increment")} 
                        disabled={searchData.guests.adults >= 10}
                        aria-label="Aumentar adultos"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="guest-type">
                    <div className="guest-info">
                      <span className="guest-label">Niños</span>
                      <span className="guest-age">2-12 años</span>
                    </div>
                    <div className="guest-controls">
                      <button 
                        onClick={() => updateGuests("children", "decrement")} 
                        disabled={searchData.guests.children <= 0}
                        aria-label="Disminuir niños"
                      >
                        −
                      </button>
                      <span>{searchData.guests.children}</span>
                      <button 
                        onClick={() => updateGuests("children", "increment")} 
                        disabled={searchData.guests.children >= 10}
                        aria-label="Aumentar niños"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="guest-type">
                    <div className="guest-info">
                      <span className="guest-label">Bebés</span>
                      <span className="guest-age">Menos de 2 años</span>
                    </div>
                    <div className="guest-controls">
                      <button 
                        onClick={() => updateGuests("babies", "decrement")} 
                        disabled={searchData.guests.babies <= 0}
                        aria-label="Disminuir bebés"
                      >
                        −
                      </button>
                      <span>{searchData.guests.babies}</span>
                      <button 
                        onClick={() => updateGuests("babies", "increment")} 
                        disabled={searchData.guests.babies >= 10}
                        aria-label="Aumentar bebés"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="guest-type pets">
                    <div className="guest-info">
                      <span className="guest-label">Mascotas</span>
                      <span className="guest-age">¿Traes tu animal de servicio?</span>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={searchData.guests.pets}
                        onChange={(e) => setSearchData((p) => ({ 
                          ...p, 
                          guests: { ...p.guests, pets: e.target.checked } 
                        }))}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Error y acciones */}
            <div className="search-actions">
              {error && <div className="error-message" aria-live="polite">{error}</div>}
              <div className="action-buttons">
                <button className="clear-btn" onClick={clearSearch}>
                  Limpiar
                </button>
                <button className="search-btn" onClick={handleSearch}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 21l-4.35-4.35" />
                    <circle cx="11" cy="11" r="6" />
                  </svg>
                  Buscar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;