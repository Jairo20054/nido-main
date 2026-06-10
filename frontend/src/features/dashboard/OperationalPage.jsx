import React from 'react';
import {
  BarChart3,
  Bell,
  ClipboardList,
  CreditCard,
  FileText,
  KeyRound,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  UploadCloud,
  UserRound,
} from 'lucide-react';
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

const SETTINGS_SECTIONS = [
  {
    icon: UserRound,
    title: 'Perfil',
    description: 'Nombre, telefono, avatar y datos visibles en tus conversaciones.',
    action: 'Editar en Mi cuenta',
    href: '/account',
  },
  {
    icon: KeyRound,
    title: 'Seguridad',
    description: 'Acceso protegido, recuperacion de cuenta y sesiones autenticadas.',
    action: 'Revisar acceso',
    href: '/account',
  },
  {
    icon: Bell,
    title: 'Notificaciones',
    description: 'Alertas sobre solicitudes, cambios de estado y mensajes relevantes.',
    action: 'Configurar despues',
    href: '/settings',
    muted: true,
  },
  {
    icon: SlidersHorizontal,
    title: 'Preferencias',
    description: 'Filtros, ciudad principal y opciones para una experiencia mas precisa.',
    action: 'Ajustar despues',
    href: '/settings',
    muted: true,
  },
  {
    icon: ShieldCheck,
    title: 'Privacidad',
    description: 'Control de datos visibles para arrendadores, arrendatarios y administradores.',
    action: 'Ver perfil',
    href: '/account',
  },
  {
    icon: CreditCard,
    title: 'Metodos de pago',
    description: 'Espacio preparado para pagos y validaciones cuando el modulo este activo.',
    action: 'No disponible aun',
    href: '/settings',
    muted: true,
  },
];

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
        <section className="dashboard-panel settings-panel">
          <div className="dashboard-panel__heading">
            <div>
              <h2>Configuracion de cuenta</h2>
              <p>Organiza tus datos, privacidad y preferencias desde un solo lugar.</p>
            </div>
            <Link className="button button--secondary" to="/account">
              Ir a Mi cuenta
            </Link>
          </div>
          <div className="settings-preview-grid settings-preview-grid--detailed">
            {SETTINGS_SECTIONS.map(({ icon: SectionIcon, title, description, action, href, muted }) => (
              <article key={title} className={muted ? 'settings-preview-item settings-preview-item--muted' : 'settings-preview-item'}>
                <span className="settings-preview-item__icon">
                  <SectionIcon size={18} aria-hidden="true" />
                </span>
                <div>
                  <strong>{title}</strong>
                  <p>{description}</p>
                  <Link to={href}>{action}</Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="dashboard-panel">
          <RequestRows role={user?.role || 'TENANT'} />
        </section>
      )}
    </div>
  );
}
