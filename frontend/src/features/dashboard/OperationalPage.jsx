import React from 'react';
import { BarChart3, ClipboardList, FileText, Settings, UploadCloud } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RequestStatusBadge } from '../../components/ui/RequestStatusBadge';
import { useAuth } from '../../app/providers/useAuth';
import { formatDate } from '../../lib/formatters';
import {
  mockAdminStats,
  mockReceivedRequests,
  mockTenantRequests,
} from './dashboardData';

const pageConfig = {
  applications: {
    icon: ClipboardList,
    eyebrow: 'Postulaciones',
    title: 'Seguimiento de solicitudes',
    description: 'Una bandeja sencilla para revisar el estado de cada conversación iniciada en NIDO.',
  },
  documents: {
    icon: FileText,
    eyebrow: 'Documentos',
    title: 'Centro documental',
    description: 'Prepara soportes, referencias y documentos necesarios para avanzar sin friccion.',
  },
  requests: {
    icon: ClipboardList,
    eyebrow: 'Solicitudes',
    title: 'Solicitudes recibidas',
    description: 'Prioriza interesados, revisa estados y mantente al día con cada propiedad.',
  },
  stats: {
    icon: BarChart3,
    eyebrow: 'Estadisticas',
    title: 'Rendimiento de Nido',
    description: 'Métricas base para tomar decisiones sobre publicaciones, tráfico e interés.',
  },
  settings: {
    icon: Settings,
    eyebrow: 'Configuracion',
    title: 'Preferencias de cuenta',
    description: 'Ajustes operativos preparados para conectar reglas, notificaciones y privacidad.',
  },
};

function RequestRows({ role }) {
  const rows = role === 'TENANT' ? mockTenantRequests : mockReceivedRequests;

  return (
    <div className="dashboard-list">
      {rows.map((request) => (
        <article className="dashboard-request-row" key={request.id}>
          <div>
            <strong>{role === 'TENANT' ? request.property.title : request.tenant.fullName}</strong>
            <small>
              {request.property.neighborhood || request.property.title} - ingreso {formatDate(request.desiredMoveIn)}
            </small>
          </div>
          <RequestStatusBadge status={request.status} />
        </article>
      ))}
    </div>
  );
}

function DocumentChecklist() {
  const docs = ['Documento de identidad', 'Comprobante de ingresos', 'Referencia laboral', 'Autorizacion de estudio'];

  return (
    <div className="document-checklist">
      {docs.map((item, index) => (
        <article className="document-checklist__item" key={item}>
          <UploadCloud size={18} aria-hidden="true" />
          <div>
            <strong>{item}</strong>
            <small>{index < 2 ? 'Listo para validar' : 'Pendiente por cargar'}</small>
          </div>
          <span>{index < 2 ? 'Completo' : 'Pendiente'}</span>
        </article>
      ))}
    </div>
  );
}

function StatsContent() {
  return (
    <div className="dashboard-stat-grid dashboard-stat-grid--four">
      <article className="dashboard-stat-card">
        <strong>{mockAdminStats.totals.properties}</strong>
        <span>Propiedades</span>
        <small>Publicaciones en plataforma</small>
      </article>
      <article className="dashboard-stat-card">
        <strong>{mockAdminStats.totals.requests}</strong>
        <span>Postulaciones</span>
        <small>Interacciones históricas</small>
      </article>
      <article className="dashboard-stat-card">
        <strong>{mockAdminStats.totals.favorites}</strong>
        <span>Favoritos</span>
        <small>Propiedades guardadas</small>
      </article>
      <article className="dashboard-stat-card">
        <strong>94%</strong>
        <span>Disponibilidad</span>
        <small>Salud operativa estimada</small>
      </article>
    </div>
  );
}

export function OperationalPage({ type = 'applications' }) {
  const { user } = useAuth();
  const config = pageConfig[type] || pageConfig.applications;
  const Icon = config.icon;

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero dashboard-hero--compact">
        <span className="dashboard-hero__icon">
          <Icon size={22} aria-hidden="true" />
        </span>
        <div>
          <span className="section__eyebrow">{config.eyebrow}</span>
          <h1>{config.title}</h1>
          <p>{config.description}</p>
        </div>
      </section>

      {type === 'documents' ? (
        <section className="dashboard-panel">
          <DocumentChecklist />
        </section>
      ) : type === 'stats' ? (
        <StatsContent />
      ) : type === 'settings' ? (
        <section className="dashboard-panel">
          <div className="settings-preview-grid">
            <article>
              <strong>Notificaciones</strong>
              <p>Alertas por nuevas solicitudes, cambios de estado y mensajes relevantes.</p>
            </article>
            <article>
              <strong>Privacidad</strong>
              <p>Control de datos visibles para arrendadores, arrendatarios y administradores.</p>
            </article>
            <article>
              <strong>Cuenta</strong>
              <p>Actualiza tu perfil desde Mi cuenta mientras se conectan ajustes avanzados.</p>
            </article>
          </div>
          <Link className="button button--secondary" to="/account">
            Ir a Mi cuenta
          </Link>
        </section>
      ) : (
        <section className="dashboard-panel">
          <RequestRows role={user?.role || 'TENANT'} />
        </section>
      )}
    </div>
  );
}
