import React, { useEffect, useMemo, useState } from 'react';
import { Bell, FileText, KeyRound, Mail, Phone, ShieldCheck, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/ui/EmptyState';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { LoadingState } from '../../components/ui/LoadingState';
import { RequestStatusBadge } from '../../components/ui/RequestStatusBadge';
import { useAuth } from '../../app/providers/useAuth';
import { api } from '../../lib/apiClient';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { isRecoverableDashboardError, mockTenantRequests } from '../dashboard/dashboardData';

const getInitials = (user) => {
  const first = user?.firstName?.[0] || user?.email?.[0] || 'N';
  const last = user?.lastName?.[0] || '';
  return `${first}${last}`.toUpperCase();
};

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
  const accountName = useMemo(
    () => [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'Cuenta Nido',
    [user]
  );
  const messageTone = message.includes('actualizado')
    ? 'success'
    : message.includes('ejemplo')
      ? 'neutral'
      : 'danger';

  useEffect(() => {
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
    <div className="page account-page">
      <section className="section account-layout">
        <form className="form-card account-profile-card" onSubmit={handleSave}>
          <div className="form-card__header">
            <span className="section__eyebrow">Mi cuenta</span>
            <h2>Perfil personal</h2>
            <p>Manten tus datos listos para postularte mas rapido y recibir respuestas claras.</p>
          </div>

          <div className="account-profile-summary">
            <span className="account-profile-summary__avatar">
              {profileForm.avatarUrl ? <img src={profileForm.avatarUrl} alt="" /> : getInitials(user)}
            </span>
            <div>
              <strong>{accountName}</strong>
              <span>
                <Mail size={15} aria-hidden="true" />
                {user?.email || 'Correo no registrado'}
              </span>
            </div>
            <span className="account-profile-summary__status">
              <ShieldCheck size={15} aria-hidden="true" />
              Perfil activo
            </span>
          </div>

          <InlineMessage tone={messageTone}>{message}</InlineMessage>
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
            <label htmlFor="accountPhone">Telefono</label>
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

        <aside className="account-side-panel">
          <section className="content-card account-security-card">
            <div className="section__heading section__heading--tight">
              <div>
                <span className="section__eyebrow">Seguridad</span>
                <h2>Estado de cuenta</h2>
              </div>
            </div>
            <div className="account-status-list">
              <article>
                <UserRound size={18} aria-hidden="true" />
                <div>
                  <strong>Datos personales</strong>
                  <span>
                    {profileForm.firstName || profileForm.lastName
                      ? 'Informacion basica cargada'
                      : 'Completa tu nombre y apellido'}
                  </span>
                </div>
              </article>
              <article>
                <Phone size={18} aria-hidden="true" />
                <div>
                  <strong>Telefono</strong>
                  <span>{profileForm.phone ? profileForm.phone : 'Pendiente por agregar'}</span>
                </div>
              </article>
              <article>
                <KeyRound size={18} aria-hidden="true" />
                <div>
                  <strong>Acceso</strong>
                  <span>Gestionado por autenticacion segura</span>
                </div>
              </article>
            </div>
            <div className="account-quick-actions">
              <Link to="/settings">
                <Bell size={16} aria-hidden="true" />
                Preferencias
              </Link>
              <Link to="/documents">
                <FileText size={16} aria-hidden="true" />
                Documentos
              </Link>
            </div>
          </section>

          <section className="content-card account-requests-card">
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
                        {request.property.neighborhood ? `, ${request.property.neighborhood}` : ''} -{' '}
                        {formatCurrency(request.property.monthlyRent)}
                      </p>
                      <small>
                        Ingreso deseado {formatDate(request.desiredMoveIn)} - {request.leaseMonths} meses
                      </small>
                    </div>
                    <RequestStatusBadge status={request.status} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Aun no has enviado postulaciones"
                description="Cuando te postules a una propiedad veras aqui el estado de cada conversacion."
              />
            )}
          </section>
        </aside>
      </section>
    </div>
  );
}
