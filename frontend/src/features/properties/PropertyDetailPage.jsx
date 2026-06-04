import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bath,
  BedDouble,
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
  Share2,
  ShieldCheck,
  Sparkles,
  SquareParking,
  Star,
  UserRound,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../app/providers/useAuth';
import DetailAmenities from '../../components/property/PropertyAmenities';
import PropertyDescription from '../../components/property/PropertyDescription';
import PropertyHighlights from '../../components/property/PropertyHighlights';
import PropertyLocation from '../../components/property/PropertyLocation';
import PropertyPracticalDetails from '../../components/property/PropertyPracticalDetails';
import PropertyRentalConditions from '../../components/property/PropertyRentalConditions';
import PropertySidebar from '../../components/property/PropertySidebar';
import PropertyStatsStrip from '../../components/property/PropertyStatsStrip';
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

const splitListText = (value) =>
  safeText(value)
    .split(/[,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);

const getApproximateAddress = (property) => {
  if (property.hideExactAddress) {
    return property.zoneReference || property.neighborhood || property.city || 'Se comparte durante el proceso';
  }

  return property.addressLine || property.zoneReference || property.neighborhood || 'Se comparte durante el proceso';
};

function DetailEmpty({ children }) {
  return <p className="detail-empty">{children}</p>;
}

function DetailDataGroup({ title, items }) {
  const visibleItems = items.filter((item) => isPresent(item.value));

  if (!visibleItems.length) return null;

  return (
    <article className="detail-data-group">
      <h3>{title}</h3>
      <div className="detail-data-group__rows">
        {visibleItems.map((item) => (
          <div key={item.label} className="detail-data-group__row">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </article>
  );
}

function DetailGroupGrid({ groups }) {
  const visibleGroups = groups.filter((group) => group.items.some((item) => isPresent(item.value)));

  if (!visibleGroups.length) {
    return <DetailEmpty>Esta propiedad aun no tiene informacion detallada registrada.</DetailEmpty>;
  }

  return (
    <div className="detail-group-grid">
      {visibleGroups.map((group) => (
        <DetailDataGroup key={group.title} title={group.title} items={group.items} />
      ))}
    </div>
  );
}

function DetailSection({ title, description, children }) {
  return (
    <section className="detail-section">
      <div className="detail-section__header">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {children}
    </section>
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
  const thumbSlots = [0, 1, 2, 3].map((index) => images[index + 1] || images[index] || fallbackImage);

  return (
    <section className="property-hero property-hero--nido" aria-label="Galeria de imagenes">
      <div className="property-hero__gallery property-hero__gallery--premium">
        <div className="property-hero__main">
          <img
            src={selected}
            alt={property.title || 'Propiedad NIDO'}
            className="property-hero__cover"
            decoding="async"
            loading="eager"
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
          <button type="button" className="property-hero__all-photos" onClick={() => onSelectImage(images[0])}>
            <Images size={16} />
            <span className="property-hero__all-photos-label">Ver todas las fotos</span>
          </button>
        </div>

        <div className="property-hero__grid property-hero__thumbs">
          {thumbSlots.map((image, index) => (
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
  const requirementChips = [...new Set([
    ...splitListText(property.requirements),
    property.requiresRentalStudy ? 'Estudio de arriendo' : '',
  ].filter(Boolean))];
  const groups = [
    {
      title: 'Contrato',
      items: [
        { label: 'Contrato minimo', value: property.minLeaseMonths ? `${property.minLeaseMonths} meses` : '' },
        {
          label: 'Disponibilidad',
          value: property.availableImmediately ? 'Inmediata' : formatDate(property.availableFrom),
        },
        { label: 'Estudio de arriendo', value: property.requiresRentalStudy ? 'Requerido' : 'No registrado' },
        { label: 'Codeudor', value: property.acceptsCosigner ? 'Acepta codeudor' : 'Por confirmar' },
      ],
    },
    {
      title: 'Reglas',
      items: [
        { label: 'Mascotas', value: isPresent(property.petsAllowed) ? formatBoolean(property.petsAllowed) : '' },
        { label: 'Estudiantes', value: isPresent(property.acceptsStudents) ? formatBoolean(property.acceptsStudents) : '' },
        { label: 'Familias', value: isPresent(property.acceptsFamilies) ? formatBoolean(property.acceptsFamilies) : '' },
        { label: 'Convivencia', value: property.rules },
      ],
    },
    {
      title: 'Pagos y servicios',
      items: [
        { label: 'Deposito', value: property.depositRequired ? formatCurrency(property.securityDeposit) : 'Por confirmar' },
        {
          label: 'Administracion',
          value: property.administrationIncluded
            ? 'Incluida en el canon'
            : property.maintenanceFee
              ? formatCurrency(property.maintenanceFee)
              : 'No registrada',
        },
        {
          label: 'Servicios incluidos',
          value: property.servicesIncluded?.length ? property.servicesIncluded.join(', ') : '',
        },
        { label: 'Condiciones especiales', value: property.specialConditions },
      ],
    },
  ];
  const hasConditions = groups.some((group) => group.items.some((item) => isPresent(item.value))) || requirementChips.length;

  return (
    <DetailSection title="Condiciones de arriendo" description="Datos de contrato y convivencia registrados por el arrendador.">
      {hasConditions ? (
        <>
          <DetailGroupGrid groups={groups} />
          {requirementChips.length ? (
            <div className="document-chip-row" aria-label="Documentos requeridos">
              {requirementChips.map((item) => (
                <span key={item} className="document-chip">
                  <CheckCircle2 size={14} />
                  {item}
                </span>
              ))}
            </div>
          ) : null}
        </>
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
    <div className="content-card owner-card owner-profile-card">
      {owner.avatarUrl ? (
        <img src={owner.avatarUrl} alt={ownerName} />
      ) : (
        <span className="owner-card__avatar" aria-hidden="true">
          {ownerName ? getInitials(ownerName) : <UserRound size={34} />}
        </span>
      )}
      <div className="owner-profile-card__content">
        <div className="owner-profile-card__heading">
          <span className="section__eyebrow">Arrendador</span>
          <h2>{ownerName}</h2>
          <p className="owner-profile-card__status">
            <ShieldCheck size={16} />
            {property.verificationDetails || owner.verified ? 'Arrendador verificado' : 'Identidad en revision'}
          </p>
        </div>
        <p>{safeText(owner.bio, 'Informacion publica limitada para proteger la privacidad del arrendador.')}</p>
        <div className="owner-metric-grid">
          <div>
            <strong>{owner.responseRate || 'Por confirmar'}</strong>
            <span>Tasa de respuesta</span>
          </div>
          <div>
            <strong>{owner.responseTime || 'Durante el proceso'}</strong>
            <span>Tiempo promedio</span>
          </div>
          <div>
            <strong>{ownerSince || 'Fecha privada'}</strong>
            <span>En NIDO desde</span>
          </div>
          <div>
            <strong>{property.requestCount || 'Activo'}</strong>
            <span>Interes reciente</span>
          </div>
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
  const reviewCount = comments.length || property.reviewsCount || property.commentsCount || 0;

  return (
    <DetailSection title="Comentarios y valoraciones" description="Experiencias visibles cuando el backend las expone para esta propiedad.">
      {hasRating || reviewCount ? (
        <div className="rating-summary rating-summary--premium">
          {hasRating ? (
            <>
              <strong>{rating.toFixed(1)}</strong>
              <RatingStars value={rating} />
            </>
          ) : null}
          <span>{reviewCount} resenas verificadas</span>
          <span className="verified-pill">
            <ShieldCheck size={14} />
            Verificadas por NIDO
          </span>
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
              <span className="comment-card__verified">
                <ShieldCheck size={14} />
                Resena verificada
              </span>
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
            { icon: Home, label: 'Tipo', value: getPropertyTypeLabel(property.propertyType) || '--' },
            { icon: BedDouble, label: 'Habitaciones', value: property.bedrooms ?? '--' },
            { icon: Bath, label: 'Banos', value: property.bathrooms ?? '--' },
            { icon: Ruler, label: 'Area', value: property.areaM2 ? `${property.areaM2} m2` : '--' },
            {
              icon: Home,
              label: 'Piso',
              value: isPresent(property.floor) ? property.floor : 'Por confirmar',
            },
            {
              icon: ShieldCheck,
              label: 'Estrato',
              value: isPresent(property.strata) ? property.strata : 'Por confirmar',
            },
            {
              icon: PawPrint,
              label: 'Mascotas',
              value: isPresent(property.petsAllowed) ? formatBoolean(property.petsAllowed) : 'Por confirmar',
            },
          ]
        : [],
    [property]
  );

  const practicalGroups = useMemo(
    () =>
      property
        ? [
            {
              title: 'Costos',
              items: [
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
              ],
            },
            {
              title: 'Ubicacion',
              items: [
                { label: 'Departamento', value: property.department },
                { label: 'Ciudad', value: property.city },
                { label: 'Barrio', value: property.neighborhood },
                { label: 'Zona o direccion aproximada', value: getApproximateAddress(property) },
              ],
            },
            {
              title: 'Caracteristicas',
              items: [
                { label: 'Tipo de propiedad', value: getPropertyTypeLabel(property.propertyType) },
                { label: 'Piso', value: isPresent(property.floor) ? property.floor : '' },
                { label: 'Estrato', value: isPresent(property.strata) ? property.strata : '' },
                { label: 'Habitaciones', value: property.bedrooms },
                { label: 'Banos', value: property.bathrooms },
                { label: 'Area', value: property.areaM2 ? `${property.areaM2} m2` : '' },
                { label: 'Amoblado', value: isPresent(property.furnished) ? formatBoolean(property.furnished) : '' },
                { label: 'Mascotas', value: isPresent(property.petsAllowed) ? formatBoolean(property.petsAllowed) : '' },
                { label: 'Capacidad maxima', value: property.maxOccupants ? `${property.maxOccupants} personas` : '' },
                { label: 'Estado', value: property.availableImmediately ? 'Disponible ahora' : 'Disponibilidad programada' },
              ],
            },
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

  const handleShare = async () => {
    const title = safeText(property?.title, 'Propiedad NIDO');
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setPageMessage('Enlace copiado para compartir esta propiedad.');
        return;
      }

      setPageMessage('Copia el enlace del navegador para compartir esta propiedad.');
    } catch {
      setPageMessage('No pudimos abrir el panel de compartir. El enlace sigue disponible en el navegador.');
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
        <div className="property-detail-topbar__copy">
          <span className="section__eyebrow">Ficha de propiedad</span>
          <h1>{safeText(property.title, `${getPropertyTypeLabel(property.propertyType)} en arriendo`)}</h1>
          <div className="property-detail-meta">
            <span>
              <MapPin size={16} />
              {property.city || 'Ciudad por confirmar'} - {property.department || 'Colombia'} -{' '}
              {property.neighborhood || 'Barrio por confirmar'}
            </span>
            {Number.isFinite(Number(property.rating || property.averageRating)) ? (
              <span>
                <Star size={16} fill="currentColor" />
                {Number(property.rating || property.averageRating).toFixed(1)} -{' '}
                {property.reviewsCount || property.commentsCount || 0} resenas verificadas
              </span>
            ) : null}
          </div>
          <div className="property-detail-badges">
            {detailBadges.map((badge) => (
              <span key={badge}>{badge}</span>
            ))}
          </div>
        </div>
        <div className="property-detail-topbar__actions">
          <button type="button" className="button button--secondary" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            Volver
          </button>
          <button type="button" className="button button--secondary" onClick={handleShare}>
            <Share2 size={16} />
            Compartir
          </button>
          <button
            type="button"
            className={`button button--secondary ${property.isFavorite ? 'button--saved' : ''}`}
            onClick={toggleFavorite}
          >
            <Heart size={16} />
            {property.isFavorite ? 'Guardada' : 'Guardar'}
          </button>
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

      <section className="section nido-detail-layout" aria-label="Detalle organizado de la propiedad">
        <div className="nido-detail-main">
          <PropertyStatsStrip property={property} />
          <PropertyDescription property={property} />
          <PropertyHighlights property={property} />
          <DetailAmenities property={property} />
          <PropertyPracticalDetails property={property} />
          <PropertyRentalConditions property={property} />
          <PropertyLocation property={property} />
        </div>

        <PropertySidebar
          property={property}
          pageMessage={pageMessage}
          onContact={handleContact}
          onToggleFavorite={toggleFavorite}
        />
      </section>
    </div>
  );
}
