import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { geocodeAddress } from '../../services/geoService';
import type { GeocodeResult } from '../../types/geo';

type AddressAutocompleteProps = {
  label?: string;
  value?: string;
  placeholder?: string;
  onSelect: (result: GeocodeResult) => void;
  onChange?: (value: string) => void;
};

export function AddressAutocomplete({
  label = 'Buscar direccion',
  value = '',
  placeholder = 'Ej. Calle 10 # 20-30, Cali',
  onSelect,
  onChange,
}: AddressAutocompleteProps) {
  const inputId = useId();
  const listId = useId();
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const latestQueryRef = useRef('');

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const trimmed = query.trim();
    onChange?.(query);

    if (trimmed.length < 3) {
      setResults([]);
      setLoading(false);
      setError('');
      return undefined;
    }

    latestQueryRef.current = trimmed;
    setLoading(true);
    setError('');

    const timeoutId = window.setTimeout(() => {
      geocodeAddress(trimmed)
        .then((items) => {
          if (latestQueryRef.current === trimmed) {
            setResults(items);
            setActiveIndex(items.length ? 0 : -1);
          }
        })
        .catch((requestError) => {
          if (latestQueryRef.current === trimmed) {
            setResults([]);
            setError(requestError.message || 'No pudimos buscar esa direccion.');
          }
        })
        .finally(() => {
          if (latestQueryRef.current === trimmed) setLoading(false);
        });
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [onChange, query]);

  const hasResults = results.length > 0;
  const status = useMemo(() => {
    if (loading) return 'Buscando direccion...';
    if (error) return error;
    if (query.trim().length >= 3 && !hasResults) return 'Sin resultados para esta busqueda.';
    return '';
  }, [error, hasResults, loading, query]);

  const selectResult = (result: GeocodeResult) => {
    setQuery(result.address || result.displayName);
    setResults([]);
    setActiveIndex(-1);
    onSelect(result);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!hasResults) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % results.length);
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? results.length - 1 : current - 1));
    }

    if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      selectResult(results[activeIndex]);
    }

    if (event.key === 'Escape') {
      setResults([]);
      setActiveIndex(-1);
    }
  };

  return (
    <div className="nido-address-autocomplete">
      <label htmlFor={inputId}>{label}</label>
      <div className="nido-address-autocomplete__input">
        <Search size={16} aria-hidden="true" />
        <input
          id={inputId}
          value={query}
          placeholder={placeholder}
          autoComplete="street-address"
          aria-controls={hasResults ? listId : undefined}
          aria-expanded={hasResults}
          aria-autocomplete="list"
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      {status ? <p className="nido-address-autocomplete__status">{status}</p> : null}
      {hasResults ? (
        <div id={listId} className="nido-address-autocomplete__list" role="listbox">
          {results.map((result, index) => (
            <button
              key={`${result.longitude}-${result.latitude}-${result.displayName}`}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              className={index === activeIndex ? 'is-active' : ''}
              onClick={() => selectResult(result)}
            >
              <MapPin size={15} aria-hidden="true" />
              <span>{result.displayName}</span>
              {result.city ? <small>{result.city}</small> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
