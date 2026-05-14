import React, { useEffect, useState } from 'react';
import { EmptyState } from '../../components/ui/EmptyState';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { LoadingState } from '../../components/ui/LoadingState';
import { api } from '../../lib/apiClient';
import { PropertyCard } from '../properties/PropertyCard';
import { isRecoverableDashboardError, mockProperties } from '../dashboard/dashboardData';

/**
 * Componente de uso para la pagina de favoritos.
 * Muestra el subconjunto de propiedades guardadas por el usuario autenticado
 * y permite quitarlas sin salir de la vista.
 */
export function SavedPropertiesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Obtiene la coleccion actual de favoritos del backend.
  const loadFavorites = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/favorites', { query: { limit: 50 } });
      setItems(response.data);
    } catch (requestError) {
      if (isRecoverableDashboardError(requestError)) {
        setItems(mockProperties);
        setError('Mostrando favoritos de ejemplo mientras se conecta el backend.');
      } else {
        setError(requestError.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  // Elimina el guardado y actualiza la grilla local sin refetch completo.
  const handleRemove = async (property) => {
    try {
      await api.delete(`/favorites/${property.id}`);
      setItems((current) => current.filter((item) => item.id !== property.id));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="page">
      <section className="section">
        <div className="section__heading">
          <div>
            <span className="section__eyebrow">Guardados</span>
            <h1>Tus propiedades favoritas</h1>
          </div>
        </div>
        <InlineMessage tone="danger">{error}</InlineMessage>
        {loading ? (
          <LoadingState label="Cargando guardados..." />
        ) : items.length ? (
          <div className="property-grid">
            {items.map((property) => (
              <PropertyCard key={property.id} property={property} onToggleFavorite={handleRemove} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Aun no guardas propiedades"
            description="Explora el catalogo y marca las opciones que quieras revisar luego con calma."
          />
        )}
      </section>
    </div>
  );
}
