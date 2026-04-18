import React, { useEffect, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { EmptyState } from '../../components/ui/EmptyState';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { LoadingState } from '../../components/ui/LoadingState';
import { useAuth } from '../../app/providers/AuthProvider';
import { api } from '../../lib/apiClient';
import { PropertyCard } from './PropertyCard';
import { PropertyFilters } from './PropertyFilters';

const readFilters = (searchParams) => ({
  city: searchParams.get('city') || '',
  propertyType: searchParams.get('propertyType') || '',
  minRent: searchParams.get('minRent') || '',
  maxRent: searchParams.get('maxRent') || '',
  bedrooms: searchParams.get('bedrooms') || '',
  bathrooms: searchParams.get('bathrooms') || '',
  furnished: searchParams.get('furnished') === 'true',
  petsAllowed: searchParams.get('petsAllowed') === 'true',
  sort: searchParams.get('sort') || 'recommended',
});

export function SearchPage() {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(readFilters(searchParams));
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingFavorite, setSavingFavorite] = useState('');

  const fetchProperties = async (activeFilters) => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/properties', {
        auth: isAuthenticated,
        query: {
          ...activeFilters,
          furnished: activeFilters.furnished || undefined,
          petsAllowed: activeFilters.petsAllowed || undefined,
        },
      });
      setProperties(response.data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const nextFilters = readFilters(searchParams);
    setFilters(nextFilters);
    fetchProperties(nextFilters);
  }, [searchParams.toString()]);

  const applyFilters = () => {
    const nextParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== false) {
        nextParams.set(key, value);
      }
    });

    setSearchParams(nextParams, { replace: true });
  };

  const clearFilters = () => {
    const reset = {
      city: '',
      propertyType: '',
      minRent: '',
      maxRent: '',
      bedrooms: '',
      bathrooms: '',
      furnished: false,
      petsAllowed: false,
      sort: 'recommended',
    };
    setFilters(reset);
    setSearchParams({}, { replace: true });
  };

  const toggleFavorite = async (property) => {
    if (!isAuthenticated) {
      setError('Inicia sesion para guardar propiedades.');
      return;
    }

    setSavingFavorite(property.id);

    try {
      if (property.isFavorite) {
        await api.delete(`/favorites/${property.id}`);
      } else {
        await api.post(`/favorites/${property.id}`, {});
      }

      setProperties((current) =>
        current.map((item) =>
          item.id === property.id ? { ...item, isFavorite: !item.isFavorite } : item
        )
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingFavorite('');
    }
  };

  return (
    <div className="page page--search">
      <section className="section section--compact">
        <div className="section__heading">
          <div>
            <span className="section__eyebrow">Busqueda</span>
            <h1>Explora propiedades de arriendo</h1>
          </div>
          <div className="section__tag">
            <SlidersHorizontal size={16} />
            Filtros utiles y directos
          </div>
        </div>

        <div className="search-layout">
          <aside className="search-layout__sidebar">
            <PropertyFilters
              filters={filters}
              onChange={(field, value) => setFilters((current) => ({ ...current, [field]: value }))}
              onApply={applyFilters}
              onClear={clearFilters}
            />
          </aside>

          <div className="search-layout__results">
            <InlineMessage tone="danger">{error}</InlineMessage>
            {loading ? (
              <LoadingState label="Buscando propiedades..." />
            ) : properties.length ? (
              <div className="property-grid">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onToggleFavorite={toggleFavorite}
                    disabledFavorite={savingFavorite === property.id}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No encontramos resultados"
                description="Prueba con otro rango de canon, una ciudad distinta o menos restricciones."
                actionLabel="Limpiar filtros"
                onAction={clearFilters}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
