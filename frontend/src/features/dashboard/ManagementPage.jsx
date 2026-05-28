import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { EmptyState } from '../../components/ui/EmptyState';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { LoadingState } from '../../components/ui/LoadingState';
import { PropertyImage } from '../../components/ui/PropertyImage';
import { PropertyStatusBadge } from '../../components/ui/PropertyStatusBadge';
import { RequestStatusBadge } from '../../components/ui/RequestStatusBadge';
import { useAuth } from '../../app/providers/useAuth';
import { api } from '../../lib/apiClient';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { PropertyForm } from '../properties/PropertyForm';

/**
 * Componente de uso para el panel del arrendador.
 * Centraliza el alta, la edicion y la eliminacion de propiedades, junto con la
 * revision de solicitudes recibidas sobre los inmuebles del usuario.
 */
export function ManagementPage() {
  const { isAdmin, user } = useAuth();
  const location = useLocation();
  const [properties, setProperties] = useState([]);
  const [requests, setRequests] = useState([]);
  const [editingProperty, setEditingProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [publicationSuccess, setPublicationSuccess] = useState(false);

  // Carga en paralelo inventario y solicitudes para reducir el tiempo de espera del dashboard.
  const loadDashboard = async () => {
    setLoading(true);

    try {
      const [propertyResponse, requestResponse] = await Promise.all([
        api.get('/properties/mine', { query: { limit: 50 } }),
        api.get('/requests/received', { query: { limit: 50 } }),
      ]);
      setProperties(propertyResponse.data);
      setRequests(requestResponse.data);
      setMessage('');
    } catch (requestError) {
      setMessage(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const dashboardStats = useMemo(
    () => [
      { label: 'Mis publicaciones', value: properties.length },
      {
        label: 'Pendientes de revisión',
        value: properties.filter((item) => item.status === 'PENDING').length,
      },
      { label: 'Solicitudes recibidas', value: requests.length },
      { label: 'Rol actual', value: user?.role || 'LANDLORD' },
    ],
    [properties, requests.length, user?.role]
  );

  // Unifica alta y edicion reutilizando el mismo formulario wizard.
  const handleSubmitProperty = async (payload) => {
    setSubmitting(true);
    setMessage('');
    setPublicationSuccess(false);

    try {
      const isPublicationSubmit = payload.status && payload.status !== 'DRAFT';

      if (editingProperty) {
        await api.patch(`/properties/${editingProperty.id}`, payload);
        setMessage('Publicación actualizada correctamente.');
      } else {
        const response = await api.post('/properties', payload);
        setMessage(response.message || 'Publicación guardada correctamente.');
      }

      setPublicationSuccess(Boolean(isPublicationSubmit));
      setEditingProperty(null);
      await loadDashboard();
      return true;
    } catch (requestError) {
      setPublicationSuccess(false);
      setMessage(requestError.message);
      throw requestError;
    } finally {
      setSubmitting(false);
    }
  };

  // Actualiza la bandeja local tras eliminar una propiedad.
  const handleDeleteProperty = async (propertyId) => {
    const confirmed = window.confirm('¿Quieres eliminar esta propiedad? Esta acción no se puede deshacer.');

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/properties/${propertyId}`);
      setProperties((current) => current.filter((item) => item.id !== propertyId));
      setMessage('Propiedad eliminada.');
    } catch (requestError) {
      setMessage(requestError.message);
    }
  };

  // Cambia el estado de una solicitud desde el panel del propietario.
  const handleReviewRequest = async (requestId, status) => {
    try {
      const response = await api.patch(`/requests/${requestId}/status`, { status });
      setRequests((current) =>
        current.map((item) => (item.id === requestId ? response.data : item))
      );
      setMessage('Postulación actualizada.');
    } catch (requestError) {
      setMessage(requestError.message);
    }
  };

  if (isAdmin && location.pathname !== '/publish') {
    // El rol admin tiene un panel dedicado para evitar mezclar responsabilidades.
    return (
      <div className="page">
        <section className="section">
          <EmptyState
            title="El administrador tiene su propio panel"
            description="Usa el panel de administración para revisar propiedades, aprobar publicaciones y consultar métricas."
            actionLabel="Ir al panel admin"
            onAction={() => {
              window.location.href = '/admin';
            }}
          />
        </section>
      </div>
    );
  }

  return (
    <div className="page page--publish">
      <section className="section">
        <div className="section__heading">
          <div>
            <span className="section__eyebrow">Panel arrendador</span>
            <h1>Publica, edita y da seguimiento a tus propiedades</h1>
          </div>
        </div>

        <div className="stats-row stats-row--four publish-stats">
          {dashboardStats.map((item) => (
            <div className="stats-card" key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        <InlineMessage
          tone={message && !message.toLowerCase().includes('error') ? 'success' : 'danger'}
        >
          {message}
        </InlineMessage>
        {publicationSuccess ? (
          <div className="publish-success-actions" role="status" aria-live="polite">
            <div>
              <strong>Publicacion enviada correctamente.</strong>
              <span>Puedes volver al inicio del arrendador o revisar tu inventario.</span>
            </div>
            <div>
              <Link className="button" to="/dashboard">
                Volver al home
              </Link>
              <Link className="button button--secondary" to="/manage">
                Ver mis propiedades
              </Link>
            </div>
          </div>
        ) : null}

        <div className="dashboard-layout publish-layout">
          <div className="dashboard-layout__form publish-layout__form">
            <PropertyForm
              property={editingProperty}
              submitting={submitting}
              onCancel={() => setEditingProperty(null)}
              onSubmit={handleSubmitProperty}
              canPublishDirectly={isAdmin}
            />
          </div>

          <aside className="dashboard-layout__content publish-layout__aside" aria-label="Resumen del panel arrendador">
            <div className="content-card publish-status-card">
              <div>
                <span className="section__eyebrow">Estado</span>
                <h2>{editingProperty ? 'Editando publicacion' : 'Nueva publicacion'}</h2>
                <p>
                  {editingProperty
                    ? 'Estas actualizando una propiedad existente. Guarda los cambios cuando termines.'
                    : 'Completa los pasos del formulario y guarda un borrador o envia la propiedad a revision.'}
                </p>
              </div>
              <div className="publish-status-card__metrics">
                <span>
                  <strong>{properties.length}</strong>
                  Publicaciones
                </span>
                <span>
                  <strong>{properties.filter((item) => item.status === 'PENDING').length}</strong>
                  En revision
                </span>
                <span>
                  <strong>{requests.length}</strong>
                  Postulaciones
                </span>
              </div>
            </div>

            <div className="content-card publish-side-card">
              <div className="section__heading section__heading--tight">
                <div>
                  <span className="section__eyebrow">Inventario</span>
                  <h2>Mis propiedades</h2>
                </div>
              </div>

              {loading ? (
                <LoadingState label="Cargando propiedades..." />
              ) : properties.length ? (
                <div className="management-list">
                  {properties.map((property) => (
                    <div className="management-item management-item--stack" key={property.id}>
                      <div className="management-item__main">
                        <PropertyImage
                          property={property}
                          alt={property.title}
                          className="management-item__thumb"
                        />
                        <div>
                          <strong>{property.title}</strong>
                          <p>
                            {property.city}
                            {property.neighborhood ? `, ${property.neighborhood}` : ''} -{' '}
                            {formatCurrency(property.monthlyRent)}
                          </p>
                          <small>
                            {property.availableImmediately
                              ? 'Disponible ahora'
                              : `Disponible ${formatDate(property.availableFrom)}`}
                          </small>
                        </div>
                      </div>
                      <div className="management-item__actions">
                        <PropertyStatusBadge status={property.status} />
                        <button
                          className="button button--secondary"
                          type="button"
                          onClick={() => setEditingProperty(property)}
                        >
                          Editar
                        </button>
                        <button
                          className="button button--ghost-danger"
                          type="button"
                          onClick={() => handleDeleteProperty(property.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Aún no has publicado propiedades"
                  description="Usa el formulario guiado para guardar un borrador o enviar tu primera publicación a revisión."
                />
              )}
            </div>

            <div className="content-card publish-side-card">
              <div className="section__heading section__heading--tight">
                <div>
                  <span className="section__eyebrow">Postulaciones</span>
                  <h2>Postulaciones recibidas</h2>
                </div>
              </div>
              {loading ? (
                <LoadingState label="Cargando solicitudes..." />
              ) : requests.length ? (
                <div className="request-list">
                  {requests.map((request) => (
                    <div className="request-item request-item--stack" key={request.id}>
                      <div>
                        <strong>{request.property.title}</strong>
                        <p>
                          {request.tenant.fullName} - ingreso {formatDate(request.desiredMoveIn)} -{' '}
                          {request.leaseMonths} meses
                        </p>
                        <small>{request.message}</small>
                      </div>
                      <div className="request-item__actions">
                        <RequestStatusBadge status={request.status} />
                        {request.status === 'PENDING' ? (
                          <div className="request-item__buttons">
                            <button
                              className="button"
                              type="button"
                              onClick={() => handleReviewRequest(request.id, 'APPROVED')}
                            >
                              Aprobar
                            </button>
                            <button
                              className="button button--secondary"
                              type="button"
                              onClick={() => handleReviewRequest(request.id, 'REJECTED')}
                            >
                              Rechazar
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Aún no tienes postulaciones"
                  description="Cuando un arrendatario se postule a una propiedad podrás revisarlo aquí."
                />
              )}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
