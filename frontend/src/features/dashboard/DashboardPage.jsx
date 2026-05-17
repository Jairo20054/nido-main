import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Heart,
  Home,
  KeyRound,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { RequestStatusBadge } from '../../components/ui/RequestStatusBadge';
import { LoadingState } from '../../components/ui/LoadingState';
import { PropertyImage } from '../../components/ui/PropertyImage';
import { PropertyStatusBadge } from '../../components/ui/PropertyStatusBadge';
import { useAuth } from '../../app/providers/AuthProvider';
import { api } from '../../lib/apiClient';
import { formatCurrency, formatDate } from '../../lib/formatters';
import {
  mockAdminStats,
  mockLandlordProperties,
  mockLandlords,
  mockProperties,
  mockReceivedRequests,
  mockTenantRequests,
} from './dashboardData';

const dashboardCopy = {
  TENANT: {
    eyebrow: 'Arrendatario',
    title: 'Encuentra y gestiona tu próximo hogar.',
    description: 'Sigue postulaciones, revisa favoritos y prepara tus documentos sin perder el hilo.',
    action: { label: 'Buscar propiedades', href: '/properties' },
  },
  LANDLORD: {
    eyebrow: 'Arrendador',
    title: 'Gestiona tus propiedades desde un solo panel.',
    description: 'Publica, revisa solicitudes y mide el interés de cada propiedad en Nido.',
    action: { label: 'Publicar propiedad', href: '/publish' },
  },
  ADMIN: {
    eyebrow: 'Administrador',
    title: 'Control operativo de la plataforma Nido.',
    description: 'Supervisa publicaciones, usuarios, solicitudes y calidad del marketplace.',
    action: { label: 'Abrir moderacion', href: '/admin' },
  },
};

function StatCard({ icon: Icon, label, value, helper }) {
  return (
    <article className="dashboard-stat-card">
      <span className="dashboard-stat-card__icon">
        <Icon size={18} aria-hidden="true" />
      </span>
      <strong>{value}</strong>
      <span>{label}</span>
      {helper ? <small>{helper}</small> : null}
    </article>
  );
}

function ProgressCard({ title, value, steps }) {
  return (
    <article className="dashboard-panel progress-panel">
      <div className="dashboard-panel__heading">
        <div>
          <span className="section__eyebrow">Avance</span>
          <h2>{title}</h2>
        </div>
        <strong>{value}%</strong>
      </div>
      <div className="progress-bar" aria-label={`Progreso ${value}%`}>
        <span style={{ width: `${value}%` }} />
      </div>
      <div className="progress-steps">
        {steps.map((step) => (
          <div className={step.done ? 'progress-step progress-step--done' : 'progress-step'} key={step.label}>
            <CheckCircle2 size={16} aria-hidden="true" />
            <span>{step.label}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function HelpCard({ title, description, cta, href }) {
  return (
    <article className="dashboard-panel help-panel">
      <Sparkles size={20} aria-hidden="true" />
      <h2>{title}</h2>
      <p>{description}</p>
      <Link to={href} className="button button--secondary">
        {cta}
        <ArrowUpRight size={16} aria-hidden="true" />
      </Link>
    </article>
  );
}

function PropertyPreviewList({ properties }) {
  return (
    <div className="dashboard-list">
      {properties.map((property) => (
        <Link to={`/properties/${property.id}`} className="dashboard-property-row" key={property.id}>
          <PropertyImage property={property} alt={property.title} className="dashboard-property-row__image" />
          <span>
            <strong>{property.title}</strong>
            <small>
              {property.neighborhood}, {property.city} - {formatCurrency(property.monthlyRent)}
            </small>
          </span>
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      ))}
    </div>
  );
}

function RequestPreviewList({ requests, received = false }) {
  return (
    <div className="dashboard-list">
      {requests.map((request) => (
        <article className="dashboard-request-row" key={request.id}>
          <div>
            <strong>{received ? request.tenant?.fullName : request.property?.title}</strong>
            <small>
              {received ? request.property?.title : request.property?.neighborhood} - ingreso {formatDate(request.desiredMoveIn)}
            </small>
          </div>
          <RequestStatusBadge status={request.status} />
        </article>
      ))}
    </div>
  );
}

function TenantDashboard({ data }) {
  const approvedRequests = data.requests.filter((item) => item.status === 'APPROVED').length;

  return (
    <>
      <div className="dashboard-stat-grid">
        <StatCard icon={Heart} label="Favoritos" value={data.favorites.length} helper="Opciones guardadas" />
        <StatCard icon={Clock3} label="Postulaciones" value={data.requests.length} helper="En seguimiento" />
        <StatCard icon={ShieldCheck} label="Aprobadas" value={approvedRequests} helper="Listas para avanzar" />
      </div>

      <div className="dashboard-grid dashboard-grid--tenant">
        <ProgressCard
          title="Perfil de arriendo"
          value={72}
          steps={[
            { label: 'Datos personales', done: true },
            { label: 'Documentos basicos', done: true },
            { label: 'Referencias', done: false },
          ]}
        />
        <section className="dashboard-panel">
          <div className="dashboard-panel__heading">
            <div>
              <span className="section__eyebrow">Guardados</span>
              <h2>Favoritos recientes</h2>
            </div>
            <Link to="/saved">Ver todos</Link>
          </div>
          <PropertyPreviewList properties={data.favorites.slice(0, 3)} />
        </section>
        <section className="dashboard-panel">
          <div className="dashboard-panel__heading">
            <div>
              <span className="section__eyebrow">Proceso</span>
              <h2>Mis postulaciones</h2>
            </div>
            <Link to="/applications">Abrir</Link>
          </div>
          <RequestPreviewList requests={data.requests} />
        </section>
        <HelpCard
          title="Documentos al dia"
          description="Mantenerlos listos acelera las respuestas de arrendadores y reduce pasos manuales."
          cta="Revisar documentos"
          href="/documents"
        />
      </div>
    </>
  );
}

function LandlordDashboard({ data }) {
  const pending = data.properties.filter((item) => item.status === 'PENDING').length;

  return (
    <>
      <div className="dashboard-stat-grid">
        <StatCard icon={Home} label="Propiedades" value={data.properties.length} helper="Activas y borradores" />
        <StatCard icon={Clock3} label="Pendientes" value={pending} helper="En revisión" />
        <StatCard icon={Users} label="Solicitudes" value={data.requests.length} helper="Recibidas" />
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-panel dashboard-panel--wide">
          <div className="dashboard-panel__heading">
            <div>
              <span className="section__eyebrow">Inventario</span>
              <h2>Mis propiedades</h2>
            </div>
            <Link to="/manage">Gestionar</Link>
          </div>
          <div className="owner-property-table">
            {data.properties.map((property) => (
              <article className="owner-property-row" key={property.id}>
                <PropertyImage property={property} alt={property.title} className="owner-property-row__image" />
                <div>
                  <strong>{property.title}</strong>
                  <small>{formatCurrency(property.monthlyRent)} - {property.views || 0} vistas</small>
                </div>
                <PropertyStatusBadge status={property.status} />
                <span>{property.conversion || '0%'} conversion</span>
              </article>
            ))}
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-panel__heading">
            <div>
              <span className="section__eyebrow">Solicitudes</span>
              <h2>Recibidas</h2>
            </div>
            <Link to="/requests">Ver</Link>
          </div>
          <RequestPreviewList requests={data.requests} received />
        </section>

        <HelpCard
          title="Publica más rápido"
          description="Usa fotos claras, precio completo y disponibilidad para mejorar la conversion."
          cta="Nueva propiedad"
          href="/publish"
        />
      </div>
    </>
  );
}

function AdminDashboard({ data }) {
  return (
    <>
      <div className="dashboard-stat-grid dashboard-stat-grid--four">
        <StatCard icon={Home} label="Propiedades" value={data.stats.totals.properties} helper="Total plataforma" />
        <StatCard icon={Users} label="Usuarios" value={data.stats.totals.users} helper="Cuentas creadas" />
        <StatCard icon={Clock3} label="Solicitudes" value={data.stats.totals.requests} helper="Históricas" />
        <StatCard icon={Heart} label="Guardados" value={data.stats.totals.favorites} helper="Interacciones" />
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-panel">
          <div className="dashboard-panel__heading">
            <div>
              <span className="section__eyebrow">Moderacion</span>
              <h2>Estados de publicaciones</h2>
            </div>
            <Link to="/admin">Abrir</Link>
          </div>
          <div className="status-summary-list">
            {data.stats.propertiesByStatus.map((item) => (
              <div className="status-summary-item" key={item.status}>
                <PropertyStatusBadge status={item.status} />
                <strong>{item.total}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-panel__heading">
            <div>
              <span className="section__eyebrow">Arrendadores</span>
              <h2>Cuentas activas</h2>
            </div>
            <Link to="/stats">Metricas</Link>
          </div>
          <div className="landlord-list landlord-list--compact">
            {data.landlords.map((landlord) => (
              <div className="landlord-item" key={landlord.id}>
                <strong>{landlord.fullName}</strong>
                <span>{landlord.email}</span>
                <small>{landlord.propertyCount} propiedades</small>
              </div>
            ))}
          </div>
        </section>

        <HelpCard
          title="Calidad del marketplace"
          description="Prioriza publicaciones verificadas y solicitudes respondidas para sostener confianza."
          cta="Ver configuracion"
          href="/settings"
        />
      </div>
    </>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role || 'TENANT';
  const copy = dashboardCopy[role] || dashboardCopy.TENANT;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      setLoading(true);
      setUsingMockData(false);

      try {
        if (role === 'ADMIN') {
          const [statsResponse, landlordsResponse] = await Promise.all([
            api.get('/admin/stats'),
            api.get('/admin/landlords', { query: { limit: 6 } }),
          ]);
          if (mounted) {
            setData({ stats: statsResponse.data, landlords: landlordsResponse.data });
          }
          return;
        }

        if (role === 'LANDLORD') {
          const [propertiesResponse, requestsResponse] = await Promise.all([
            api.get('/properties/mine', { query: { limit: 6 } }),
            api.get('/requests/received', { query: { limit: 6 } }),
          ]);
          if (mounted) {
            setData({ properties: propertiesResponse.data, requests: requestsResponse.data });
          }
          return;
        }

        const [favoritesResponse, requestsResponse] = await Promise.all([
          api.get('/favorites', { query: { limit: 6 } }),
          api.get('/requests/mine', { query: { limit: 6 } }),
        ]);
        if (mounted) {
          setData({ favorites: favoritesResponse.data, requests: requestsResponse.data });
        }
      } catch (error) {
        if (!mounted) return;
        setUsingMockData(true);
        setData(
          role === 'ADMIN'
            ? { stats: mockAdminStats, landlords: mockLandlords }
            : role === 'LANDLORD'
              ? { properties: mockLandlordProperties, requests: mockReceivedRequests }
              : { favorites: mockProperties, requests: mockTenantRequests }
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, [role]);

  const userName = useMemo(() => user?.firstName || 'Hola', [user?.firstName]);

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <span className="section__eyebrow">{copy.eyebrow}</span>
          <h1>{userName}, {copy.title}</h1>
          <p>{copy.description}</p>
        </div>
        <Link to={copy.action.href} className="button">
          {role === 'LANDLORD' ? <PlusCircle size={18} /> : <ArrowUpRight size={18} />}
          {copy.action.label}
        </Link>
      </section>

      {usingMockData ? (
        <div className="mock-data-notice">
          <FileCheck2 size={16} aria-hidden="true" />
          Mostrando datos de ejemplo mientras se conecta el backend.
        </div>
      ) : null}

      {loading || !data ? (
        <LoadingState label="Cargando dashboard..." />
      ) : role === 'ADMIN' ? (
        <AdminDashboard data={data} />
      ) : role === 'LANDLORD' ? (
        <LandlordDashboard data={data} />
      ) : (
        <TenantDashboard data={data} />
      )}
    </div>
  );
}
