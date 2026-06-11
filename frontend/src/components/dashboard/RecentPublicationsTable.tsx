// frontend/src/components/dashboard/RecentPublicationsTable.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { formatDate } from '../../lib/formatters';
import type { AdminPublication, AdminPublicationStatus } from '../../types/admin';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';

interface RecentPublicationsTableProps {
  items?: AdminPublication[];
  loading: boolean;
  error?: boolean;
}

const STATUS_LABELS: Record<AdminPublicationStatus, string> = {
  publicada: 'Publicada',
  pendiente: 'Pendiente',
  arrendada: 'Arrendada',
  rechazada: 'Rechazada',
};

export function RecentPublicationsTable({ items = [], loading, error = false }: RecentPublicationsTableProps) {
  if (loading) {
    return (
      <div className="recent-publications-table" aria-label="Cargando publicaciones recientes">
        {[0, 1, 2, 3, 4].map((item) => (
          <Skeleton key={item} className="recent-publications-table__row-skeleton" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="admin-section-state">No se pudieron cargar las publicaciones recientes.</p>;
  }

  if (!items.length) {
    return (
      <p className="admin-section-state">
        No hay publicaciones recientes. <Link to="/moderacion">Ir a moderacion</Link>
      </p>
    );
  }

  return (
    <div className="recent-publications-table" role="region" aria-label="Publicaciones recientes">
      <table>
        <thead>
          <tr>
            <th>Titulo</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <strong>{item.title}</strong>
              </td>
              <td>
                <Badge variant={item.status}>{STATUS_LABELS[item.status]}</Badge>
              </td>
              <td>{formatDate(item.createdAt)}</td>
              <td>
                <Link className="admin-table-link" to={`/propiedades/${item.id}`}>
                  Abrir
                  <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
