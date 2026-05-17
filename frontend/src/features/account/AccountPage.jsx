import React, { useEffect, useState } from 'react';
import { EmptyState } from '../../components/ui/EmptyState';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { LoadingState } from '../../components/ui/LoadingState';
import { RequestStatusBadge } from '../../components/ui/RequestStatusBadge';
import { useAuth } from '../../app/providers/useAuth';
import { api } from '../../lib/apiClient';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { isRecoverableDashboardError, mockTenantRequests } from '../dashboard/dashboardData';

/**
 * Componente de uso para la página "Mi cuenta".
 * Reúne en una sola vista la edición del perfil autenticado y el historial
 * de solicitudes que el usuario ha enviado a propiedades publicadas.
 */
export function AccountPage() {
  const { user, updateProfile } = useAuth();
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    avatarUrl: '',
  });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // El formulario se inicializa desde el usuario autenticado para evitar
    // duplicar llamadas al backend cuando ya tenemos el perfil en memoria.
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || '',
      });
    }
  }, [user]);

  useEffect(() => {
    // Carga las solicitudes propias una sola vez al entrar a la cuenta.
    api
      .get('/requests/mine')
      .then((response) => setRequests(response.data))
      .catch((requestError) => {
        if (isRecoverableDashboardError(requestError)) {
          setRequests(mockTenantRequests);
          setMessage('Mostrando postulaciones de ejemplo mientras se conecta el backend.');
          return;
        }
        setMessage(requestError.message);
      })
      .finally(() => setLoading(false));
  }, []);

  // Persiste los cambios del perfil usando el helper centralizado del contexto.
  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await updateProfile(profileForm);
      setMessage('Perfil actualizado.');
    } catch (requestError) {
      setMessage(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <section className="section account-layout">
        <form className="form-card" onSubmit={handleSave}>
          <div className="form-card__header">
            <h2>Mi perfil</h2>
            <p>Mantén tus datos listos para postularte más rápido a un arriendo.</p>
          </div>
          <InlineMessage tone={message.includes('actualizado') ? 'success' : 'danger'}>{message}</InlineMessage>
          <div className="field-grid">
            <div className="field-group">
              <label htmlFor="firstName">Nombre</label>
              <input
                id="firstName"
                value={profileForm.firstName}
                onChange={(event) => setProfileForm((current) => ({ ...current, firstName: event.target.value }))}
              />
            </div>
            <div className="field-group">
              <label htmlFor="lastName">Apellido</label>
              <input
                id="lastName"
                value={profileForm.lastName}
                onChange={(event) => setProfileForm((current) => ({ ...current, lastName: event.target.value }))}
              />
            </div>
          </div>
          <div className="field-group">
            <label htmlFor="accountPhone">Teléfono</label>
            <input
              id="accountPhone"
              value={profileForm.phone}
              onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))}
            />
          </div>
          <div className="field-group">
            <label htmlFor="accountBio">Bio</label>
            <textarea
              id="accountBio"
              rows="4"
              value={profileForm.bio}
              onChange={(event) => setProfileForm((current) => ({ ...current, bio: event.target.value }))}
            />
          </div>
          <div className="field-group">
            <label htmlFor="avatarUrl">URL de avatar</label>
            <input
              id="avatarUrl"
              value={profileForm.avatarUrl}
              onChange={(event) => setProfileForm((current) => ({ ...current, avatarUrl: event.target.value }))}
            />
          </div>
          <button className="button" type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar perfil'}
          </button>
        </form>

        <div className="content-card">
          <div className="section__heading section__heading--tight">
            <div>
              <span className="section__eyebrow">Postulaciones</span>
              <h2>Mis postulaciones</h2>
            </div>
          </div>
          {loading ? (
            <LoadingState label="Cargando solicitudes..." />
          ) : requests.length ? (
            <div className="request-list">
              {requests.map((request) => (
                <div className="request-item" key={request.id}>
                  <div>
                    <strong>{request.property.title}</strong>
                    <p>
                      {request.property.city}
                      {request.property.neighborhood ? `, ${request.property.neighborhood}` : ''} •{' '}
                      {formatCurrency(request.property.monthlyRent)}
                    </p>
                    <small>
                      Ingreso deseado {formatDate(request.desiredMoveIn)} • {request.leaseMonths} meses
                    </small>
                  </div>
                  <RequestStatusBadge status={request.status} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Aún no has enviado postulaciones"
              description="Cuando te postules a una propiedad verás aquí el estado de cada conversación."
            />
          )}
        </div>
      </section>
    </div>
  );
}
