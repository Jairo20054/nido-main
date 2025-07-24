import React, { createContext, useState, useEffect, useContext } from 'react';

export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  // 1. Mejor inicialización de fechas para evitar undefined
  const [location, setLocation] = useState('');
  const [dates, setDatesState] = useState({ 
    checkIn: null, 
    checkOut: null 
  });
  
  const [guests, setGuests] = useState(1);
  
  // 2. Inicializar results como array vacío para prevenir undefined en operaciones de array
  const [results, setResults] = useState([]);
  
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateDates = (checkIn, checkOut) => {
    // 3. Validación mejorada de fechas
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      
      if (checkOutDate <= checkInDate) {
        setError('La fecha de salida debe ser posterior a la de entrada');
        return;
      }
    }
    setDatesState({ checkIn, checkOut });
    setError(null);
  };

  useEffect(() => {
    // 4. Manejo seguro del localStorage con try/catch
    try {
      const saved = localStorage.getItem('searchParams');
      if (saved) {
        const parsed = JSON.parse(saved);
        
        // 5. Validar estructura antes de usar los datos
        if (parsed.loc && parsed.dates && parsed.guests) {
          setLocation(parsed.loc);
          setDatesState(parsed.dates);
          setGuests(parsed.guests);
        }
      }
    } catch (e) {
      console.error("Error al recuperar búsquedas guardadas", e);
    }
  }, []);

  useEffect(() => {
    // 6. Guardar solo si los datos son válidos
    if (location || dates.checkIn || dates.checkOut) {
      localStorage.setItem('searchParams', JSON.stringify({ 
        loc: location, 
        dates, 
        guests 
      }));
    }
  }, [location, dates, guests]);

  return (
    <SearchContext.Provider value={{
      location,
      setLocation,
      dates,
      updateDates,
      guests,
      setGuests,
      results,
      setResults,
      isLoading,
      setLoading,
      error,
      setError
    }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearchContext = () => {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearchContext debe usarse dentro de SearchProvider');
  return ctx;
};