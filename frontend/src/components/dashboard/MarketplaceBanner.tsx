// frontend/src/components/dashboard/MarketplaceBanner.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useMarketplaceConfig } from '../../hooks/useMarketplaceConfig';
import { Skeleton } from '../ui/Skeleton';

export function MarketplaceBanner() {
  const query = useMarketplaceConfig();

  if (query.isLoading) {
    return (
      <section className="marketplace-health" aria-label="Cargando salud del marketplace">
        <Skeleton className="marketplace-health__title-skeleton" />
        <Skeleton className="marketplace-health__copy-skeleton" />
      </section>
    );
  }

  if (query.isError) {
    return (
      <section className="marketplace-health">
        <div>
          <h2>Salud del marketplace</h2>
          <p>No se pudo cargar la configuracion del marketplace.</p>
        </div>
        <button className="admin-text-button" type="button" onClick={() => query.refetch()}>
          Reintentar
        </button>
      </section>
    );
  }

  if (!query.data) {
    return (
      <section className="marketplace-health">
        <div>
          <h2>Salud del marketplace</h2>
          <p>No hay configuracion del marketplace disponible.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="marketplace-health">
      <div>
        <h2>{query.data.heading}</h2>
        <p>{query.data.description}</p>
      </div>
      <Link className="admin-text-button" to="/configuracion#marketplace">
        {query.data.ctaLabel || 'Ver configuracion'}
        <ArrowRight size={15} aria-hidden="true" />
      </Link>
    </section>
  );
}
