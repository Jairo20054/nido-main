import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bath,
  BedDouble,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Heart,
  Home,
  MapPin,
  MessageCircle,
  PawPrint,
  Ruler,
  ShieldCheck,
  Sparkles,
  SquareParking,
  Star,
  UserRound,
  Users,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../app/providers/useAuth';
import { EmptyState } from '../../components/ui/EmptyState';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { LoadingState } from '../../components/ui/LoadingState';
import { api } from '../../lib/apiClient';
import { formatCurrency, formatDate, getPropertyTypeLabel } from '../../lib/formatters';
import {
  getFallbackPropertyImage,
  getPropertyLocationLabel,
  getPropertyPrimaryImage,
} from '../../lib/propertyPresentation';

const isPresent = (value) => {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'number') return Number.isFinite(value);
  return value !== null && value !== undefined && String(value).trim() !== '';
};

const safeText = (value, fallback = '') => {
  if (!isPresent(value)) return fallback;

  const text = String(value).trim();
  return text && text !== '[object Object]' ? text : fallback;
};

const joinLocation = (property) =>
  [property.neighborhood, property.city, property.department].filter(Boolean).join(', ') || 'Colombia';

const formatBoolean = (value, yes = 'Si', no = 'No') => (value ? yes : no);

const getApproximateAddress = (property) => {
  if (property.hideExactAddress) {
    return property.zoneReference || property.neighborhood || property.city || 'Se comparte durante el proceso';
  }

  return property.addressLine || property.zoneReference || property.neighborhood || 'Se comparte durante el proceso';
};

function DetailEmpty({ children }) {
  return <p className="detail-empty">{children}</p>;
}

function DetailList({ items }) {
  const visibleItems = items.filter((item) => isPresent(item.value));

  if (!visibleItems.length) return null;

  return (
    <div className="practical-list">
      {visibleItems.map((item) => (
        <div key={item.label} className="practical-list__row">
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  );
}

function DetailSection({ title, description, children }) {
  return (
    <div className="content-card detail-section">
      <div className="detail-section__header">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {children}
    </div>
  );
}

function PropertyGallery({ galleryImages, property, selectedImage, onSelectImage }) {
  const fallbackImage = getFallbackPropertyImage(property.propertyType);
  const images = galleryImages.length ? galleryImages : [fallbackImage];

  return (
    <section className="property-hero" aria-label="Galeria de imagenes">
      <div className="property-hero__gallery property-hero__gallery--enhanced">
        <div className="property-hero__main">
          <img
            src={selectedImage || images[0]}
            alt={property.title || 'Propiedad NIDO'}
            className="property-hero__cover"
            onError={(event) => {
              event.currentTarget.src = fallbackImage;
            }}
          />
          <div className="property-hero__floating-card">
            <span className="section__eyebrow">{getPropertyTypeLabel(property.propertyType)}</span>
            <strong>{formatCurrency(property.monthlyRent)} / mes</strong>
            <p>{getPropertyLocationLabel(property)}</p>
          </div>
        </div>

        <div className="property-hero__grid property-hero__thumbs">
          {images.slice(0, 4).map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              className={`property-hero__thumb ${selectedImage === image ? 'property-hero__thumb--active' : ''}`}
              onClick={() => onSelectImage(image)}
              aria-label={`Ver imagen ${index + 1}`}
            >
              <img
                src={image}
                alt={`${property.title || 'Propiedad NIDO'} vista ${index + 1}`}
                onError={(event) => {
                  event.currentTarget.src = fallbackImage;
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function PropertyConditions({ property }) {
  const conditions = [
    { label: 'Contrato minimo', value: property.minLeaseMonths ? `${property.minLeaseMonths} meses` : '' },
    { label: 'Deposito', value: property.depositRequired ? formatCurrency(property.securityDeposit) : '' },
    {
      label: 'Administracion',
      value: property.administrationIncluded
        ? 'Incluida en el canon'
        : property.maintenanceFee
          ? formatCurrency(property.maintenanceFee)
          : '',
    },
    {
      label: 'Servicios incluidos',
      value: property.servicesIncluded?.length ? property.servicesIncluded.join(', ') : '',
    },
    { label: 'Acepta mascotas', value: isPresent(property.petsAllowed) ? formatBoolean(property.petsAllowed) : '' },
    { label: 'Acepta estudiantes', value: isPresent(property.acceptsStudents) ? formatBoolean(property.acceptsStudents) : '' },
    { label: 'Acepta familias', value: isPresent(property.acceptsFamilies) ? formatBoolean(property.acceptsFamilies) : '' },
    { label: 'Codeudor', value: property.acceptsCosigner ? 'Acepta codeudor' : '' },
    { label: 'Estudio de arriendo', value: property.requiresRentalStudy ? 'Requerido' : '' },
    {
      label: 'Disponibilidad',
      value: property.availableImmediately ? 'Inmediata' : formatDate(property.availableFrom),
    },
    { label: 'Documentos requeridos', value: property.requirements },
    { label: 'Reglas de convivencia', value: property.rules },
    { label: 'Condiciones especiales', value: property.specialConditions },
  ];

  const hasConditions = conditions.some((item) => isPresent(item.value));

  return (
    <DetailSection title="Condiciones de arriendo" description="Datos de contrato y convivencia registrados por el arrendador.">
      {hasConditions ? (
        <DetailList items={conditions} />
      ) : (
        <DetailEmpty>Esta propiedad aun no tiene condiciones detalladas registradas.</DetailEmpty>
      )}
    </DetailSection>
  );
}

function PropertyAmenities({ property }) {
  const amenities = [
    ...(property.amenities || []),
    property.furnished ? 'Amoblado' : '',
    property.equippedKitchen ? 'Cocina equipada' : '',
    property.laundryArea ? 'Zona de ropas' : '',
    property.elevator ? 'Ascensor' : '',
    property.doorman ? 'Porteria' : '',
    property.security ? 'Vigilancia' : '',
    property.commonAreas ? 'Zonas comunes' : '',
    property.balcony ? 'Balcon' : '',
    property.utilitiesIncluded ? 'Servicios incluidos' : '',
  ].filter(Boolean);
  const uniqueAmenities = [...new Set(amenities)];

  return (
    <DetailSection title="Comodidades" description="Caracteristicas marcadas para comparar mejor esta vivienda.">
      {uniqueAmenities.length ? (
        <div className="tag-list">
          {uniqueAmenities.map((amenity) => (
            <span key={amenity} className="tag">
              {amenity}
            </span>
          ))}
        </div>
      ) : (
        <DetailEmpty>Esta propiedad aun no tiene amenidades registradas.</DetailEmpty>
      )}
    </DetailSection>
  );
}

function PropertyOwnerInfo({ property }) {
  const owner = property.owner || {};
  const ownerName = safeText(owner.fullName, 'Arrendador NIDO');
  const ownerSince = owner.createdAt ? formatDate(owner.createdAt) : '';

  return (
    <div className="content-card owner-card owner-card--safe">
      <div>
        <span className="section__eyebrow">Arrendador</span>
        <h2>{ownerName}</h2>
        <p>{safeText(owner.bio, 'Informacion publica limitada para proteger la privacidad del arrendador.')}</p>
        <div className="owner-card__facts">
          {property.verificationDetails ? (
            <span>
              <ShieldCheck size={15} /> Verificado por NIDO
            </span>
          ) : null}
          {ownerSince ? (
            <span>
              <CalendarDays size={15} /> En la plataforma desde {ownerSince}
            </span>
          ) : null}
          {property.requestCount ? (
            <span>
              <Users size={15} /> {property.requestCount} solicitudes o intereses
            </span>
          ) : null}
        </div>
      </div>
      {owner.avatarUrl ? (
        <img src={owner.avatarUrl} alt={ownerName} />
      ) : (
        <span className="owner-card__avatar" aria-hidden="true">
          <UserRound size={34} />
        </span>
      )}
    </div>
  );
}

function PropertyReferences({ property }) {
  const references = [
    property.zoneReference ? `Referencia cercana: ${property.zoneReference}` : '',
    property.verificationDetails ? `Validacion: ${property.verificationDetails}` : '',
    property.idealTenantProfile ? `Perfil recomendado: ${property.idealTenantProfile}` : '',
    property.visitsAllowed ? 'Permite coordinar visitas' : '',
    property.contactHours ? `Horario de contacto: ${property.contactHours}` : '',
  ].filter(Boolean);

  return (
    <DetailSection title="Referencias" description="Senales utiles de zona, confianza y proceso.">
      {references.length ? (
        <div className="insight-list">
          {references.map((reference) => (
            <div key={reference} className="insight-list__item">
              <ShieldCheck size={16} />
              <span>{reference}</span>
            </div>
          ))}
        </div>
      ) : (
        <DetailEmpty>Esta propiedad aun no tiene referencias registradas.</DetailEmpty>
      )}
    </DetailSection>
  );
}

function PropertyComments({ property }) {
  const comments = property.comments || property.reviews || [];
  const rating = Number(property.rating || property.averageRating);
  const hasRating = Number.isFinite(rating);

  return (
    <DetailSection title="Comentarios y valoraciones" description="Experiencias visibles cuando el backend las expone para esta propiedad.">
      {hasRating ? (
        <div className="rating-summary">
          <Star size={17} />
          <strong>{rating.toFixed(1)}</strong>
          <span>calificacion promedio</span>
        </div>
      ) : null}
      {comments.length ? (
        <div className="comments-list">
          {comments.map((comment) => (
            <article key={comment.id || `${comment.userName}-${comment.createdAt}`} className="comment-card">
              <div className="comment-card__header">
                {comment.avatarUrl ? <img src={comment.avatarUrl} alt={comment.userName || 'Usuario'} /> : null}
                <div>
                  <strong>{safeText(comment.userName || comment.authorName, 'Usuario NIDO')}</strong>
                  <span>{formatDate(comment.createdAt) || 'Fecha no disponible'}</span>
                </div>
                {Number.isFinite(Number(comment.rating)) ? (
                  <span className="comment-card__rating">
                    <Star size={14} /> {Number(comment.rating).toFixed(1)}
                  </span>
                ) : null}
              </div>
              <p>{safeText(comment.comment || comment.body || comment.text, 'Comentario sin texto registrado.')}</p>
            </article>
          ))}
        </div>
      ) : (
        <DetailEmpty>Esta propiedad aun no tiene comentarios.</DetailEmpty>
      )}
    </DetailSection>
  );
}

export function PropertyDetailPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { id: propertyId } = useParams();
  const [property, setProperty] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageMessage, setPageMessage] = useState('');

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError('');

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
          setProperty(null);
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

  useEffect(() => {
    if (!property) return;

    setSelectedImage(getPropertyPrimaryImage(property));
  }, [property]);

  const galleryImages = useMemo(() => {
    if (!property) return [];

    const allImages = property.images?.length
      ? property.images.map((image) => image.url).filter(Boolean)
      : getPropertyPrimaryImage(property)
        ? [getPropertyPrimaryImage(property)]
        : [];

    return [...new Set(allImages)];
  }, [property]);

  const detailFacts = useMemo(
    () =>
      property
        ? [
            { icon: BedDouble, label: 'Habitaciones', value: property.bedrooms ?? '--' },
            { icon: Bath, label: 'Banos', value: property.bathrooms ?? '--' },
            { icon: Ruler, label: 'Area', value: property.areaM2 ? `${property.areaM2} m2` : '--' },
            {
              icon: SquareParking,
              label: 'Parqueadero',
              value: property.parkingSpots ? `${property.parkingSpots}` : 'No registrado',
            },
            {
              icon: BriefcaseBusiness,
              label: 'Contrato minimo',
              value: property.minLeaseMonths ? `${property.minLeaseMonths} meses` : 'Por confirmar',
            },
            {
              icon: CalendarDays,
              label: 'Disponible',
              value: property.availableImmediately ? 'Inmediata' : formatDate(property.availableFrom) || 'Por confirmar',
            },
          ]
        : [],
    [property]
  );

  const practicalDetails = useMemo(
    () =>
      property
        ? [
            { label: 'Canon mensual', value: formatCurrency(property.monthlyRent) },
            { label: 'Administracion', value: property.maintenanceFee ? formatCurrency(property.maintenanceFee) : 'No registrada' },
            { label: 'Deposito', value: property.securityDeposit ? formatCurrency(property.securityDeposit) : 'No registrado' },
            {
              label: 'Costo mensual estimado',
              value:
                property.monthlyRent || property.maintenanceFee
                  ? formatCurrency((property.monthlyRent || 0) + (property.maintenanceFee || 0))
                  : 'Precio no disponible',
            },
            { label: 'Tipo de propiedad', value: getPropertyTypeLabel(property.propertyType) },
            { label: 'Departamento', value: property.department },
            { label: 'Ciudad', value: property.city },
            { label: 'Barrio', value: property.neighborhood },
            { label: 'Zona o direccion aproximada', value: getApproximateAddress(property) },
            { label: 'Piso', value: isPresent(property.floor) ? property.floor : '' },
            { label: 'Estrato', value: isPresent(property.strata) ? property.strata : '' },
            { label: 'Amoblado', value: formatBoolean(property.furnished) },
            { label: 'Mascotas', value: formatBoolean(property.petsAllowed) },
            { label: 'Capacidad maxima', value: property.maxOccupants ? `${property.maxOccupants} personas` : '' },
            { label: 'Estado', value: property.availableImmediately ? 'Disponible ahora' : 'Disponibilidad programada' },
          ]
        : [],
    [property]
  );

  const stayHighlights = useMemo(() => {
    if (!property) return [];

    return [
      property.furnished
        ? { icon: Home, title: 'Amoblado', description: 'Listo para mudarte con menos friccion.' }
        : { icon: Sparkles, title: 'Sin amoblar', description: 'Mas libertad para personalizar.' },
      property.petsAllowed
        ? { icon: PawPrint, title: 'Mascotas bienvenidas', description: 'La propiedad acepta mascotas.' }
        : { icon: ShieldCheck, title: 'Mascotas por confirmar', description: 'Valida esta condicion antes de aplicar.' },
      property.parkingSpots
        ? {
            icon: SquareParking,
            title: `${property.parkingSpots} parqueadero${property.parkingSpots > 1 ? 's' : ''}`,
            description: 'Dato util para comparar movilidad diaria.',
          }
        : {
            icon: MapPin,
            title: 'Sin parqueadero registrado',
            description: 'Revisa transporte y opciones cercanas.',
          },
    ];
  }, [property]);

  const description = safeText(property?.description, property?.summary || '');
  const shortDescription =
    description.length > 420 && !descriptionExpanded ? `${description.slice(0, 420).trim()}...` : description;

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      setPageMessage('Puedes explorar libremente. Inicia sesion para guardar o continuar una postulacion.');
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
      setPageMessage(requestError.message);
    }
  };

  if (loading) {
    return <LoadingState label="Cargando detalle..." />;
  }

  if (!property) {
    return (
      <EmptyState
        title="No encontramos esta propiedad"
        description={error || 'Puede que ya no este publicada o que el enlace haya cambiado.'}
      />
    );
  }

  return (
    <div className="page property-detail-page">
      <header className="property-detail-topbar">
        <button type="button" className="button button--secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          Volver
        </button>
        <div>
          <span className="section__eyebrow">Ficha de propiedad</span>
          <h1>{safeText(property.title, `${getPropertyTypeLabel(property.propertyType)} en arriendo`)}</h1>
          <p>{joinLocation(property)}</p>
        </div>
      </header>

      <PropertyGallery
        galleryImages={galleryImages}
        property={property}
        selectedImage={selectedImage}
        onSelectImage={setSelectedImage}
      />

      <section className="section property-layout">
        <div className="property-layout__main">
          <div className="property-header">
            <div>
              <span className="section__eyebrow">Informacion principal</span>
              <h2>{safeText(property.title, 'Propiedad en arriendo')}</h2>
              <p>{safeText(property.summary, 'Informacion resumida pendiente por registrar.')}</p>
              <div className="property-header__meta">
                <span>
                  <MapPin size={16} />
                  {joinLocation(property)}
                </span>
                <span>
                  <ShieldCheck size={16} />
                  {property.verificationDetails ? 'Verificada' : 'Publicacion activa'}
                </span>
              </div>
            </div>
            <button
              className={`favorite-chip favorite-chip--large ${property.isFavorite ? 'favorite-chip--active' : ''}`}
              type="button"
              onClick={toggleFavorite}
              aria-label={property.isFavorite ? 'Quitar de guardados' : 'Guardar propiedad'}
            >
              <Heart size={16} />
              Guardar
            </button>
          </div>

          <div className="fact-grid fact-grid--expanded">
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

          <DetailSection title="Lo que mas destaca" description="Resumen rapido para comparar esta opcion.">
            <div className="highlight-grid">
              {stayHighlights.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="highlight-card">
                    <div className="highlight-card__icon">
                      <Icon size={18} />
                    </div>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.description}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </DetailSection>

          <DetailSection title="Descripcion" description="Informacion registrada por el arrendador.">
            {description ? (
              <>
                <p>{shortDescription}</p>
                {description.length > 420 ? (
                  <button
                    type="button"
                    className="detail-text-toggle"
                    onClick={() => setDescriptionExpanded((current) => !current)}
                  >
                    {descriptionExpanded ? 'Ver menos' : 'Ver mas'}
                  </button>
                ) : null}
              </>
            ) : (
              <DetailEmpty>Esta propiedad aun no tiene descripcion completa.</DetailEmpty>
            )}
          </DetailSection>

          <DetailSection title="Detalles practicos" description="Valores, ubicacion aproximada y caracteristicas visibles.">
            <DetailList items={practicalDetails} />
          </DetailSection>

          <PropertyConditions property={property} />
          <PropertyAmenities property={property} />
          <PropertyReferences property={property} />
          <PropertyComments property={property} />
          <PropertyOwnerInfo property={property} />
        </div>

        <aside className="property-layout__aside">
          <div className="price-card price-card--booking">
            <div className="price-card__header">
              <strong>{formatCurrency(property.monthlyRent)}</strong>
              <span>canon mensual</span>
            </div>
            <div className="price-card__rows">
              <div>
                <span>Administracion</span>
                <span>{property.maintenanceFee ? formatCurrency(property.maintenanceFee) : 'No registrada'}</span>
              </div>
              <div>
                <span>Deposito</span>
                <span>{property.securityDeposit ? formatCurrency(property.securityDeposit) : 'No registrado'}</span>
              </div>
              <div>
                <span>Total mensual estimado</span>
                <span>{formatCurrency((property.monthlyRent || 0) + (property.maintenanceFee || 0))}</span>
              </div>
            </div>
          </div>

          <InlineMessage tone={pageMessage.includes('explorar') ? 'neutral' : 'danger'}>
            {pageMessage}
          </InlineMessage>

          <div className="content-card apply-sidebar-card">
            <div className="apply-sidebar-card__header">
              <span className="section__eyebrow">Arrendar con NIDO</span>
              <h3>Solicita una visita o inicia tu aplicacion</h3>
              <p>El flujo actual usa aplicacion guiada para proteger tus datos y los del arrendador.</p>
            </div>

            <div className="application-trust-list">
              <div>
                <CheckCircle2 size={16} />
                <span>Direccion exacta y contacto privado se manejan dentro del proceso.</span>
              </div>
              <div>
                <MessageCircle size={16} />
                <span>Comentarios y referencias se muestran solo si existen en backend.</span>
              </div>
              <div>
                <ShieldCheck size={16} />
                <span>No mostramos cedula, correo privado ni telefono privado del propietario.</span>
              </div>
            </div>

            <div className="application-actions">
              <Link className="button" to={`/properties/${property.id}/apply/start`}>
                Solicitar visita
              </Link>
              <Link className="button button--secondary" to="/properties">
                Comparar opciones
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
