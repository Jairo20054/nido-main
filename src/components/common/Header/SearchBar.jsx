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
      adultos: 0,
      niños: 0,
      bebés: 0,
      mascotas: 0,
    },
  });

  const popularLocations = [
    { name: "Cerca", description: "Descubre qué hay a tu alrededor", icon: "📍" },
    { name: "Palmira, Valle del Cauca", description: "Cerca de ti", icon: "🏠" },
    { name: "Bogotá, Bogotá", description: "Por lugares emblemáticos como este: Plaza de Bolívar", icon: "🏙️" },
    { name: "Cartagena, Bolívar", description: "Una destinación de playa popular", icon: "🏖️" },
    { name: "Jamundi, Valle del Cauca", description: "Cerca de ti", icon: "📍" },
  ];

  const [suggestions, setSuggestions] = useState(popularLocations);
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
        borderRadius: "24px 24px 0 0",
        maxHeight: "80vh",
      });
    } else {
      setDropdownStyle({
        position: "absolute",
        left: 0,
        top: rect.height + 4 + "px",
        width: rect.width + "px",
        borderRadius: "24px",
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
    } else {
      setSuggestions(popularLocations);
    }
  }, [activeField, updateDropdownPosition]);

  const handleLocationSearch = (value) => {
    setError("");
    setSearchData((p) => ({ ...p, location: value }));
    
    if (value.length > 1) {
      const filtered = popularLocations.filter((l) =>
        l.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.length > 0 ? filtered : popularLocations);
    } else {
      setSuggestions(popularLocations);
    }
    
    setSelectedSuggestionIndex(-1);
  };

  const selectSuggestion = (s) => {
    if (s.name === "Cerca") {
      setSearchData((p) => ({ ...p, location: "Cerca de ti" }));
    } else {
      setSearchData((p) => ({ ...p, location: s.name }));
    }
    setSuggestions(popularLocations);
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
      const nextAdults = type === "adultos" ? Math.max(0, nextValue) : prev.guests.adultos;
      
      return {
        ...prev,
        guests: {
          ...prev.guests,
          [type]: nextValue,
        },
      };
    });
  };

  const totalGuests = searchData.guests.adultos + searchData.guests.niños + searchData.guests.bebés + searchData.guests.mascotas;

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
    if (!date) return "Agrega fecha";
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
    }).format(date);
  };

  const clearSearch = () => {
    setSearchData({
      location: "",
      checkIn: null,
      checkOut: null,
      guests: { adultos: 0, niños: 0, bebés: 0, mascotas: 0 }
    });
    setError("");
    setActiveField(null);
  };

  const checkInDisplay = searchData.checkIn ? formatDate(searchData.checkIn) : "Agrega fecha";
  const checkOutDisplay = searchData.checkOut ? formatDate(searchData.checkOut) : "Agrega fecha";
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
          <label>Llegada</label>
          <span>{checkInDisplay}</span>
        </div>
        <div className="trigger-divider" />
        <div 
          className={`trigger-section ${activeField === "checkOut" ? "active" : ""}`} 
          onClick={() => setActiveField("checkOut")}
        >
          <label>Salida</label>
          <span>{checkOutDisplay}</span>
        </div>
        <div className="trigger-divider" />
        <div 
          className={`trigger-section ${activeField === "guests" ? "active" : ""}`} 
          onClick={() => setActiveField("guests")}
        >
          <label>Huéspedes</label>
          <span>{guestsDisplay}</span>
        </div>
        <button className="trigger-search-btn" onClick={handleSearch} aria-label="Buscar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M21 21l-4.35-4.35" />
            <circle cx="11" cy="11" r="6" />
          </svg>
        </button>
      </div>

      {/* Field-specific dropdown */}
      {activeField && (
        <div className="search-dropdown" style={dropdownStyle} role="dialog" aria-label="Filtro seleccionado">
          {activeField === "location" && (
            <div className="dropdown-content location-content">
              <div className="search-section">
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
                    placeholder="¿A dónde vas?"
                    aria-autocomplete="list"
                  />
                </div>
                
                <div className="suggestions-container">
                  <p className="suggestion-title">Destinaciones sugeridas</p>
                  <div className="suggestions-list">
                    {suggestions.map((s, i) => (
                      <button
                        key={s.name + i}
                        className={`suggestion-item ${selectedSuggestionIndex === i ? "selected" : ""}`}
                        onClick={() => selectSuggestion(s)}
                      >
                        <span className="suggestion-icon">{s.icon}</span>
                        <div className="suggestion-details">
                          <span className="suggestion-name">{s.name}</span>
                          <span className="suggestion-description">{s.description}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeField === "checkIn" && (
            <div className="dropdown-content date-content">
              <div className="search-section">
                <label className="section-label">Llegada</label>
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
                    autoFocus
                  />
                </div>
              </div>
            </div>
          )}

          {activeField === "checkOut" && (
            <div className="dropdown-content date-content">
              <div className="search-section">
                <label className="section-label">Salida</label>
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
                    autoFocus
                  />
                </div>
              </div>
            </div>
          )}

          {activeField === "guests" && (
            <div className="dropdown-content guests-content">
              <div className="search-section">
                <div className="guests-selector">
                  <div className="guest-type">
                    <div className="guest-info">
                      <span className="guest-label">Adultos</span>
                      <span className="guest-age">Edad: 13 años o más</span>
                    </div>
                    <div className="guest-controls">
                      <button 
                        onClick={() => updateGuests("adultos", "decrement")} 
                        disabled={searchData.guests.adultos <= 0}
                        aria-label="Disminuir adultos"
                      >
                        −
                      </button>
                      <span>{searchData.guests.adultos}</span>
                      <button 
                        onClick={() => updateGuests("adultos", "increment")} 
                        disabled={searchData.guests.adultos >= 10}
                        aria-label="Aumentar adultos"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="guest-type">
                    <div className="guest-info">
                      <span className="guest-label">Niños</span>
                      <span className="guest-age">Edades 2 – 12</span>
                    </div>
                    <div className="guest-controls">
                      <button 
                        onClick={() => updateGuests("niños", "decrement")} 
                        disabled={searchData.guests.niños <= 0}
                        aria-label="Disminuir niños"
                      >
                        −
                      </button>
                      <span>{searchData.guests.niños}</span>
                      <button 
                        onClick={() => updateGuests("niños", "increment")} 
                        disabled={searchData.guests.niños >= 10}
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
                        onClick={() => updateGuests("bebés", "decrement")} 
                        disabled={searchData.guests.bebés <= 0}
                        aria-label="Disminuir bebés"
                      >
                        −
                      </button>
                      <span>{searchData.guests.bebés}</span>
                      <button 
                        onClick={() => updateGuests("bebés", "increment")} 
                        disabled={searchData.guests.bebés >= 10}
                        aria-label="Aumentar bebés"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="guest-type">
                    <div className="guest-info">
                      <span className="guest-label">Mascotas</span>
                      <span className="guest-age">¿Traes a un animal de servicio?</span>
                    </div>
                    <div className="guest-controls">
                      <button 
                        onClick={() => updateGuests("mascotas", "decrement")} 
                        disabled={searchData.guests.mascotas <= 0}
                        aria-label="Disminuir mascotas"
                      >
                        −
                      </button>
                      <span>{searchData.guests.mascotas}</span>
                      <button 
                        onClick={() => updateGuests("mascotas", "increment")} 
                        disabled={searchData.guests.mascotas >= 5}
                        aria-label="Aumentar mascotas"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="search-actions guests-actions">
                <button className="clear-btn" onClick={clearSearch}>
                  Limpiar
                </button>
                <button className="search-btn" onClick={handleSearch}>
                  Buscar
                </button>
              </div>
            </div>
          )}
          
          {error && <div className="error-message" aria-live="polite">{error}</div>}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
