// frontend/src/components/dashboard/KpiCard.tsx
import React from 'react';
import { AlertCircle, Minus } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

interface KpiCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  delta: number | null;
  loading: boolean;
  error?: boolean;
  description?: string;
}

const formatNumber = (value: number) =>
  new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(value || 0);

export function KpiCard({
  icon: Icon,
  label,
  value,
  delta,
  loading,
  error = false,
  description,
}: KpiCardProps) {
  if (loading) {
    return (
      <article className="admin-kpi-card" aria-label={`Cargando ${label}`}>
        <Skeleton className="admin-kpi-card__icon-skeleton" />
        <Skeleton className="admin-kpi-card__value-skeleton" />
        <Skeleton className="admin-kpi-card__label-skeleton" />
      </article>
    );
  }

  const hasDelta = typeof delta === 'number';
  const deltaTone = hasDelta && delta < 0 ? 'negative' : hasDelta && delta > 0 ? 'positive' : 'neutral';

  return (
    <article className="admin-kpi-card">
      <span className="admin-kpi-card__icon">
        {error ? <AlertCircle size={18} aria-hidden="true" /> : <Icon size={18} aria-hidden="true" />}
      </span>
      <strong className="admin-kpi-card__value" title={error ? `No se pudo cargar ${label}` : undefined}>
        {error ? '—' : formatNumber(value)}
      </strong>
      <span className="admin-kpi-card__label">{label}</span>
      <span className={`admin-kpi-card__delta admin-kpi-card__delta--${deltaTone}`}>
        {hasDelta ? `${delta > 0 ? '+' : ''}${delta}% vs ultimos 30 dias` : (
          <>
            <Minus size={13} aria-hidden="true" />
            Sin comparativo reciente
          </>
        )}
      </span>
      {description ? <small>{description}</small> : null}
    </article>
  );
}
