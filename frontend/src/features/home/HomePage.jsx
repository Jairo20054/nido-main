import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Building2, CircleCheckBig, MapPin, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingState } from '../../components/ui/LoadingState';
import { api } from '../../lib/apiClient';
import { PropertyCard } from '../properties/PropertyCard';

const POPULAR_CITIES = ['Bogota', 'Medellin', 'Cali', 'Barranquilla'];
const PROPERTY_TYPES = [
  { value: '', label: 'Tipo' },
  { value: 'apartment', label: 'Apartamento' },
  { value: 'house', label: 'Casa' },
  { value: 'studio', label: 'Estudio' },
];

export function HomePage() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
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
        }
      })
      .catch(() => {
        if (active) {
          setProperties([]);
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

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero__content home-hero__content--split">
          <div className="home-hero__intro">
            <span className="hero-kicker">Arriendos residenciales en Colombia</span>
            <h1 className="home-hero__title">Encuentra tu proximo hogar</h1>
            <p className="home-hero__subtitle">
              Explora propiedades, revisa fotos y compara detalles con calma. Solo te pediremos
              cuenta cuando quieras reservar o avanzar al pago.
            </p>

            <form className="home-search" onSubmit={handleSearch}>
              <label className="home-search__field">
                <span className="home-search__label">
                  <MapPin size={16} />
                  Donde
                </span>
                <input
                  type="text"
                  placeholder="Ciudad o zona"
                  value={searchFilters.city}
                  onChange={(event) =>
                    setSearchFilters({ ...searchFilters, city: event.target.value })
                  }
                />
              </label>

              <div className="home-search__divider"></div>

              <label className="home-search__field">
                <span className="home-search__label">Presupuesto</span>
                <input
                  type="number"
                  min="500000"
                  step="100000"
                  placeholder="$4.500.000"
                  value={searchFilters.budget}
                  onChange={(event) =>
                    setSearchFilters({ ...searchFilters, budget: Number(event.target.value || 0) })
                  }
                />
              </label>

              <div className="home-search__divider"></div>

              <label className="home-search__field">
                <span className="home-search__label">Tipo</span>
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
                Buscar <ArrowRight size={18} />
              </button>
            </form>

            <div className="home-city-chips">
              {POPULAR_CITIES.map((city) => (
                <button
                  key={city}
                  type="button"
                  className="home-city-chip"
                  onClick={() => setSearchFilters((current) => ({ ...current, city }))}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          <div className="home-hero__panel">
            <div className="hero-stat-card">
              <span>Seleccion cuidada</span>
              <strong>{properties.length || 34} propiedades listas para visitar</strong>
            </div>
            <div className="hero-trust-list">
              <div>
                <CircleCheckBig size={18} />
                <span>Filtros claros desde el primer vistazo</span>
              </div>
              <div>
                <ShieldCheck size={18} />
                <span>Detalles mas claros, fotos mas utiles y costos visibles</span>
              </div>
              <div>
                <Building2 size={18} />
                <span>Login solo cuando quieras reservar o continuar al pago</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-featured">
        <div className="section__heading">
          <div>
            <span className="section__eyebrow">Seleccion destacada</span>
            <h2>{featuredProperties.length || 0} propiedades en {displayCity}</h2>
          </div>
          <LinkishButton onClick={() => navigate('/properties')}>Ver todas</LinkishButton>
        </div>

        {loading ? (
          <LoadingState label="Cargando propiedades..." />
        ) : featuredProperties.length > 0 ? (
          <div className="property-grid">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No hay propiedades disponibles"
            description="Intenta cambiar tus filtros o busqueda."
          />
        )}
      </section>

      <section className="editorial-strip" id="como-funciona">
        <div className="editorial-strip__card">
          <span>1</span>
          <h3>Busca con intencion</h3>
          <p>Ciudad, canon y tipo en una sola accion, sin formularios eternos.</p>
        </div>
        <div className="editorial-strip__card">
          <span>2</span>
          <h3>Afina sin friccion</h3>
          <p>Rangos, steppers y chips convierten filtros complejos en decisiones rapidas.</p>
        </div>
        <div className="editorial-strip__card" id="para-propietarios">
          <span>3</span>
          <h3>Reserva al final</h3>
          <p>Explora libremente y deja el acceso para el momento en que ya quieres avanzar.</p>
        </div>
      </section>
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
