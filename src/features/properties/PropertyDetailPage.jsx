import React, { useEffect, useMemo, useState } from 'react';
import { Bath, BedDouble, BriefcaseBusiness, Heart, MapPin, Ruler, ShieldCheck } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { EmptyState } from '../../components/ui/EmptyState';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { LoadingState } from '../../components/ui/LoadingState';
import { useAuth } from '../../app/providers/AuthProvider';
import { api } from '../../lib/apiClient';
import { formatCurrency, formatDate, getPropertyTypeLabel } from '../../lib/formatters';
import { RentalRequestForm } from './RentalRequestForm';

export function PropertyDetailPage() {
  const { isAuthenticated } = useAuth();
  const { id: propertyId } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    let active = true;

    api
      .get(`/properties/${propertyId}`, { auth: isAuthenticated })
      .then((response) => {
        if (active) {
          setProperty(response.data);
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [propertyId, isAuthenticated]);

  const detailFacts = useMemo(
    () =>
      property
        ? [
            { icon: BedDouble, label: 'Habitaciones', value: property.bedrooms },
            { icon: Bath, label: 'Banos', value: property.bathrooms },
            { icon: Ruler, label: 'Area', value: `${property.areaM2} m2` },
            { icon: BriefcaseBusiness, label: 'Contrato minimo', value: `${property.minLeaseMonths} meses` },
          ]
        : [],
    [property]
  );

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      setRequestMessage('Inicia sesion para guardar esta propiedad.');
      return;
    }

    try {
      if (property.isFavorite) {
        await api.delete(`/favorites/${property.id}`);
      } else {
        await api.post(`/favorites/${property.id}`, {});
      }

      setProperty((current) => ({ ...current, isFavorite: !current.isFavorite }));
    } catch (requestError) {
      setRequestMessage(requestError.message);
    }
  };

  const handleCreateRequest = async (payload) => {
    setRequesting(true);
    setRequestMessage('');

    try {
      const response = await api.post('/requests', payload);
      setRequestMessage(response.message || 'Solicitud enviada');
    } catch (requestError) {
      setRequestMessage(requestError.message);
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return <LoadingState label="Cargando detalle..." />;
  }

  if (!property) {
    return (
      <EmptyState
        title="No encontramos esta propiedad"
        description={error || 'Puede que ya no esté publicada o que el enlace haya cambiado.'}
      />
    );
  }

  return (
    <div className="page">
      <section className="property-hero">
        <div className="property-hero__gallery">
          <img src={property.coverImage} alt={property.title} className="property-hero__cover" />
          <div className="property-hero__grid">
            {property.images.slice(1, 5).map((image) => (
              <img key={image.id} src={image.url} alt={image.alt || property.title} />
            ))}
          </div>
        </div>
      </section>

      <section className="section property-layout">
        <div className="property-layout__main">
          <div className="property-header">
            <div>
              <span className="section__eyebrow">{getPropertyTypeLabel(property.propertyType)}</span>
              <h1>{property.title}</h1>
              <p>{property.summary}</p>
              <div className="property-header__meta">
                <span>
                  <MapPin size={16} />
                  {property.city}
                  {property.neighborhood ? `, ${property.neighborhood}` : ''}
                </span>
                <span>
                  <ShieldCheck size={16} />
                  Disponible desde {formatDate(property.availableFrom)}
                </span>
              </div>
            </div>
            <button className={`favorite-chip favorite-chip--large ${property.isFavorite ? 'favorite-chip--active' : ''}`} type="button" onClick={toggleFavorite}>
              <Heart size={16} />
              Guardar
            </button>
          </div>

          <div className="fact-grid">
            {detailFacts.map((fact) => {
              const Icon = fact.icon;
              return (
                <div key={fact.label} className="fact-card">
                  <Icon size={18} />
                  <div>
                    <strong>{fact.value}</strong>
                    <span>{fact.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="content-card">
            <h2>Descripcion</h2>
            <p>{property.description}</p>
          </div>

          <div className="content-card">
            <h2>Amenidades</h2>
            <div className="tag-list">
              {property.amenities.map((amenity) => (
                <span key={amenity} className="tag">
                  {amenity}
                </span>
              ))}
            </div>
          </div>

          <div className="content-card owner-card">
            <div>
              <span className="section__eyebrow">Propietario</span>
              <h2>{property.owner.fullName}</h2>
              <p>{property.owner.bio || 'Anfitrion enfocado en respuestas claras y seguimiento oportuno.'}</p>
            </div>
            {property.owner.avatarUrl ? <img src={property.owner.avatarUrl} alt={property.owner.fullName} /> : null}
          </div>
        </div>

        <aside className="property-layout__aside">
          <div className="price-card">
            <div className="price-card__header">
              <strong>{formatCurrency(property.monthlyRent)}</strong>
              <span>canon mensual</span>
            </div>
            <div className="price-card__rows">
              <div>
                <span>Administracion</span>
                <span>{formatCurrency(property.maintenanceFee)}</span>
              </div>
              <div>
                <span>Deposito</span>
                <span>{formatCurrency(property.securityDeposit)}</span>
              </div>
            </div>
          </div>
          <InlineMessage tone={requestMessage.includes('enviada') ? 'success' : 'danger'}>{requestMessage}</InlineMessage>
          <RentalRequestForm
            propertyId={property.id}
            ownerId={property.owner.id}
            onSubmit={handleCreateRequest}
            submitting={requesting}
          />
        </aside>
      </section>
    </div>
  );
}
