import React, { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../../components/ui/EmptyState';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { LoadingState } from '../../components/ui/LoadingState';
import { PropertyImage } from '../../components/ui/PropertyImage';
import { PropertyStatusBadge } from '../../components/ui/PropertyStatusBadge';
import { RequestStatusBadge } from '../../components/ui/RequestStatusBadge';
import { useAuth } from '../../app/providers/AuthProvider';
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
  const [properties, setProperties] = useState([]);
  const [requests, setRequests] = useState([]);
  const [editingProperty, setEditingProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Carga en paralelo inventario y solicitudes para reducir el tiempo de espera del dashboard.
  const loadDashboard = async () => {
    setLoading(true);

    try {
      const [propertyResponse, requestResponse] = await Promise.all([
        api.get('/properties/mine'),
        api.get('/requests/received'),
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
        label: 'Pendientes de revision',
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

    try {
      if (editingProperty) {
        await api.patch(`/properties/${editingProperty.id}`, payload);
        setMessage('Publicacion actualizada correctamente.');
      } else {
        const response = await api.post('/properties', payload);
        setMessage(response.message || 'Publicacion guardada correctamente.');
      }

      setEditingProperty(null);
      await loadDashboard();
      return true;
    } catch (requestError) {
      setMessage(requestError.message);
      throw requestError;
    } finally {
      setSubmitting(false);
    }
  };

  // Actualiza la bandeja local tras eliminar una propiedad.
  const handleDeleteProperty = async (propertyId) => {
    try {
      await api.delete(`/properties/${propertyId}`);
      setProperties((current) => current.filter((item) => item.id !== propertyId));
      setMessage('Publicacion eliminada.');
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
      setMessage('Solicitud actualizada.');
    } catch (requestError) {
      setMessage(requestError.message);
    }
  };

  if (isAdmin) {
    // El rol admin tiene un panel dedicado para evitar mezclar responsabilidades.
    return (
      <div className="page">
        <section className="section">
          <EmptyState
            title="El administrador tiene su propio panel"
            description="Usa el panel admin para revisar propiedades, aprobar publicaciones y consultar estadisticas."
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
    <div className="page">
      <section className="section">
        <div className="section__heading">
          <div>
            <span className="section__eyebrow">Panel arrendador</span>
            <h1>Publica, edita y sigue tus viviendas</h1>
          </div>
        </div>

        <div className="stats-row stats-row--four">
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

        <div className="dashboard-layout">
          <div className="dashboard-layout__form">
            <PropertyForm
              property={editingProperty}
              submitting={submitting}
              onCancel={() => setEditingProperty(null)}
              onSubmit={handleSubmitProperty}
            />
          </div>

          <div className="dashboard-layout__content">
            <div className="content-card">
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
                  title="Aun no has publicado viviendas"
                  description="Usa el wizard para guardar un borrador o enviar tu primera publicacion a revision."
                />
              )}
            </div>

            <div className="content-card">
              <div className="section__heading section__heading--tight">
                <div>
                  <span className="section__eyebrow">Solicitudes</span>
                  <h2>Solicitudes recibidas</h2>
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
                  title="Aun no tienes solicitudes"
                  description="Cuando un arrendatario aplique a una vivienda podras revisarlo aqui."
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
