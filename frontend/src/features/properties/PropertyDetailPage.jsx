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
import { useAuth } from '../../app/providers/AuthProvider';
import { api } from '../../lib/apiClient';
import { formatCurrency, formatDate, getPropertyTypeLabel } from '../../lib/formatters';

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

    const firstImage = property.images?.[0]?.url || property.coverImage || '';
    setSelectedImage(firstImage);
  }, [property]);

  const galleryImages = useMemo(() => {
    if (!property) return [];

    const allImages = property.images?.length
      ? property.images.map((image) => image.url)
      : property.coverImage
        ? [property.coverImage]
        : [];

    return [...new Set(allImages)];
  }, [property]);

  const detailFacts = useMemo(
    () =>
      property
        ? [
            { icon: BedDouble, label: 'Habitaciones', value: property.bedrooms },
            { icon: Bath, label: 'Banos', value: property.bathrooms },
            { icon: Ruler, label: 'Area', value: `${property.areaM2} m2` },
            {
              icon: BriefcaseBusiness,
              label: 'Contrato minimo',
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
              value: formatDate(property.availableFrom),
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
        : { icon: Sparkles, title: 'Sin amoblar', description: 'Mas libertad para personalizar.' },
      property.petsAllowed
        ? { icon: PawPrint, title: 'Mascotas bienvenidas', description: 'Ideal si vives con compania.' }
        : { icon: ShieldCheck, title: 'Sin mascotas', description: 'Regla definida por el propietario.' },
      property.parkingSpots
        ? {
            icon: SquareParking,
            title: `${property.parkingSpots} parqueadero${property.parkingSpots > 1 ? 's' : ''}`,
            description: 'Un punto practico para el dia a dia.',
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
      { label: 'Administracion', value: formatCurrency(property.maintenanceFee) },
      { label: 'Deposito', value: formatCurrency(property.securityDeposit) },
      {
        label: 'Costo mensual estimado',
        value: formatCurrency((property.monthlyRent || 0) + (property.maintenanceFee || 0)),
      },
      { label: 'Direccion', value: property.addressLine || 'Se comparte al reservar' },
      { label: 'Barrio', value: property.neighborhood || 'Zona residencial' },
    ];
  }, [property]);

  const lifestyleNotes = useMemo(() => {
    if (!property) return [];

    return [
      `Ubicada en ${property.city}${property.neighborhood ? `, ${property.neighborhood}` : ''}.`,
      `Disponible desde ${formatDate(property.availableFrom)} con contrato minimo de ${property.minLeaseMonths} meses.`,
      property.requestCount
        ? `${property.requestCount} persona${property.requestCount > 1 ? 's' : ''} ya mostraron interes en esta propiedad.`
        : 'Aun sin solicitudes activas, ideal para decidir con calma.',
    ];
  }, [property]);

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      setPageMessage('Puedes explorar libremente. Inicia sesion solo cuando quieras guardar o seguir una solicitud.');
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
      <section className="property-hero">
        <div className="property-hero__gallery property-hero__gallery--enhanced">
          <div className="property-hero__main">
            <img src={selectedImage} alt={property.title} className="property-hero__cover" />
            <div className="property-hero__floating-card">
              <span className="section__eyebrow">{getPropertyTypeLabel(property.propertyType)}</span>
              <strong>{formatCurrency(property.monthlyRent)} / mes</strong>
              <p>{property.city}{property.neighborhood ? `, ${property.neighborhood}` : ''}</p>
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
                <img src={image} alt={`${property.title} vista ${index + 1}`} />
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
                  Disponible desde {formatDate(property.availableFrom)}
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
              <h2>Lo que mas destaca</h2>
              <p>Un resumen rapido para saber si esta opcion realmente encaja con tu estilo de vida.</p>
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
              <h2>Descripcion</h2>
              <p>Informacion amplia para que compares sin tener que adivinar detalles importantes.</p>
            </div>
            <p>{property.description}</p>
          </div>

          <div className="content-card detail-section">
            <div className="detail-section__header">
              <h2>Detalles practicos</h2>
              <p>Transparencia en valores, ubicacion y condiciones desde la misma ficha.</p>
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
              <p>Todo lo que ya viene incluido o mejora la experiencia de vivir aqui.</p>
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
              <p>Notas utiles para decidir con mas seguridad y menos friccion.</p>
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
              <p>{property.owner.bio || 'Anfitrion enfocado en respuestas claras y seguimiento oportuno.'}</p>
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
                <span>Administracion</span>
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
                Veras requisitos, precalificacion instantanea, checklist documental y estado del caso
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
                <span>Te mostramos por que pedimos cada documento.</span>
              </div>
              <div>
                <ShieldCheck size={16} />
                <span>El pago inicial se deja para despues y con proteccion.</span>
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
