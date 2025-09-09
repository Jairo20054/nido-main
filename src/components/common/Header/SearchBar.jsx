// No se usan librerías externas salvo aviso. Fecha de llegada y fecha de salida: inputs tipo `date` con validación. Autocompletado de ejemplo (estático): ["Bogotá","Medellín","Cali","Cartagena","Barranquilla"]. Soporte selección por teclado (flechas arriba/abajo + Enter).
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
    guests:
      initialData.guests || {
        adults: 2,
        children: 0,
        babies: 0,
        pets: false,
      },
  });

  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  // Sugerencias estáticas
  const popularLocations = [
    { name: "Bogotá", type: "Ciudad", country: "Colombia" },
    { name: "Medellín", type: "Ciudad", country: "Colombia" },
    { name: "Cali", type: "Ciudad", country: "Colombia" },
    { name: "Cartagena", type: "Ciudad", country: "Colombia" },
    { name: "Barranquilla", type: "Ciudad", country: "Colombia" },
  ];

  // Cerrar dropdown al click afuera
  useEffect(() => {
    const onDocClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setActiveField(null);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Cerrar con ESC
  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape") setActiveField(null);
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, []);

  // Foco al abrir dropdown de ubicación
  useEffect(() => {
    if (activeField === "location" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeField]);

  const handleLocationSearch = (value) => {
    setError("");
    setSearchData((prev) => ({ ...prev, location: value }));
    if (value.length > 2) {
      const filtered = popularLocations.filter((l) =>
        l.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
    setSelectedSuggestionIndex(-1);
  };

  const selectSuggestion = (suggestion) => {
    setSearchData((prev) => ({ ...prev, location: suggestion.name }));
    setSuggestions([]);
    setActiveField(null);
    setSelectedSuggestionIndex(-1);
  };

  const handleDateChange = (dateString, type) => {
    setError("");
    const date = new Date(dateString);
    setSearchData((prev) => {
      const next = { ...prev, [type]: date };
      if (type === "checkIn" && prev.checkOut && date >= prev.checkOut) {
        next.checkOut = new Date(date.getTime() + 24 * 60 * 60 * 1000); // add 1 day
      }
      if (type === "checkOut" && prev.checkIn && date <= prev.checkIn) {
        next.checkOut = new Date(prev.checkIn.getTime() + 24 * 60 * 60 * 1000);
      }
      return next;
    });
  };

  const updateGuests = (type, op) => {
    setError("");
    setSearchData((prev) => {
      const current = prev.guests[type];
      const value = op === "increment" ? Math.min(10, current + 1) : Math.max(0, current - 1);
      // Regla: al menos 1 adulto
      const nextAdults =
        type === "adults" ? Math.max(1, value) : Math.max(1, prev.guests.adults);
      return {
        ...prev,
        guests: {
          ...prev.guests,
          [type]: type === "adults" ? nextAdults : value,
        },
      };
    });
  };

  const totalGuests =
    searchData.guests.adults +
    searchData.guests.children +
    searchData.guests.babies;

  const validate = useCallback(() => {
    if (!searchData.location.trim()) {
      return "Por favor, ingresa una ubicación.";
    }
    if (searchData.checkIn && searchData.checkOut && searchData.checkOut <= searchData.checkIn) {
      return "La fecha de salida debe ser posterior a la fecha de entrada.";
    }
    return "";
  }, [searchData]);

  const handleSearch = () => {
    const v = validate();
    setError(v);
    if (v) return;
    if (typeof onSearch === "function") {
      onSearch(searchData);
    }
    setActiveField(null);
  };

  const handleKeyDown = (e) => {
    if (activeField === "location" && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedSuggestionIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedSuggestionIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
      } else if (e.key === "Enter" && selectedSuggestionIndex >= 0) {
        e.preventDefault();
        selectSuggestion(suggestions[selectedSuggestionIndex]);
      } else if (e.key === "Enter") {
        handleSearch();
      } else if (e.key === "Escape") {
        setActiveField(null);
        setSelectedSuggestionIndex(-1);
      }
    } else if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <section
      className={`search-bar ${compact ? "search-bar--compact" : ""}`}
      ref={searchRef}
      aria-label="Barra de búsqueda de alojamientos"
    >
      <div className="search-bar__container" role="search">
        {/* Ubicación */}
        <div className={`search-field ${activeField === "location" ? "search-field--active" : ""}`}>
          <button
            type="button"
            className="search-field__button"
            aria-expanded={activeField === "location"}
            aria-controls="location-dropdown"
            aria-haspopup="listbox"
            onClick={() => setActiveField(activeField === "location" ? null : "location")}
          >
            <span className="search-field__label">¿Dónde?</span>
            <span className="search-field__value">
              {searchData.location || "Buscar destinos"}
            </span>
          </button>

          {activeField === "location" && (
            <div id="location-dropdown" className="search-dropdown">
              <div className="search-input-container" role="combobox" aria-expanded="true" aria-owns="location-listbox">
                <svg className="search-input-icon" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                  <path
                    d="M7 14A7 7 0 1 0 7 0a7 7 0 0 0 0 14ZM7 2a5 5 0 1 1 0 10A5 5 0 0 1 7 2Zm4.93 7.75L15 12.58l-.92.92-3.5-3.5a.5.5 0 0 1 .35-.25Z"
                    fill="currentColor"
                  />
                </svg>
                <input
                  ref={inputRef}
                  id="location-input"
                  type="text"
                  placeholder="Busca por ciudad o barrio"
                  value={searchData.location}
                  onChange={(e) => handleLocationSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  aria-autocomplete="list"
                  aria-controls="location-listbox"
                  aria-activedescendant=""
                />
              </div>

              <div className="search-suggestions" role="listbox" id="location-listbox">
                {suggestions.length > 0 ? (
                  suggestions.map((s, idx) => (
                    <button
                      key={`${s.name}-${idx}`}
                      className={`suggestion-item ${selectedSuggestionIndex === idx ? 'suggestion-item--selected' : ''}`}
                      role="option"
                      onClick={() => selectSuggestion(s)}
                    >
                      <svg className="suggestion-icon" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                        <path
                          d="M8 0a6 6 0 0 0-6 6c0 4 6 10 6 10s6-6 6-10a6 6 0 0 0-6-6Zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"
                          fill="currentColor"
                        />
                      </svg>
                      <div>
                        <div className="suggestion-name">{s.name}</div>
                        <div className="suggestion-type">
                          {s.type}, {s.country}
                        </div>
                      </div>
                    </button>
                  ))
                ) : searchData.location.length > 2 ? (
                  <div className="no-suggestions" role="status">
                    No se encontraron ubicaciones
                  </div>
                ) : (
                  <div className="popular-destinations" aria-label="Destinos populares">
                    {popularLocations.slice(0, 4).map((l, index) => (
                      <button
                        key={`${l.name}-${index}`}
                        className={`suggestion-item ${selectedSuggestionIndex === index ? 'suggestion-item--selected' : ''}`}
                        role="option"
                        onClick={() => selectSuggestion(l)}
                      >
                        <svg className="suggestion-icon" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                          <path
                            d="M8 0a6 6 0 0 0-6 6c0 4 6 10 6 10s6-6 6-10a6 6 0 0 0-6-6Zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"
                            fill="currentColor"
                          />
                        </svg>
                        <div>
                          <div className="suggestion-name">{l.name}</div>
                          <div className="suggestion-type">{l.type}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Separador */}
        <div className="search-divider" aria-hidden="true"></div>

        {/* Fechas */}
        <div className={`search-field search-field--dates ${activeField === "dates" ? "search-field--active" : ""}`}>
          <button
            type="button"
            className="search-field__button"
            aria-expanded={activeField === "dates"}
            aria-controls="dates-dropdown"
            aria-haspopup="dialog"
            onClick={() => setActiveField(activeField === "dates" ? null : "dates")}
          >
            <div className="search-field__label">Cuándo</div>
            <div className="search-field__content">
              <div className="date-section">
                <div className="search-field__value">
                  {searchData.checkIn ? searchData.checkIn.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : "Entrada"}
                </div>
              </div>
              <div className="date-section">
                <div className="search-field__value">
                  {searchData.checkOut ? searchData.checkOut.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : "Salida"}
                </div>
              </div>
            </div>
          </button>

          {activeField === "dates" && (
            <div id="dates-dropdown" className="search-dropdown search-dropdown--dates" role="dialog" aria-label="Selector de fechas">
              <div className="date-picker-container">
                <div className="date-input-group">
                  <label htmlFor="checkIn-date">Fecha de llegada</label>
                  <input
                    type="date"
                    id="checkIn-date"
                    value={searchData.checkIn ? searchData.checkIn.toISOString().split('T')[0] : ''}
                    onChange={(e) => handleDateChange(e.target.value, "checkIn")}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="date-input-group">
                  <label htmlFor="checkOut-date">Fecha de salida</label>
                  <input
                    type="date"
                    id="checkOut-date"
                    value={searchData.checkOut ? searchData.checkOut.toISOString().split('T')[0] : ''}
                    onChange={(e) => handleDateChange(e.target.value, "checkOut")}
                    min={searchData.checkIn ? searchData.checkIn.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Separador */}
        <div className="search-divider" aria-hidden="true"></div>

        {/* Huéspedes */}
        <div className={`search-field ${activeField === "guests" ? "search-field--active" : ""}`}>
          <button
            type="button"
            className="search-field__button"
            aria-expanded={activeField === "guests"}
            aria-controls="guests-dropdown"
            aria-haspopup="dialog"
            onClick={() => setActiveField(activeField === "guests" ? null : "guests")}
          >
            <span className="search-field__label">¿Quién?</span>
            <span className="search-field__value">
              {totalGuests > 0 ? `${totalGuests} huésped${totalGuests > 1 ? "es" : ""}` : "Agregar huéspedes"}
            </span>
          </button>

          {activeField === "guests" && (
            <div id="guests-dropdown" className="search-dropdown" role="dialog" aria-label="Selector de huéspedes">
              <div className="guests-selector">
                {/* Adultos */}
                <div className="guest-type">
                  <div className="guest-info">
                    <div className="guest-title">Adultos</div>
                    <div className="guest-subtitle">13 años o más</div>
                  </div>
                  <div className="guest-controls">
                    <button
                      type="button"
                      className="guest-btn"
                      onClick={() => updateGuests("adults", "decrement")}
                      aria-label="Disminuir adultos"
                      disabled={searchData.guests.adults <= 1}
                    >
                      −
                    </button>
                    <span className="guest-count" aria-live="polite">{searchData.guests.adults}</span>
                    <button
                      type="button"
                      className="guest-btn"
                      onClick={() => updateGuests("adults", "increment")}
                      aria-label="Aumentar adultos"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Niños */}
                <div className="guest-type">
                  <div className="guest-info">
                    <div className="guest-title">Niños</div>
                    <div className="guest-subtitle">De 2 a 12 años</div>
                  </div>
                  <div className="guest-controls">
                    <button
                      type="button"
                      className="guest-btn"
                      onClick={() => updateGuests("children", "decrement")}
                      aria-label="Disminuir niños"
                      disabled={searchData.guests.children <= 0}
                    >
                      −
                    </button>
                    <span className="guest-count" aria-live="polite">{searchData.guests.children}</span>
                    <button
                      type="button"
                      className="guest-btn"
                      onClick={() => updateGuests("children", "increment")}
                      aria-label="Aumentar niños"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Bebés */}
                <div className="guest-type">
                  <div className="guest-info">
                    <div className="guest-title">Bebés</div>
                    <div className="guest-subtitle">Menores de 2 años</div>
                  </div>
                  <div className="guest-controls">
                    <button
                      type="button"
                      className="guest-btn"
                      onClick={() => updateGuests("babies", "decrement")}
                      aria-label="Disminuir bebés"
                      disabled={searchData.guests.babies <= 0}
                    >
                      −
                    </button>
                    <span className="guest-count" aria-live="polite">{searchData.guests.babies}</span>
                    <button
                      type="button"
                      className="guest-btn"
                      onClick={() => updateGuests("babies", "increment")}
                      aria-label="Aumentar bebés"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Mascotas */}
                <div className="guest-type">
                  <div className="guest-info">
                    <div className="guest-title">Mascotas</div>
                    <div className="guest-subtitle">¿Llevas una mascota de servicio?</div>
                  </div>
                  <div className="guest-controls">
                    <label className="pet-toggle">
                      <input
                        type="checkbox"
                        checked={searchData.guests.pets}
                        onChange={(e) =>
                          setSearchData((prev) => ({
                            ...prev,
                            guests: { ...prev.guests, pets: e.target.checked },
                          }))
                        }
                        aria-label="Incluir mascota"
                      />
                      <span className="pet-toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botón de búsqueda */}
        <div className="search-action">
          <button
            type="button"
            className="search-submit"
            onClick={handleSearch}
            onKeyDown={handleKeyDown}
            aria-label="Buscar alojamientos"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M10 18a8 8 0 1 1 5.293-14.293A8 8 0 0 1 10 18Zm11.707 2.293-5.387-5.387a10 10 0 1 1 1.414-1.414l5.387 5.387-1.414 1.414Z"
                fill="currentColor"
              />
            </svg>
            <span className="search-submit__label">Buscar</span>
          </button>
        </div>
      </div>

      {/* Errores accesibles */}
      <div className="search-error" aria-live="polite">
        {error}
      </div>
    </section>
  );
};

export default SearchBar;
