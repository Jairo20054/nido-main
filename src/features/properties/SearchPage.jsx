import React, { useEffect, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { EmptyState } from '../../components/ui/EmptyState';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { LoadingState } from '../../components/ui/LoadingState';
import { useAuth } from '../../app/providers/AuthProvider';
import { PROPERTY_STATUS_OPTIONS, PUBLIC_PROPERTY_STATUS_OPTIONS } from '../../lib/constants';
import { api } from '../../lib/apiClient';
import { PropertyCard } from './PropertyCard';
import { PropertyFilters } from './PropertyFilters';

// Traduce los query params de la URL a un estado de filtros usable por la UI.
const readFilters = (searchParams) => ({
  city: searchParams.get('city') || '',
  neighborhood: searchParams.get('neighborhood') || '',
  propertyType: searchParams.get('propertyType') || '',
  minRent: searchParams.get('minRent') || '',
  maxRent: searchParams.get('maxRent') || '',
  bedrooms: searchParams.get('bedrooms') || '',
  furnished: searchParams.get('furnished') === 'true',
  petsAllowed: searchParams.get('petsAllowed') === 'true',
  utilitiesIncluded: searchParams.get('utilitiesIncluded') === 'true',
  status: searchParams.get('status') || '',
  sort: searchParams.get('sort') || 'recommended',
});

/**
 * Componente de uso para la busqueda avanzada de propiedades.
 * Coordina filtros, URL, consulta remota y acciones de favoritos para que la pagina
 * pueda compartirse por enlace y siga siendo navegable con el historial del navegador.
 */
export function SearchPage() {
  const { isAdmin, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(readFilters(searchParams));
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingFavorite, setSavingFavorite] = useState('');

  // Ejecuta la consulta remota tomando en cuenta el contexto de autenticacion
  // porque algunos estados solo son visibles para administradores.
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
          utilitiesIncluded: activeFilters.utilitiesIncluded || undefined,
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
    // La URL es la fuente de verdad del listado; por eso cualquier cambio
    // en searchParams provoca rehidratacion del formulario y recarga de datos.
    const nextFilters = readFilters(searchParams);
    setFilters(nextFilters);
    fetchProperties(nextFilters);
  }, [searchParams.toString()]);

  // Serializa el formulario actual a query params limpios.
  const applyFilters = () => {
    const nextParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== false) {
        nextParams.set(key, value);
      }
    });

    setSearchParams(nextParams, { replace: true });
  };

  // Restablece filtros de UI y URL al estado inicial.
  const clearFilters = () => {
    const reset = {
      city: '',
      neighborhood: '',
      propertyType: '',
      minRent: '',
      maxRent: '',
      bedrooms: '',
      furnished: false,
      petsAllowed: false,
      utilitiesIncluded: false,
      status: '',
      sort: 'recommended',
    };
    setFilters(reset);
    setSearchParams({}, { replace: true });
  };

  // Alterna favoritos desde el listado sin salir de la pagina actual.
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
            <h1>Explora viviendas de arriendo con filtros utiles</h1>
          </div>
          <div className="section__tag">
            <SlidersHorizontal size={16} />
            Ciudad, barrio, canon, habitaciones y estado
          </div>
        </div>

        <div className="search-layout">
          <aside className="search-layout__sidebar">
            <PropertyFilters
              filters={filters}
              onChange={(field, value) => setFilters((current) => ({ ...current, [field]: value }))}
              onApply={applyFilters}
              onClear={clearFilters}
              statusOptions={isAdmin ? PROPERTY_STATUS_OPTIONS : PUBLIC_PROPERTY_STATUS_OPTIONS}
            />
          </aside>

          <div className="search-layout__results">
            <InlineMessage tone="danger">{error}</InlineMessage>
            {loading ? (
              <LoadingState label="Buscando propiedades..." />
            ) : properties.length ? (
              <>
                <div className="results-toolbar">
                  <strong>{properties.length} propiedades encontradas</strong>
                </div>
                <div className="property-grid">
                  {properties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      onToggleFavorite={toggleFavorite}
                      disabledFavorite={savingFavorite === property.id}
                      showStatus
                    />
                  ))}
                </div>
              </>
            ) : (
              <EmptyState
                title="No encontramos propiedades con esos filtros"
                description="Prueba con otra ciudad, menos restricciones o un rango de canon mas amplio."
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
