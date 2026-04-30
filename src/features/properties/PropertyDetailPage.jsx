import React, { useEffect, useMemo, useState } from 'react';
import {
  Bath,
  BedDouble,
  BriefcaseBusiness,
  Heart,
  MapPin,
  Ruler,
  ShieldCheck,
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { EmptyState } from '../../components/ui/EmptyState';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { LoadingState } from '../../components/ui/LoadingState';
import { PropertyStatusBadge } from '../../components/ui/PropertyStatusBadge';
import { useAuth } from '../../app/providers/AuthProvider';
import { api } from '../../lib/apiClient';
import {
  formatCurrency,
  formatDate,
  getPropertyTypeLabel,
  getRentalTypeLabel,
} from '../../lib/formatters';
import { RentalRequestForm } from './RentalRequestForm';

/**
 * Componente de uso para el detalle completo de una propiedad.
 * Se abre desde cards o listados y combina galeria, datos tecnicos, reglas del arriendo,
 * gestion de favoritos y el formulario para crear una solicitud.
 */
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

    // Permite ver informacion adicional si existe sesion, por ejemplo favorito del usuario.
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

  // Resume atributos cuantitativos para mostrarlos como tarjetas de lectura rapida.
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

  // Gestiona el guardado desde la vista detalle para no obligar al usuario a volver al listado.
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

  // Envia la postulacion y reutiliza el mismo mensaje inline para feedback de exito/error.
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
        description={error || 'Puede que ya no este disponible o que el enlace haya cambiado.'}
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
                  {property.availableImmediately
                    ? 'Disponible de inmediato'
                    : `Disponible desde ${formatDate(property.availableFrom)}`}
                </span>
                <PropertyStatusBadge status={property.status} />
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
            <h2>Lo que debes saber</h2>
            <div className="detail-list">
              <div>
                <strong>Tipo de arriendo</strong>
                <span>{getRentalTypeLabel(property.rentalType)}</span>
              </div>
              <div>
                <strong>Direccion</strong>
                <span>{property.addressLine}</span>
              </div>
              <div>
                <strong>Referencia</strong>
                <span>{property.zoneReference || 'Sin referencia adicional'}</span>
              </div>
              <div>
                <strong>Parqueadero</strong>
                <span>{property.parkingSpots ? `${property.parkingSpots} espacio(s)` : 'No incluye'}</span>
              </div>
              <div>
                <strong>Estrato</strong>
                <span>{property.strata || 'No aplica'}</span>
              </div>
              <div>
                <strong>Servicios incluidos</strong>
                <span>{property.utilitiesIncluded ? 'Si' : 'No'}</span>
              </div>
            </div>
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

          <div className="content-card">
            <h2>Condiciones para arrendar</h2>
            <div className="detail-columns">
              <div>
                <strong>Normas</strong>
                <p>{property.rules || 'Sin normas registradas.'}</p>
              </div>
              <div>
                <strong>Requisitos</strong>
                <p>{property.requirements || 'Sin requisitos registrados.'}</p>
              </div>
              <div>
                <strong>Perfil buscado</strong>
                <p>{property.idealTenantProfile || 'Sin perfil definido.'}</p>
              </div>
              <div>
                <strong>Condiciones especiales</strong>
                <p>{property.specialConditions || 'Sin condiciones especiales.'}</p>
              </div>
            </div>
          </div>

          {property.video ? (
            <div className="content-card">
              <h2>Video de la propiedad</h2>
              <video src={property.video.url} controls className="detail-video" />
            </div>
          ) : null}

          <div className="content-card owner-card">
            <div>
              <span className="section__eyebrow">Arrendador</span>
              <h2>{property.owner.fullName}</h2>
              <p>{property.owner.bio || 'Arrendador con respuesta clara y seguimiento oportuno.'}</p>
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
              <div>
                <span>Metodo de contacto</span>
                <span>{property.contactMethod || 'Formulario Nido'}</span>
              </div>
              <div>
                <span>Verificacion</span>
                <span>{property.verificationDetails || 'Sin detalle'}</span>
              </div>
            </div>
          </div>
          <InlineMessage tone={requestMessage.includes('enviada') ? 'success' : 'danger'}>{requestMessage}</InlineMessage>
          <RentalRequestForm propertyId={property.id} ownerId={property.owner.id} onSubmit={handleCreateRequest} submitting={requesting} />
        </aside>
      </section>
    </div>
  );
}
