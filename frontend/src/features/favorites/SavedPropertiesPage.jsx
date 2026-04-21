import React, { useEffect, useState } from 'react';
import { EmptyState } from '../../components/ui/EmptyState';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { LoadingState } from '../../components/ui/LoadingState';
import { api } from '../../lib/apiClient';
import { PropertyCard } from '../properties/PropertyCard';

export function SavedPropertiesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadFavorites = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/favorites');
      setItems(response.data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

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
