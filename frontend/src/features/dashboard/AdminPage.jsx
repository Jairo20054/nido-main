import React, { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../../components/ui/EmptyState';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { LoadingState } from '../../components/ui/LoadingState';
import { PropertyStatusBadge } from '../../components/ui/PropertyStatusBadge';
import { api } from '../../lib/apiClient';
import { formatCurrency, formatDate, getRoleLabel } from '../../lib/formatters';
import { PROPERTY_STATUS_OPTIONS } from '../../lib/constants';
import { PropertyForm } from '../properties/PropertyForm';

/**
 * Componente de uso para el panel administrativo.
 * Solo debe renderizarse detras de `ProtectedRoute` con rol `ADMIN` porque combina
 * moderacion de propiedades, metricas operativas y mantenimiento editorial.
 */
export function AdminPage() {
  const [properties, setProperties] = useState([]);
  const [landlords, setLandlords] = useState([]);
  const [stats, setStats] = useState(null);
  const [editingProperty, setEditingProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Agrupa las lecturas necesarias para el panel en una sola operacion de carga.
  const loadAdminData = async () => {
    setLoading(true);

    try {
      const [propertiesResponse, landlordsResponse, statsResponse] = await Promise.all([
        api.get('/admin/properties'),
        api.get('/admin/landlords'),
        api.get('/admin/stats'),
      ]);

      setProperties(propertiesResponse.data);
      setLandlords(landlordsResponse.data);
      setStats(statsResponse.data);
      setMessage('');
    } catch (requestError) {
      setMessage(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const statusStats = useMemo(() => stats?.propertiesByStatus || [], [stats]);

  // Actualiza el estado editorial de una propiedad sin recargar toda la vista.
  const handleStatusChange = async (propertyId, status) => {
    try {
      const response = await api.patch(`/admin/properties/${propertyId}/status`, { status });
      setProperties((current) =>
        current.map((item) => (item.id === propertyId ? response.data : item))
      );
      setMessage('Estado actualizado correctamente.');
    } catch (requestError) {
      setMessage(requestError.message);
    }
  };

  // Elimina una publicacion desde administracion y sincroniza la lista local.
  const handleDelete = async (propertyId) => {
    try {
      await api.delete(`/admin/properties/${propertyId}`);
      setProperties((current) => current.filter((item) => item.id !== propertyId));
      setMessage('Publicacion eliminada.');
    } catch (requestError) {
      setMessage(requestError.message);
    }
  };

  // Reutiliza el formulario del arrendador para editar con permisos de administrador.
  const handleEdit = async (payload) => {
    if (!editingProperty) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.patch(`/admin/properties/${editingProperty.id}`, payload);
      setProperties((current) =>
        current.map((item) => (item.id === editingProperty.id ? response.data : item))
      );
      setEditingProperty(null);
      setMessage('Publicacion actualizada por administracion.');
    } catch (requestError) {
      setMessage(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <section className="section">
        <div className="section__heading">
          <div>
            <span className="section__eyebrow">Administracion</span>
            <h1>Panel de control de Nido</h1>
          </div>
        </div>

        <InlineMessage tone={message && !message.toLowerCase().includes('error') ? 'success' : 'danger'}>
          {message}
        </InlineMessage>

        {loading ? <LoadingState label="Cargando panel admin..." /> : null}

        {!loading && stats ? (
          <div className="stats-row stats-row--four">
            <div className="stats-card">
              <strong>{stats.totals.properties}</strong>
              <span>Propiedades</span>
            </div>
            <div className="stats-card">
              <strong>{stats.totals.requests}</strong>
              <span>Solicitudes</span>
            </div>
            <div className="stats-card">
              <strong>{stats.totals.favorites}</strong>
              <span>Guardados</span>
            </div>
            <div className="stats-card">
              <strong>{landlords.length}</strong>
              <span>Arrendadores</span>
            </div>
          </div>
        ) : null}

        <div className="admin-layout">
          <div className="admin-layout__main">
            <div className="content-card">
              <div className="section__heading section__heading--tight">
                <div>
                  <span className="section__eyebrow">Moderacion</span>
                  <h2>Propiedades registradas</h2>
                </div>
              </div>

              {!loading && properties.length ? (
                <div className="management-list">
                  {properties.map((property) => (
                    <div key={property.id} className="management-item management-item--stack">
                      <div className="management-item__main">
                        <img src={property.coverImage} alt={property.title} className="management-item__thumb" />
                        <div>
                          <strong>{property.title}</strong>
                          <p>
                            {property.city}
                            {property.neighborhood ? `, ${property.neighborhood}` : ''} · {formatCurrency(property.monthlyRent)}
                          </p>
                          <small>
                            Arrendador: {property.owner.fullName} · Actualizada {formatDate(property.updatedAt)}
                          </small>
                        </div>
                      </div>
                      <div className="admin-row">
                        <PropertyStatusBadge status={property.status} />
                        <select value={property.status} onChange={(event) => handleStatusChange(property.id, event.target.value)}>
                          {PROPERTY_STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <button className="button button--secondary" type="button" onClick={() => setEditingProperty(property)}>
                          Editar
                        </button>
                        <button className="button button--ghost-danger" type="button" onClick={() => handleDelete(property.id)}>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {!loading && !properties.length ? (
                <EmptyState title="No hay propiedades registradas" description="Cuando existan publicaciones apareceran en esta tabla administrativa." />
              ) : null}
            </div>

            {editingProperty ? (
              <PropertyForm
                property={editingProperty}
                submitting={submitting}
                onCancel={() => setEditingProperty(null)}
                onSubmit={handleEdit}
                canPublishDirectly
              />
            ) : null}
          </div>

          <aside className="admin-layout__aside">
            <div className="content-card">
              <div className="section__heading section__heading--tight">
                <div>
                  <span className="section__eyebrow">Arrendadores</span>
                  <h2>Usuarios registrados</h2>
                </div>
              </div>
              {!loading && landlords.length ? (
                <div className="landlord-list">
                  {landlords.map((landlord) => (
                    <div key={landlord.id} className="landlord-item">
                      <strong>{landlord.fullName}</strong>
                      <span>{landlord.email}</span>
                      <small>
                        {getRoleLabel(landlord.role)} · {landlord.propertyCount} propiedades
                      </small>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="content-card">
              <div className="section__heading section__heading--tight">
                <div>
                  <span className="section__eyebrow">Estados</span>
                  <h2>Resumen por publicacion</h2>
                </div>
              </div>
              <div className="status-summary-list">
                {statusStats.map((item) => (
                  <div key={item.status} className="status-summary-item">
                    <PropertyStatusBadge status={item.status} />
                    <strong>{item.total}</strong>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
