import React, { useEffect, useMemo, useState } from 'react';
import {
  Archive,
  ArrowUpDown,
  Edit3,
  Eye,
  PlusCircle,
  Search,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { EmptyState } from '../../components/ui/EmptyState';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { LoadingState } from '../../components/ui/LoadingState';
import { PropertyImage } from '../../components/ui/PropertyImage';
import { PropertyStatusBadge } from '../../components/ui/PropertyStatusBadge';
import { useAuth } from '../../app/providers/useAuth';
import { PROPERTY_STATUS_OPTIONS } from '../../lib/constants';
import { api } from '../../lib/apiClient';
import { formatCurrency, formatDate } from '../../lib/formatters';

const STATUS_FILTERS = [{ value: 'ALL', label: 'Todos' }, ...PROPERTY_STATUS_OPTIONS];

const SORT_OPTIONS = [
  { value: 'updated-desc', label: 'Mas recientes' },
  { value: 'rent-desc', label: 'Mayor precio' },
  { value: 'rent-asc', label: 'Menor precio' },
  { value: 'status', label: 'Estado' },
];

const ACTIVE_STATUSES = ['PUBLISHED', 'APPROVED'];
const PAUSED_STATUSES = ['ARCHIVED', 'RENTED'];

const normalizeSearch = (value) =>
  String(value || '')
    .trim()
    .toLowerCase();

const getLocationLabel = (property) =>
  [property.neighborhood, property.city, property.department].filter(Boolean).join(', ') ||
  'Ubicacion pendiente';

const getLastUpdatedLabel = (property) =>
  formatDate(property.updatedAt || property.createdAt || property.publishedAt) || 'Sin fecha';

const getToggleAction = (property) => {
  if (ACTIVE_STATUSES.includes(property.status) || property.status === 'PENDING') {
    return { label: 'Pausar', status: 'ARCHIVED' };
  }

  if (property.status === 'ARCHIVED') {
    return { label: 'Enviar a revision', status: 'PENDING' };
  }

  if (property.status === 'DRAFT' || property.status === 'REJECTED') {
    return { label: 'Editar y enviar', status: null };
  }

  return { label: 'Gestionar', status: null };
};

function StatTile({ label, value, helper }) {
  return (
    <article className="landlord-stat-tile">
      <strong>{value}</strong>
      <span>{label}</span>
      {helper ? <small>{helper}</small> : null}
    </article>
  );
}

function PropertyFilters({ filters, onChange }) {
  return (
    <div className="landlord-filters" aria-label="Filtros de mis propiedades">
      <div className="field-group landlord-search-field">
        <label htmlFor="landlord-property-search">
          <Search size={16} aria-hidden="true" />
          Buscar
        </label>
        <input
          id="landlord-property-search"
          value={filters.query}
          onChange={(event) => onChange({ query: event.target.value })}
          placeholder="Titulo, ciudad o barrio"
        />
      </div>
      <div className="field-group">
        <label htmlFor="landlord-property-status">
          <SlidersHorizontal size={16} aria-hidden="true" />
          Estado
        </label>
        <select
          id="landlord-property-status"
          value={filters.status}
          onChange={(event) => onChange({ status: event.target.value })}
        >
          {STATUS_FILTERS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field-group">
        <label htmlFor="landlord-property-sort">
          <ArrowUpDown size={16} aria-hidden="true" />
          Ordenar
        </label>
        <select
          id="landlord-property-sort"
          value={filters.sort}
          onChange={(event) => onChange({ sort: event.target.value })}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function PropertyManagementCard({ onDelete, onEdit, onToggleStatus, property, toggling }) {
  const action = getToggleAction(property);
  const requestCount = property.requestCount ?? property._count?.rentalRequests ?? 0;

  return (
    <article className="landlord-property-card">
      <PropertyImage property={property} alt={property.title} className="landlord-property-card__image" />
      <div className="landlord-property-card__body">
        <div className="landlord-property-card__top">
          <div>
            <PropertyStatusBadge status={property.status} />
            <h2>{property.title}</h2>
          </div>
          <strong>{formatCurrency(property.monthlyRent)}</strong>
        </div>
        <p>{getLocationLabel(property)}</p>
        <div className="landlord-property-card__facts">
          <span>{property.bedrooms || 0} hab.</span>
          <span>{property.bathrooms || 0} banos</span>
          <span>{property.areaM2 || 0} m2</span>
          <span>{requestCount} solicitudes</span>
          <span>Actualizada {getLastUpdatedLabel(property)}</span>
        </div>
        <div className="landlord-property-card__actions">
          <Link className="button button--secondary" to={`/properties/${property.id}`}>
            <Eye size={16} aria-hidden="true" />
            Ver detalle
          </Link>
          <button className="button button--secondary" type="button" onClick={() => onEdit(property)}>
            <Edit3 size={16} aria-hidden="true" />
            Editar
          </button>
          <button
            className="button button--secondary"
            type="button"
            disabled={toggling === property.id}
            onClick={() => (action.status ? onToggleStatus(property, action.status) : onEdit(property))}
          >
            <Archive size={16} aria-hidden="true" />
            {toggling === property.id ? 'Guardando...' : action.label}
          </button>
          <Link className="button button--secondary" to="/requests">
            Solicitudes
          </Link>
          <button className="button button--ghost-danger" type="button" onClick={() => onDelete(property.id)}>
            <Trash2 size={16} aria-hidden="true" />
            Eliminar
          </button>
        </div>
      </div>
    </article>
  );
}

export function ManagementPage() {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [properties, setProperties] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(location.state?.message || '');
  const [messageTone, setMessageTone] = useState(location.state?.tone || 'success');
  const [togglingPropertyId, setTogglingPropertyId] = useState('');
  const [filters, setFilters] = useState({
    query: '',
    status: 'ALL',
    sort: 'updated-desc',
  });

  const loadDashboard = async () => {
    setLoading(true);

    try {
      const [propertyResult, requestResult] = await Promise.allSettled([
        api.get('/properties/mine', { query: { limit: 50 } }),
        api.get('/requests/received', { query: { limit: 50 } }),
      ]);

      if (propertyResult.status === 'rejected') {
        throw propertyResult.reason;
      }

      setProperties(propertyResult.value.data);

      if (requestResult.status === 'fulfilled') {
        setRequests(requestResult.value.data);
      } else {
        console.warn('[MANAGEMENT_REQUESTS] No fue posible cargar solicitudes recibidas', {
          message: requestResult.reason?.message,
          status: requestResult.reason?.status,
        });
        setRequests([]);
      }

      if (!location.state?.message) {
        setMessage(requestResult.status === 'rejected' ? 'Tus propiedades cargaron; las solicitudes se intentaran de nuevo mas tarde.' : '');
        setMessageTone(requestResult.status === 'rejected' ? 'neutral' : 'success');
      }
    } catch (requestError) {
      setMessageTone('danger');
      setMessage(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (location.state?.message) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.message]);

  const stats = useMemo(
    () => ({
      total: properties.length,
      active: properties.filter((item) => ACTIVE_STATUSES.includes(item.status)).length,
      paused: properties.filter((item) => PAUSED_STATUSES.includes(item.status)).length,
      pending: properties.filter((item) => item.status === 'PENDING').length,
    }),
    [properties]
  );

  const visibleProperties = useMemo(() => {
    const query = normalizeSearch(filters.query);

    return properties
      .filter((property) => {
        const matchesStatus = filters.status === 'ALL' || property.status === filters.status;
        const searchable = [property.title, property.city, property.neighborhood, property.department]
          .map(normalizeSearch)
          .join(' ');
        return matchesStatus && (!query || searchable.includes(query));
      })
      .sort((left, right) => {
        if (filters.sort === 'rent-asc') return Number(left.monthlyRent || 0) - Number(right.monthlyRent || 0);
        if (filters.sort === 'rent-desc') return Number(right.monthlyRent || 0) - Number(left.monthlyRent || 0);
        if (filters.sort === 'status') return String(left.status).localeCompare(String(right.status));
        return new Date(right.updatedAt || right.createdAt || 0) - new Date(left.updatedAt || left.createdAt || 0);
      });
  }, [filters, properties]);

  const handleFilterChange = (updates) => {
    setFilters((current) => ({ ...current, ...updates }));
  };

  const handleEdit = (property) => {
    navigate('/publish', { state: { property } });
  };

  const handleToggleStatus = async (property, status) => {
    setTogglingPropertyId(property.id);
    setMessage('');

    try {
      const response = await api.patch(`/properties/${property.id}`, { status });
      setProperties((current) =>
        current.map((item) => (item.id === property.id ? response.data : item))
      );
      setMessageTone('success');
      setMessage(status === 'ARCHIVED' ? 'Propiedad pausada correctamente.' : 'Propiedad enviada a revision.');
    } catch (requestError) {
      setMessageTone('danger');
      setMessage(requestError.message);
    } finally {
      setTogglingPropertyId('');
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    const confirmed = window.confirm('Quieres eliminar esta propiedad? Esta accion no se puede deshacer.');

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/properties/${propertyId}`);
      setProperties((current) => current.filter((item) => item.id !== propertyId));
      setMessageTone('success');
      setMessage('Propiedad eliminada.');
    } catch (requestError) {
      setMessageTone('danger');
      setMessage(requestError.message);
    }
  };

  if (isAdmin) {
    return (
      <div className="page">
        <section className="section">
          <EmptyState
            title="El administrador tiene su propio panel"
            description="Usa el panel de administracion para revisar propiedades, aprobar publicaciones y consultar metricas."
            actionLabel="Ir al panel admin"
            onAction={() => navigate('/admin')}
          />
        </section>
      </div>
    );
  }

  return (
    <div className="page landlord-management-page">
      <section className="section">
        <div className="section__heading landlord-page-heading">
          <div>
            <span className="section__eyebrow">Panel arrendador</span>
            <h1>Mis propiedades</h1>
            <p>Administra tus publicaciones, revisa su estado y manten actualizada la informacion de tus inmuebles.</p>
          </div>
          <Link className="button" to="/publish">
            <PlusCircle size={18} aria-hidden="true" />
            Publicar propiedad
          </Link>
        </div>

        <div className="landlord-stat-grid">
          <StatTile label="Total publicadas" value={stats.total} helper={`Arrendador: ${user?.firstName || 'NIDO'}`} />
          <StatTile label="Activas" value={stats.active} helper="Publicadas o aprobadas" />
          <StatTile label="Pausadas" value={stats.paused} helper="Archivadas o arrendadas" />
          <StatTile label="Pendientes" value={stats.pending} helper="En revision del equipo" />
          <StatTile label="Solicitudes" value={requests.length} helper="Recibidas en tus inmuebles" />
        </div>

        <InlineMessage tone={messageTone}>{message}</InlineMessage>

        <PropertyFilters filters={filters} onChange={handleFilterChange} />

        {loading ? (
          <LoadingState label="Cargando tus propiedades..." />
        ) : properties.length ? (
          <div className="landlord-property-list">
            {visibleProperties.length ? (
              visibleProperties.map((property) => (
                <PropertyManagementCard
                  key={property.id}
                  property={property}
                  toggling={togglingPropertyId}
                  onDelete={handleDeleteProperty}
                  onEdit={handleEdit}
                  onToggleStatus={handleToggleStatus}
                />
              ))
            ) : (
              <EmptyState
                title="No encontramos propiedades con esos filtros"
                description="Ajusta la busqueda o vuelve a mostrar todos los estados."
                actionLabel="Limpiar filtros"
                onAction={() => setFilters({ query: '', status: 'ALL', sort: 'updated-desc' })}
              />
            )}
          </div>
        ) : (
          <EmptyState
            title="Aun no has publicado propiedades."
            description="Crea tu primera publicacion con fotos, ubicacion y condiciones claras para que los usuarios puedan reservar con confianza."
            actionLabel="Publicar mi primera propiedad"
            onAction={() => navigate('/publish')}
          />
        )}
      </section>
    </div>
  );
}
