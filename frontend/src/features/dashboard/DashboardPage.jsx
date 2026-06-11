// frontend/src/features/dashboard/DashboardPage.jsx
import React, { useMemo, useState } from 'react';
import { ArrowUpRight, ClipboardList, Heart, Home, ShieldCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { MarketplaceBanner } from '../../components/dashboard/MarketplaceBanner';
import { PublicationPipeline } from '../../components/dashboard/PublicationPipeline';
import { RecentPublicationsTable } from '../../components/dashboard/RecentPublicationsTable';
import { TopLandlords } from '../../components/dashboard/TopLandlords';
import { useAuth } from '../../app/providers/useAuth';
import { useAdminPublications } from '../../hooks/useAdminPublications';
import { useAdminStats } from '../../hooks/useAdminStats';

const kpiConfig = [
  {
    key: 'properties',
    icon: Home,
    label: 'Propiedades',
    description: 'Inventario total de publicaciones',
  },
  {
    key: 'users',
    icon: Users,
    label: 'Usuarios',
    description: 'Cuentas registradas',
  },
  {
    key: 'requests',
    icon: ClipboardList,
    label: 'Solicitudes',
    description: 'Postulaciones recibidas',
  },
  {
    key: 'saved',
    icon: Heart,
    label: 'Guardados',
    description: 'Interacciones de interes',
  },
];

function AdminErrorAlert({ failures }) {
  const [dismissed, setDismissed] = useState(false);
  const visibleFailures = failures.filter((item) => item.failed);

  if (dismissed || !visibleFailures.length) {
    return null;
  }

  return (
    <div className="admin-dashboard-alert" role="alert">
      <ShieldCheck size={16} aria-hidden="true" />
      <span>
        No se pudo cargar {visibleFailures.map((item) => item.label).join(', ')}.
      </span>
      <div>
        {visibleFailures.map((item) => (
          <button type="button" key={item.label} onClick={item.refetch}>
            Reintentar {item.shortLabel}
          </button>
        ))}
        <button type="button" onClick={() => setDismissed(true)} aria-label="Ocultar alerta">
          Ocultar
        </button>
      </div>
    </div>
  );
}

function RestrictedDashboard({ user }) {
  const isLandlord = user?.role === 'LANDLORD';

  return (
    <div className="dashboard-page admin-dashboard-page">
      <section className="admin-dashboard-hero">
        <div>
          <span className="section__eyebrow">{isLandlord ? 'Arrendador' : 'Arrendatario'}</span>
          <h1>Inicio</h1>
          <p>
            El panel administrativo de Nido esta reservado para usuarios con permisos de plataforma.
          </p>
        </div>
        <Link to={isLandlord ? '/manage' : '/properties'} className="button">
          {isLandlord ? 'Gestionar propiedades' : 'Buscar propiedades'}
          <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}

function AdminDashboard() {
  const statsQuery = useAdminStats();
  const publicationsQuery = useAdminPublications({ limit: 5, sort: 'createdAt:desc' });

  const failures = useMemo(
    () => [
      {
        label: 'metricas',
        shortLabel: 'metricas',
        failed: statsQuery.isError,
        refetch: () => statsQuery.refetch(),
      },
      {
        label: 'publicaciones',
        shortLabel: 'publicaciones',
        failed: publicationsQuery.isError,
        refetch: () => publicationsQuery.refetch(),
      },
    ],
    [publicationsQuery, statsQuery]
  );

  return (
    <div className="dashboard-page admin-dashboard-page">
      <section className="admin-dashboard-hero">
        <div>
          <span className="section__eyebrow">Administrador</span>
          <h1>Inicio</h1>
          <p>Lectura operativa de publicaciones, usuarios y salud del marketplace Nido.</p>
        </div>
        <Link to="/moderacion" className="button">
          Abrir moderacion
          <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </section>

      <AdminErrorAlert failures={failures} />

      <section className="admin-kpi-strip" aria-label="Metricas principales">
        {kpiConfig.map((item) => {
          const metric = statsQuery.data?.[item.key];

          return (
            <KpiCard
              key={item.key}
              icon={item.icon}
              label={item.label}
              value={metric?.value || 0}
              delta={metric?.delta ?? null}
              description={item.description}
              loading={statsQuery.isLoading}
              error={statsQuery.isError}
            />
          );
        })}
      </section>

      <section className="admin-operational-grid" aria-label="Operacion del marketplace">
        <div className="admin-dashboard-panel admin-dashboard-panel--pipeline">
          <div className="admin-dashboard-panel__heading">
            <div>
              <span className="section__eyebrow">Moderacion</span>
              <h2>Estados de publicaciones</h2>
            </div>
            <Link to="/moderacion">Ver todo</Link>
          </div>
          <PublicationPipeline
            pipeline={publicationsQuery.data?.pipeline}
            loading={publicationsQuery.isLoading}
            error={publicationsQuery.isError}
          />
          <RecentPublicationsTable
            items={publicationsQuery.data?.items}
            loading={publicationsQuery.isLoading}
            error={publicationsQuery.isError}
          />
        </div>

        <aside className="admin-dashboard-panel">
          <div className="admin-dashboard-panel__heading">
            <div>
              <span className="section__eyebrow">Arrendadores</span>
              <h2>Arrendadores activos</h2>
            </div>
          </div>
          <TopLandlords />
        </aside>
      </section>

      <MarketplaceBanner />
    </div>
  );
}

export function DashboardPage() {
  const { isAdmin, user } = useAuth();

  if (!isAdmin) {
    return <RestrictedDashboard user={user} />;
  }

  return <AdminDashboard />;
}
