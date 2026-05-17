import React, { useEffect, useMemo, useState } from 'react';
import {
  Bath,
  BedDouble,
  BriefcaseBusiness,
  CalendarDays,
  Heart,
  MapPin,
  PawPrint,
  Ruler,
  ShieldCheck,
  Sparkles,
  SquareParking,
  Sofa,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { EmptyState } from '../../components/ui/EmptyState';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { LoadingState } from '../../components/ui/LoadingState';
import { useAuth } from '../../app/providers/useAuth';
import { api } from '../../lib/apiClient';
import { formatCurrency, formatDate, getPropertyTypeLabel } from '../../lib/formatters';
import { getFallbackPropertyImage, getPropertyLocationLabel, getPropertyPrimaryImage } from '../../lib/propertyPresentation';

export function PropertyDetailPage() {
  const { isAuthenticated } = useAuth();
  const { id: propertyId } = useParams();
  const [property, setProperty] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageMessage, setPageMessage] = useState('');

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

  useEffect(() => {
    if (!property) return;

    const firstImage = getPropertyPrimaryImage(property);
    setSelectedImage(firstImage);
  }, [property]);

  const galleryImages = useMemo(() => {
    if (!property) return [];

    const allImages = property.images?.length
      ? property.images.map((image) => image.url)
      : getPropertyPrimaryImage(property)
        ? [getPropertyPrimaryImage(property)]
        : [];

    return [...new Set(allImages)];
  }, [property]);

  const detailFacts = useMemo(
    () =>
      property
        ? [
            { icon: BedDouble, label: 'Habitaciones', value: property.bedrooms },
            { icon: Bath, label: 'Baños', value: property.bathrooms },
            { icon: Ruler, label: 'Área', value: `${property.areaM2} m²` },
            {
              icon: BriefcaseBusiness,
              label: 'Contrato mínimo',
              value: `${property.minLeaseMonths} meses`,
            },
            {
              icon: Users,
              label: 'Capacidad ideal',
              value: `${property.maxOccupants || property.bedrooms + 1} personas`,
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

  const stayHighlights = useMemo(() => {
    if (!property) return [];

    return [
      property.furnished
        ? { icon: Sofa, title: 'Amoblado', description: 'Listo para llegar con menos mudanza.' }
        : { icon: Sparkles, title: 'Sin amoblar', description: 'Más libertad para personalizar.' },
      property.petsAllowed
        ? { icon: PawPrint, title: 'Mascotas bienvenidas', description: 'Ideal si vives con compañía.' }
        : { icon: ShieldCheck, title: 'Sin mascotas', description: 'Regla definida por el propietario.' },
      property.parkingSpots
        ? {
            icon: SquareParking,
            title: `${property.parkingSpots} parqueadero${property.parkingSpots > 1 ? 's' : ''}`,
            description: 'Un punto práctico para el día a día.',
          }
        : {
            icon: MapPin,
            title: 'Sin parqueadero',
            description: 'Buen fit si te mueves caminando o en transporte.',
          },
    ];
  }, [property]);

  const practicalDetails = useMemo(() => {
    if (!property) return [];

    return [
      { label: 'Canon mensual', value: formatCurrency(property.monthlyRent) },
      { label: 'Administración', value: formatCurrency(property.maintenanceFee) },
      { label: 'Depósito', value: formatCurrency(property.securityDeposit) },
      {
        label: 'Costo mensual estimado',
        value: formatCurrency((property.monthlyRent || 0) + (property.maintenanceFee || 0)),
      },
      { label: 'Dirección', value: property.hideExactAddress ? 'Se comparte durante el proceso' : property.addressLine || 'Se comparte durante el proceso' },
      { label: 'Barrio', value: property.neighborhood || 'Zona residencial' },
    ];
  }, [property]);

  const lifestyleNotes = useMemo(() => {
    if (!property) return [];

    return [
      `Ubicada en ${property.city}${property.neighborhood ? `, ${property.neighborhood}` : ''}.`,
      property.availableImmediately
        ? `Disponible de inmediato con contrato mínimo de ${property.minLeaseMonths} meses.`
        : `Disponible desde ${formatDate(property.availableFrom)} con contrato mínimo de ${property.minLeaseMonths} meses.`,
      property.requestCount
        ? `${property.requestCount} persona${property.requestCount > 1 ? 's' : ''} ya mostraron interés en esta propiedad.`
        : 'Aún sin postulaciones activas, ideal para decidir con calma.',
    ];
  }, [property]);

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      setPageMessage('Puedes explorar libremente. Inicia sesión solo cuando quieras guardar o seguir una postulación.');
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
        description={error || 'Puede que ya no esté publicada o que el enlace haya cambiado.'}
      />
    );
  }

  return (
    <div className="page property-detail-page">
      <section className="property-hero">
        <div className="property-hero__gallery property-hero__gallery--enhanced">
          <div className="property-hero__main">
            <img
              src={selectedImage}
              alt={property.title}
              className="property-hero__cover"
              onError={(event) => {
                event.currentTarget.src = getFallbackPropertyImage(property.propertyType);
              }}
            />
            <div className="property-hero__floating-card">
              <span className="section__eyebrow">{getPropertyTypeLabel(property.propertyType)}</span>
              <strong>{formatCurrency(property.monthlyRent)} / mes</strong>
              <p>{getPropertyLocationLabel(property)}</p>
            </div>
          </div>

          <div className="property-hero__grid property-hero__thumbs">
            {galleryImages.slice(0, 4).map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                className={`property-hero__thumb ${selectedImage === image ? 'property-hero__thumb--active' : ''}`}
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={image}
                  alt={`${property.title} vista ${index + 1}`}
                  onError={(event) => {
                    event.currentTarget.src = getFallbackPropertyImage(property.propertyType);
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section property-layout">
        <div className="property-layout__main">
          <div className="property-header">
            <div>
              <span className="section__eyebrow">Ficha detallada</span>
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
                    ? 'Disponible ahora'
                    : `Disponible desde ${formatDate(property.availableFrom) || 'fecha por confirmar'}`}
                </span>
              </div>
            </div>
            <button
              className={`favorite-chip favorite-chip--large ${property.isFavorite ? 'favorite-chip--active' : ''}`}
              type="button"
              onClick={toggleFavorite}
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

          <div className="content-card detail-section">
            <div className="detail-section__header">
              <h2>Lo que más destaca</h2>
              <p>Un resumen rápido para saber si esta opción realmente encaja con tu estilo de vida.</p>
            </div>
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
          </div>

          <div className="content-card detail-section">
            <div className="detail-section__header">
              <h2>Descripción</h2>
              <p>Información amplia para que compares sin tener que adivinar detalles importantes.</p>
            </div>
            <p>{property.description}</p>
          </div>

          <div className="content-card detail-section">
            <div className="detail-section__header">
              <h2>Detalles prácticos</h2>
              <p>Transparencia en valores, ubicación y condiciones desde la misma ficha.</p>
            </div>
            <div className="practical-list">
              {practicalDetails.map((item) => (
                <div key={item.label} className="practical-list__row">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="content-card detail-section">
            <div className="detail-section__header">
              <h2>Amenidades</h2>
              <p>Todo lo que ya viene incluido o mejora la experiencia de vivir aquí.</p>
            </div>
            <div className="tag-list">
              {property.amenities.map((amenity) => (
                <span key={amenity} className="tag">
                  {amenity}
                </span>
              ))}
            </div>
          </div>

          <div className="content-card detail-section">
            <div className="detail-section__header">
              <h2>Contexto de la estancia</h2>
              <p>Notas útiles para decidir con más seguridad y menos fricción.</p>
            </div>
            <div className="insight-list">
              {lifestyleNotes.map((note) => (
                <div key={note} className="insight-list__item">
                  <ShieldCheck size={16} />
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="content-card owner-card">
            <div>
              <span className="section__eyebrow">Propietario</span>
              <h2>{property.owner.fullName}</h2>
              <p>{property.owner.bio || 'Anfitrión enfocado en respuestas claras y seguimiento oportuno.'}</p>
            </div>
            {property.owner.avatarUrl ? (
              <img src={property.owner.avatarUrl} alt={property.owner.fullName} />
            ) : null}
          </div>
        </div>

        <aside className="property-layout__aside">
          <div className="price-card price-card--booking">
            <div className="price-card__header">
              <strong>{formatCurrency(property.monthlyRent)}</strong>
              <span>canon mensual</span>
            </div>
            <div className="price-card__rows">
              <div>
                <span>Administración</span>
                <span>{formatCurrency(property.maintenanceFee)}</span>
              </div>
              <div>
                <span>Deposito</span>
                <span>{formatCurrency(property.securityDeposit)}</span>
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
              <h3>Aplica gratis y sigue un proceso claro</h3>
              <p>
                Verás requisitos, precalificación instantánea, checklist documental y estado del caso
                sin arbitrariedad.
              </p>
            </div>

            <div className="application-trust-list">
              <div>
                <ShieldCheck size={16} />
                <span>No cobramos estudio de viabilidad.</span>
              </div>
              <div>
                <ShieldCheck size={16} />
                <span>Te mostramos por qué pedimos cada documento.</span>
              </div>
              <div>
                <ShieldCheck size={16} />
                <span>El pago inicial se deja para después y con protección.</span>
              </div>
            </div>

            <div className="application-actions">
              <Link className="button" to={`/properties/${property.id}/apply/start`}>
                Arrendar
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
