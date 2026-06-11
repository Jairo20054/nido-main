// frontend/src/components/dashboard/TopLandlords.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useAdminLandlords } from '../../hooks/useAdminLandlords';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';

const AVATAR_TONES = ['green', 'stone', 'slate', 'amber'];

const hashName = (name: string) =>
  name.split('').reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0);

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || 'N';
  const second = parts[1]?.[0] || parts[0]?.[1] || '';

  return `${first}${second}`.toUpperCase();
};

export function TopLandlords() {
  const query = useAdminLandlords({ sort: 'propertiesCount:desc', limit: 5 });

  if (query.isLoading) {
    return (
      <div className="top-landlords" aria-label="Cargando arrendadores activos">
        {[0, 1, 2, 3, 4].map((item) => (
          <Skeleton key={item} className="top-landlords__row-skeleton" />
        ))}
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="admin-section-state">
        No se pudieron cargar los arrendadores. <button type="button" onClick={() => query.refetch()}>Reintentar</button>
      </div>
    );
  }

  if (!query.data?.items.length) {
    return <p className="admin-section-state">No hay arrendadores activos registrados.</p>;
  }

  return (
    <div className="top-landlords">
      {query.data.items.map((landlord) => {
        const tone = AVATAR_TONES[Math.abs(hashName(landlord.name)) % AVATAR_TONES.length];

        return (
          <article className="top-landlords__item" key={landlord.id}>
            <span className={`top-landlords__avatar top-landlords__avatar--${tone}`}>{getInitials(landlord.name)}</span>
            <div className="top-landlords__identity">
              <strong>{landlord.name}</strong>
              <span>{landlord.email}</span>
            </div>
            <div className="top-landlords__meta">
              <strong>{landlord.propertiesCount}</strong>
              <span>propiedades</span>
            </div>
            <Badge variant={landlord.status === 'inactive' ? 'inactive' : 'active'}>
              {landlord.status === 'inactive' ? 'Inactivo' : 'Activo'}
            </Badge>
            <Link className="admin-table-link" to={`/arrendadores/${landlord.id}/metricas`}>
              Ver metricas
              <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </article>
        );
      })}
    </div>
  );
}
