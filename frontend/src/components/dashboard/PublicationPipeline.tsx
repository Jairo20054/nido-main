// frontend/src/components/dashboard/PublicationPipeline.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '../ui/Skeleton';
import type { AdminPublicationStatus } from '../../types/admin';

interface PublicationPipelineProps {
  pipeline?: Record<AdminPublicationStatus, number>;
  loading: boolean;
  error?: boolean;
}

const STATUS_CONFIG: Array<{ slug: AdminPublicationStatus; label: string }> = [
  { slug: 'publicada', label: 'Publicada' },
  { slug: 'pendiente', label: 'Pendiente' },
  { slug: 'arrendada', label: 'Arrendada' },
  { slug: 'rechazada', label: 'Rechazada' },
];

export function PublicationPipeline({ pipeline, loading, error = false }: PublicationPipelineProps) {
  const navigate = useNavigate();
  const total = STATUS_CONFIG.reduce((sum, item) => sum + (pipeline?.[item.slug] || 0), 0);

  if (loading) {
    return (
      <div className="publication-pipeline" aria-label="Cargando estados de publicaciones">
        <Skeleton className="publication-pipeline__bar-skeleton" />
        <div className="publication-pipeline__legend">
          {STATUS_CONFIG.map((item) => (
            <Skeleton key={item.slug} className="publication-pipeline__legend-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="admin-section-state">No se pudo cargar el estado de publicaciones.</p>;
  }

  if (!total) {
    return (
      <div className="admin-section-state">
        No hay publicaciones en moderacion. <button type="button" onClick={() => navigate('/moderacion')}>Ir a moderacion</button>
      </div>
    );
  }

  return (
    <div className="publication-pipeline">
      <div className="publication-pipeline__bar" role="list" aria-label="Distribucion de estados de publicaciones">
        {STATUS_CONFIG.map((item) => {
          const count = pipeline?.[item.slug] || 0;
          const width = Math.max((count / total) * 100, count > 0 ? 8 : 0);

          return (
            <button
              key={item.slug}
              type="button"
              className={`publication-pipeline__segment publication-pipeline__segment--${item.slug}`}
              style={{ flexBasis: `${width}%` }}
              aria-label={`${item.label}: ${count} publicaciones. Abrir moderacion filtrada.`}
              onClick={() => navigate(`/moderacion?status=${item.slug}`)}
            >
              <strong>{count}</strong>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
      <div className="publication-pipeline__legend">
        {STATUS_CONFIG.map((item) => (
          <button
            key={item.slug}
            type="button"
            className="publication-pipeline__legend-item"
            onClick={() => navigate(`/moderacion?status=${item.slug}`)}
          >
            <span className={`publication-pipeline__dot publication-pipeline__dot--${item.slug}`} />
            <span>{item.label}</span>
            <strong>{pipeline?.[item.slug] || 0}</strong>
          </button>
        ))}
      </div>
    </div>
  );
}
