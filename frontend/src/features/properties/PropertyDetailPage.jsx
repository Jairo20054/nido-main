import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bath,
  BedDouble,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Heart,
  Home,
  Images,
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
  getPropertyImageUrls,
  getPropertyLocationLabel,
  getPropertyPrimaryImage,
} from '../../lib/propertyPresentation';
import { findExamplePropertyById, getSimilarExampleProperties } from './exampleProperties';
import { PropertyCard } from './PropertyCard';

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

function RatingStars({ value }) {
  const rating = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));

  return (
    <span className="rating-stars" aria-label={`${Number(value || 0).toFixed(1)} de 5`}>
      {[1, 2, 3, 4, 5].map((item) => (
        <Star
          key={item}
          size={15}
          fill={item <= rating ? 'currentColor' : 'none'}
          className={item <= rating ? 'rating-stars__icon rating-stars__icon--active' : 'rating-stars__icon'}
        />
      ))}
    </span>
  );
}

function PropertyGallery({ galleryImages, property, selectedImage, onSelectImage, onPrevious, onNext }) {
  const fallbackImage = getFallbackPropertyImage(property.propertyType);
  const images = galleryImages.length ? galleryImages : [fallbackImage];
  const selected = selectedImage || images[0];
  const selectedIndex = Math.max(0, images.indexOf(selected));
  const canNavigate = images.length > 1;

  return (
    <section className="property-hero" aria-label="Galeria de imagenes">
      <div className="property-hero__gallery property-hero__gallery--enhanced">
        <div className="property-hero__main">
          <img
            src={selected}
            alt={property.title || 'Propiedad NIDO'}
            className="property-hero__cover"
            decoding="async"
            onError={(event) => {
              event.currentTarget.src = fallbackImage;
            }}
          />
          {canNavigate ? (
            <div className="property-hero__controls" aria-label="Cambiar imagen">
              <button type="button" onClick={onPrevious} aria-label="Ver imagen anterior">
                <ChevronLeft size={20} />
              </button>
              <span>
                <Images size={15} />
                {selectedIndex + 1} / {images.length}
              </span>
              <button type="button" onClick={onNext} aria-label="Ver imagen siguiente">
                <ChevronRight size={20} />
              </button>
            </div>
          ) : null}
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
                loading="lazy"
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

function getInitials(name) {
  return String(name || 'NIDO')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function PropertyOwnerInfo({ property, onContact, onToggleFavorite }) {
  const owner = property.owner || {};
  const ownerName = safeText(owner.fullName || owner.name, 'Arrendador NIDO');
  const ownerSince = owner.createdAt ? formatDate(owner.createdAt) : '';

  return (
    <div className="content-card owner-card owner-card--safe">
      <div>
        <span className="section__eyebrow">Arrendador</span>
        <h2>{ownerName}</h2>
        <p>{safeText(owner.bio, 'Informacion publica limitada para proteger la privacidad del arrendador.')}</p>
        <div className="owner-card__facts">
          {property.verificationDetails || owner.verified ? (
            <span>
              <ShieldCheck size={15} /> Verificado por NIDO
            </span>
          ) : null}
          {owner.responseRate ? (
            <span>
              <MessageCircle size={15} /> {owner.responseRate} tasa de respuesta
            </span>
          ) : null}
          {owner.responseTime ? (
            <span>
              <CalendarDays size={15} /> {owner.responseTime}
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
        <div className="owner-card__actions">
          <button type="button" className="button" onClick={() => onContact('owner')}>
            Contactar propietario
          </button>
          <button
            type="button"
            className={`button button--secondary ${property.isFavorite ? 'button--saved' : ''}`}
            onClick={onToggleFavorite}
          >
            <Heart size={16} />
            {property.isFavorite ? 'Guardada' : 'Guardar propiedad'}
          </button>
        </div>
      </div>
      {owner.avatarUrl ? (
        <img src={owner.avatarUrl} alt={ownerName} />
      ) : (
        <span className="owner-card__avatar" aria-hidden="true">
          {ownerName ? getInitials(ownerName) : <UserRound size={34} />}
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
          <RatingStars value={rating} />
          <strong>{rating.toFixed(1)}</strong>
          <span>{comments.length || property.reviewsCount || property.commentsCount || 0} resenas verificadas</span>
        </div>
      ) : null}
      {comments.length ? (
        <div className="comments-list">
          {comments.map((comment) => (
            <article key={comment.id || `${comment.userName}-${comment.createdAt || comment.date}`} className="comment-card">
              <div className="comment-card__header">
                {comment.avatarUrl ? <img src={comment.avatarUrl} alt={comment.userName || 'Usuario'} /> : null}
                <div>
                  <strong>{safeText(comment.userName || comment.authorName, 'Usuario NIDO')}</strong>
                  <span>{formatDate(comment.createdAt || comment.date) || 'Fecha no disponible'}</span>
                </div>
                {Number.isFinite(Number(comment.rating)) ? (
                  <span className="comment-card__rating">
                    <RatingStars value={comment.rating} /> {Number(comment.rating).toFixed(1)}
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

function SimilarProperties({ properties }) {
  if (!properties.length) return null;

  return (
    <DetailSection title="Propiedades similares" description="Opciones de referencia con ciudad, tipo o presupuesto cercano.">
      <div className="similar-property-grid">
        {properties.map((item) => (
          <PropertyCard key={item.id} property={item} variant="compact" />
        ))}
      </div>
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
    setPageMessage('');

    const exampleProperty = findExamplePropertyById(propertyId);

    if (exampleProperty) {
      setProperty(exampleProperty);
      setLoading(false);
      return () => {
        active = false;
      };
    }

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

    return getPropertyImageUrls(property);
  }, [property]);

  const selectedImageIndex = useMemo(() => {
    if (!galleryImages.length) return 0;

    return Math.max(0, galleryImages.indexOf(selectedImage));
  }, [galleryImages, selectedImage]);

  const selectPreviousImage = () => {
    if (!galleryImages.length) return;

    const nextIndex = selectedImageIndex === 0 ? galleryImages.length - 1 : selectedImageIndex - 1;
    setSelectedImage(galleryImages[nextIndex]);
  };

  const selectNextImage = () => {
    if (!galleryImages.length) return;

    const nextIndex = selectedImageIndex === galleryImages.length - 1 ? 0 : selectedImageIndex + 1;
    setSelectedImage(galleryImages[nextIndex]);
  };

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

  const detailBadges = useMemo(() => {
    if (!property) return [];

    return [
      property.verificationDetails || property.owner?.verified ? 'Verificada' : '',
      property.availableImmediately ? 'Disponible' : 'Disponible pronto',
      property.petsAllowed ? 'Acepta mascotas' : '',
      property.furnished ? 'Amoblado' : '',
    ].filter(Boolean);
  }, [property]);

  const similarProperties = useMemo(() => getSimilarExampleProperties(property), [property]);

  const description = safeText(property?.description, property?.summary || '');
  const shortDescription =
    description.length > 420 && !descriptionExpanded ? `${description.slice(0, 420).trim()}...` : description;

  const handleContact = (action = 'contact') => {
    const actionCopy =
      action === 'visit'
        ? 'Listo. Dejamos preparada la solicitud de visita para continuar desde NIDO.'
        : 'Listo. Te conectaremos con el propietario dentro del flujo seguro de NIDO.';

    setPageMessage(actionCopy);
  };

  const toggleFavorite = async () => {
    if (property.isExample) {
      setProperty((current) => ({ ...current, isFavorite: !current.isFavorite }));
      setPageMessage(
        property.isFavorite
          ? 'Quitamos esta propiedad de tus guardados de ejemplo.'
          : 'Guardamos esta propiedad como referencia en esta demo.'
      );
      return;
    }

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
        actionLabel="Volver a buscar propiedades"
        onAction={() => navigate('/properties')}
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
        <div className="property-detail-topbar__copy">
          <span className="section__eyebrow">Ficha de propiedad</span>
          <h1>{safeText(property.title, `${getPropertyTypeLabel(property.propertyType)} en arriendo`)}</h1>
          <p>
            {joinLocation(property)} - {getPropertyTypeLabel(property.propertyType)} -{' '}
            {formatCurrency(property.monthlyRent)} al mes
          </p>
          <div className="property-detail-badges">
            {detailBadges.map((badge) => (
              <span key={badge}>{badge}</span>
            ))}
          </div>
        </div>
      </header>

      <PropertyGallery
        galleryImages={galleryImages}
        property={property}
        selectedImage={selectedImage}
        onSelectImage={setSelectedImage}
        onPrevious={selectPreviousImage}
        onNext={selectNextImage}
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
          <PropertyOwnerInfo
            property={property}
            onContact={handleContact}
            onToggleFavorite={toggleFavorite}
          />
          <SimilarProperties properties={similarProperties} />
        </div>

        <aside className="property-layout__aside">
          <div className="price-card price-card--booking price-card--contact">
            <div className="price-card__header">
              <strong>{formatCurrency(property.monthlyRent)}</strong>
              <span>canon mensual</span>
            </div>
            <div className="price-card__quick-facts">
              <span>
                <BedDouble size={15} /> {property.bedrooms ?? '--'} hab.
              </span>
              <span>
                <Bath size={15} /> {property.bathrooms ?? '--'} banos
              </span>
              <span>
                <Ruler size={15} /> {property.areaM2 || property.area || '--'} m2
              </span>
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
            <div className="price-card__actions">
              <button type="button" className="button" onClick={() => handleContact('contact')}>
                Contactar
              </button>
              <button type="button" className="button button--secondary" onClick={() => handleContact('visit')}>
                Agendar visita
              </button>
            </div>
            <p className="price-card__trust">
              <ShieldCheck size={15} />
              Propiedad verificada por NIDO. Tus datos se comparten solo dentro del proceso.
            </p>
          </div>

          <InlineMessage tone="neutral">
            {pageMessage}
          </InlineMessage>

          <div className="content-card apply-sidebar-card">
            <div className="apply-sidebar-card__header">
              <span className="section__eyebrow">Arrendar con NIDO</span>
              <h3>Proceso claro antes de aplicar</h3>
              <p>Contacto, visitas y documentos se mantienen dentro de un flujo guiado para proteger a ambas partes.</p>
            </div>

            <div className="application-trust-list">
              <div>
                <CheckCircle2 size={16} />
                <span>Direccion exacta y contacto privado se comparten solo cuando avance la visita.</span>
              </div>
              <div>
                <MessageCircle size={16} />
                <span>El propietario recibe tu interes con contexto de la vivienda.</span>
              </div>
              <div>
                <ShieldCheck size={16} />
                <span>NIDO evita exponer telefonos o correos privados en la publicacion.</span>
              </div>
            </div>

            <div className="application-actions">
              <button type="button" className="button" onClick={() => handleContact('visit')}>
                Solicitar visita
              </button>
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
