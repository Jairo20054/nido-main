import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Home,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../../components/ui/EmptyState';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { api } from '../../lib/apiClient';
import { PropertyCard } from '../properties/PropertyCard';
import { PropertyCardSkeleton } from '../properties/PropertyCardSkeleton';

const POPULAR_CITIES = ['Bogota', 'Medellin', 'Cali', 'Barranquilla', 'Envigado'];
const BUDGET_OPTIONS = [
  { value: 2500000, label: 'Hasta $2.5M' },
  { value: 3500000, label: 'Hasta $3.5M' },
  { value: 4500000, label: 'Hasta $4.5M' },
  { value: 6500000, label: 'Hasta $6.5M' },
];
const PROPERTY_TYPES = [
  { value: '', label: 'Cualquier tipo' },
  { value: 'apartment', label: 'Apartamento' },
  { value: 'house', label: 'Casa' },
  { value: 'studio', label: 'Estudio' },
];
const TRUST_POINTS = [
  { icon: BadgeCheck, label: 'Propiedades verificadas' },
  { icon: ShieldCheck, label: 'Costos claros' },
  { icon: Sparkles, label: 'Explora sin cuenta' },
];

export function HomePage() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    city: '',
    budget: 4500000,
    propertyType: '',
  });

  useEffect(() => {
    let active = true;

    api
      .get('/properties/featured', { auth: false })
      .then((response) => {
        if (active) {
          setProperties(response.data || []);
          setError('');
        }
      })
      .catch((requestError) => {
        if (active) {
          setProperties([]);
          setError(requestError.message || 'No pudimos cargar las propiedades destacadas.');
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
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();

    if (searchFilters.city) params.set('ciudad', searchFilters.city);
    params.set('min', '1800000');
    params.set('max', String(searchFilters.budget));
    params.set('hab', '1');
    params.set('banos', '1');
    if (searchFilters.propertyType) params.set('tipo', searchFilters.propertyType);

    navigate(`/properties?${params.toString()}`);
  };

  const displayCity = searchFilters.city || 'Colombia';
  const featuredProperties = useMemo(() => properties.slice(0, 6), [properties]);
  const leadProperties = featuredProperties.slice(0, 3);
  const moreProperties = featuredProperties.slice(3, 6);

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero__content">
          <div className="home-hero__intro">
            <span className="hero-kicker">Vivienda en arriendo en Colombia</span>
            <h1 className="home-hero__title">Encontrar hogar deberia sentirse simple.</h1>
            <p className="home-hero__subtitle">
              Busca por zona, presupuesto y tipo de vivienda. Nido te muestra opciones claras,
              comparables y listas para explorar en segundos.
            </p>
          </div>

          <form className="home-search" onSubmit={handleSearch}>
            <label className="home-search__field home-search__field--location">
              <span className="home-search__label">
                <MapPin size={16} />
                Ciudad o zona
              </span>
              <input
                type="text"
                placeholder="Bogota, Medellin, Chapinero..."
                value={searchFilters.city}
                onChange={(event) =>
                  setSearchFilters({ ...searchFilters, city: event.target.value })
                }
              />
            </label>

            <div className="home-search__field">
              <span className="home-search__label">Presupuesto</span>
              <div className="home-search__chips" aria-label="Seleccionar presupuesto">
                {BUDGET_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`home-search-chip ${
                      searchFilters.budget === option.value ? 'home-search-chip--active' : ''
                    }`}
                    onClick={() =>
                      setSearchFilters((current) => ({ ...current, budget: option.value }))
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="home-search__field">
              <span className="home-search__label">
                <Home size={16} />
                Tipo
              </span>
              <select
                value={searchFilters.propertyType}
                onChange={(event) =>
                  setSearchFilters({ ...searchFilters, propertyType: event.target.value })
                }
              >
                {PROPERTY_TYPES.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <button type="submit" className="home-search__button">
              <Search size={18} />
              Buscar
            </button>
          </form>

          <div className="home-quick-row" aria-label="Busquedas rapidas">
            <span>Popular:</span>
            {POPULAR_CITIES.map((city) => (
              <button
                key={city}
                type="button"
                className={`home-city-chip ${
                  searchFilters.city === city ? 'home-city-chip--active' : ''
                }`}
                onClick={() => setSearchFilters((current) => ({ ...current, city }))}
              >
                {city}
              </button>
            ))}
          </div>

          <div className="home-hero__footer">
            <div className="hero-trust-list" aria-label="Beneficios de Nido">
              {TRUST_POINTS.map(({ icon: Icon, label }) => (
                <div key={label}>
                  <Icon size={18} />
                  <span>{label}</span>
                </div>
              ))}
            </div>

            <button type="button" className="hero-inline-link" onClick={() => navigate('/properties')}>
              Ver todas las propiedades
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>

      <section className="home-featured home-featured--lead">
        <div className="section__heading home-section-heading">
          <div>
            <span className="section__eyebrow">Disponibles ahora</span>
            <h2>Viviendas destacadas en {displayCity}</h2>
          </div>
          <span className="home-result-pill">
            {loading ? 'Buscando...' : `${featuredProperties.length} opciones curadas`}
          </span>
        </div>

        <InlineMessage tone="danger">{error}</InlineMessage>
        {loading ? (
          <div className="property-grid property-grid--featured">
            <PropertyCardSkeleton count={3} variant="featured" />
          </div>
        ) : leadProperties.length > 0 ? (
          <div className="property-grid property-grid--featured">
            {leadProperties.map((property) => (
              <PropertyCard key={property.id} property={property} variant="featured" />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No hay propiedades disponibles"
            description="Intenta cambiar tus filtros o busqueda."
          />
        )}
      </section>

      <section className="home-insights" id="como-funciona">
        <div className="home-insight-card">
          <span>01</span>
          <strong>Busca en una sola accion</strong>
          <p>Zona, presupuesto y tipo de vivienda. Lo esencial para avanzar rapido.</p>
        </div>
        <div className="home-insight-card">
          <span>02</span>
          <strong>Compara sin distracciones</strong>
          <p>Tarjetas visuales con precio, ubicacion y atributos clave desde el primer vistazo.</p>
        </div>
        <div className="home-insight-card" id="para-propietarios">
          <span>03</span>
          <strong>Avanza con confianza</strong>
          <p>Explora libremente y crea cuenta solo cuando quieras guardar o reservar.</p>
        </div>
      </section>

      {moreProperties.length > 0 ? (
        <section className="home-featured">
          <div className="section__heading home-section-heading">
            <div>
              <span className="section__eyebrow">Mas para explorar</span>
              <h2>Opciones recientes con buena relacion valor-ubicacion</h2>
            </div>
            <LinkishButton onClick={() => navigate('/properties')}>Ver todas</LinkishButton>
          </div>

          <div className="property-grid">
            {moreProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>
      ) : loading ? (
        <section className="home-featured">
          <div className="section__heading home-section-heading">
            <div>
              <span className="section__eyebrow">Mas para explorar</span>
              <h2>Cargando mas propiedades curadas</h2>
            </div>
          </div>

          <div className="property-grid">
            <PropertyCardSkeleton count={3} />
          </div>
        </section>
      ) : null}
    </div>
  );
}

function LinkishButton({ children, onClick }) {
  return (
    <button type="button" className="ghost-link" onClick={onClick}>
      {children}
    </button>
  );
}
