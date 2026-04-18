import React, { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../../components/ui/EmptyState';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { LoadingState } from '../../components/ui/LoadingState';
import { RequestStatusBadge } from '../../components/ui/RequestStatusBadge';
import { useAuth } from '../../app/providers/AuthProvider';
import { api } from '../../lib/apiClient';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { PropertyForm } from '../properties/PropertyForm';

export function ManagementPage() {
  const { refreshUser, user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [requests, setRequests] = useState([]);
  const [editingProperty, setEditingProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

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
      { label: 'Propiedades activas', value: properties.length },
      { label: 'Solicitudes recibidas', value: requests.length },
      { label: 'Perfil actual', value: user?.role || 'TENANT' },
    ],
    [properties.length, requests.length, user?.role]
  );

  const handleSubmitProperty = async (payload) => {
    setSubmitting(true);
    setMessage('');

    try {
      if (editingProperty) {
        await api.patch(`/properties/${editingProperty.id}`, payload);
        setMessage('Propiedad actualizada.');
      } else {
        await api.post('/properties', payload);
        setMessage('Propiedad publicada.');
      }

      setEditingProperty(null);
      await refreshUser();
      await loadDashboard();
    } catch (requestError) {
      setMessage(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    try {
      await api.delete(`/properties/${propertyId}`);
      setProperties((current) => current.filter((item) => item.id !== propertyId));
      setMessage('Propiedad eliminada.');
    } catch (requestError) {
      setMessage(requestError.message);
    }
  };

  const handleReviewRequest = async (requestId, status) => {
    try {
      const response = await api.patch(`/requests/${requestId}/status`, { status });
      setRequests((current) =>
        current.map((item) => (item.id === requestId ? response.data : item))
      );
    } catch (requestError) {
      setMessage(requestError.message);
    }
  };

  return (
    <div className="page">
      <section className="section">
        <div className="section__heading">
          <div>
            <span className="section__eyebrow">Gestion</span>
            <h1>Panel de propiedades y solicitudes</h1>
          </div>
        </div>

        <div className="stats-row">
          {dashboardStats.map((item) => (
            <div className="stats-card" key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        <InlineMessage tone={message.includes('actualizada') || message.includes('publicada') || message.includes('eliminada') ? 'success' : 'danger'}>
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
                    <div className="management-item" key={property.id}>
                      <div>
                        <strong>{property.title}</strong>
                        <p>
                          {property.city}
                          {property.neighborhood ? `, ${property.neighborhood}` : ''} •{' '}
                          {formatCurrency(property.monthlyRent)}
                        </p>
                        <small>
                          Disponible {formatDate(property.availableFrom)} • Estado {property.status}
                        </small>
                      </div>
                      <div className="management-item__actions">
                        <button className="button button--secondary" type="button" onClick={() => setEditingProperty(property)}>
                          Editar
                        </button>
                        <button className="button button--ghost-danger" type="button" onClick={() => handleDeleteProperty(property.id)}>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Aun no has publicado propiedades"
                  description="Publica tu primera propiedad para empezar a recibir solicitudes formales."
                />
              )}
            </div>

            <div className="content-card">
              <div className="section__heading section__heading--tight">
                <div>
                  <span className="section__eyebrow">Entrada</span>
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
                          {request.tenant.fullName} • ingreso {formatDate(request.desiredMoveIn)} •{' '}
                          {request.leaseMonths} meses
                        </p>
                        <small>{request.message}</small>
                      </div>
                      <div className="request-item__actions">
                        <RequestStatusBadge status={request.status} />
                        {request.status === 'PENDING' ? (
                          <div className="request-item__buttons">
                            <button className="button" type="button" onClick={() => handleReviewRequest(request.id, 'APPROVED')}>
                              Aprobar
                            </button>
                            <button className="button button--secondary" type="button" onClick={() => handleReviewRequest(request.id, 'REJECTED')}>
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
                  description="Cuando un arrendatario se postule, veras aqui el detalle y podras responder sin salir del panel."
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
