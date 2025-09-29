import React, { useState, useEffect, useRef, useCallback } from 'react';
import debounce from 'lodash.debounce';
import './SearchHub.css';

// Mock API fetch function
const fetchSearchResults = async (query, signal, page = 1) => {
  // Simula llamada a API con delay y mock data
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    setTimeout(() => {
      if (signal.aborted) {
        reject(new DOMException('Aborted', 'AbortError'));
        return;
      }
      if (!query || query.trim() === '') {
        resolve({ results: [], total: 0 });
        return;
      }
      // Mock results: 30 items max, 10 per page
      const total = 30;
      const perPage = 10;
      const start = (page - 1) * perPage;
      const end = Math.min(start + perPage, total);
      const results = [];
      for (let i = start; i < end; i++) {
        results.push({
          id: i + 1,
          title: `Propiedad ${i + 1} - ${query}`,
          category: ['Casa', 'Departamento', 'Villa'][i % 3],
          image: `https://picsum.photos/seed/${i + 1}/300/200`,
          url: `/property/${i + 1}`
        });
      }
      resolve({ results, total });
    }, 700);
  });
};

const SearchHub = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const resultsRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const performSearch = useCallback(async (searchTerm, pageNum = 1) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSearchResults(searchTerm, controller.signal, pageNum);
      if (pageNum === 1) {
        setResults(data.results);
      } else {
        setResults(prev => [...prev, ...data.results]);
      }
      setTotalResults(data.total);
      setLoading(false);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError('Error al cargar resultados. Intenta nuevamente.');
        setLoading(false);
      }
    }
  }, []);

  // Debounced search
  const debouncedSearch = useCallback(debounce((val) => {
    setPage(1);
    performSearch(val, 1);
  }, 300), [performSearch]);

  // Handle input change
  const onInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    debouncedSearch(val);
  };

  // Keyboard navigation in results
  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(i => Math.min(i + 1, results.length - 1));
      scrollToFocused(focusedIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(i => Math.max(i - 1, 0));
      scrollToFocused(focusedIndex - 1);
    } else if (e.key === 'Enter') {
      if (focusedIndex >= 0 && focusedIndex < results.length) {
        window.location.href = results[focusedIndex].url;
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const scrollToFocused = (index) => {
    const container = resultsRef.current;
    if (!container) return;
    const item = container.querySelector(`[data-index="${index}"]`);
    if (item) {
      const containerRect = container.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();
      if (itemRect.bottom > containerRect.bottom) {
        container.scrollTop += itemRect.bottom - containerRect.bottom;
      } else if (itemRect.top < containerRect.top) {
        container.scrollTop -= containerRect.top - itemRect.top;
      }
    }
  };

  // Load more results (pagination)
  const loadMore = () => {
    if (loading) return;
    if (results.length >= totalResults) return;
    const nextPage = page + 1;
    setPage(nextPage);
    performSearch(query, nextPage);
  };

  return (
    <div className="searchhub-container" role="search" aria-label="Búsqueda de propiedades">
      <div className="searchhub-header">
        <input
          type="search"
          aria-label="Buscar propiedades"
          placeholder="Buscar propiedades..."
          value={query}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
          ref={inputRef}
          autoComplete="off"
        />
        <button
          className="searchhub-close-btn"
          aria-label="Cerrar búsqueda"
          onClick={onClose}
        >
          ×
        </button>
      </div>

      <div
        className="searchhub-results"
        ref={resultsRef}
        tabIndex={-1}
        aria-live="polite"
        aria-relevant="additions"
      >
        {loading && page === 1 && <p className="searchhub-loading">Cargando resultados...</p>}
        {error && <p className="searchhub-error">{error}</p>}
        {!loading && !error && results.length === 0 && query.trim() !== '' && (
          <p className="searchhub-empty">No se encontraron resultados para "{query}"</p>
        )}

        <ul className="searchhub-list" role="listbox" aria-label="Resultados de búsqueda">
          {results.map((item, index) => (
            <li
              key={item.id}
              data-index={index}
              role="option"
              aria-selected={focusedIndex === index}
              tabIndex={-1}
              className={`searchhub-item ${focusedIndex === index ? 'focused' : ''}`}
              onMouseEnter={() => setFocusedIndex(index)}
              onClick={() => window.location.href = item.url}
            >
              <img src={item.image} alt={`Imagen de ${item.title}`} loading="lazy" />
              <div className="searchhub-item-info">
                <h3>{item.title}</h3>
                <p>{item.category}</p>
                <button
                  className="searchhub-item-cta"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = item.url;
                  }}
                  aria-label={`Ver detalles de ${item.title}`}
                >
                  Ver
                </button>
              </div>
            </li>
          ))}
        </ul>

        {results.length > 0 && results.length < totalResults && (
          <button
            className="searchhub-loadmore"
            onClick={loadMore}
            disabled={loading}
            aria-label="Cargar más resultados"
          >
            {loading ? 'Cargando...' : 'Cargar más'}
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchHub;
