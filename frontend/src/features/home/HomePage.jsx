import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Bath,
  BedDouble,
  Compass,
  HeartHandshake,
  Home,
  KeyRound,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  UsersRound,
  WalletCards,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { EmptyState } from '../../components/ui/EmptyState';
import { InlineMessage } from '../../components/ui/InlineMessage';
import { useAuth } from '../../app/providers/useAuth';
import { api } from '../../lib/apiClient';
import { PropertyCard } from '../properties/PropertyCard';
import { PropertyCardSkeleton } from '../properties/PropertyCardSkeleton';

const POPULAR_CITIES = ['Bogota', 'Medellin', 'Cali', 'Barranquilla', 'Envigado'];

const BUDGET_OPTIONS = [
  { value: '', label: 'Sin limite' },
  { value: 1500000, label: 'Hasta $1.5M' },
  { value: 2000000, label: 'Hasta $2M' },
  { value: 2500000, label: 'Hasta $2.5M' },
  { value: 3500000, label: 'Hasta $3.5M' },
  { value: 'over-3500000', label: 'Mas de $3.5M' },
];

const PROPERTY_TYPES = [
  { value: '', label: 'Cualquier tipo' },
  { value: 'apartment', label: 'Apartamento' },
  { value: 'house', label: 'Casa' },
  { value: 'studio', label: 'Apartaestudio' },
  { value: 'room', label: 'Habitacion' },
  { value: 'loft', label: 'Loft' },
];

const ROOM_OPTIONS = [
  { value: '', label: 'Cualquiera' },
  { value: 1, label: '1 habitacion' },
  { value: 2, label: '2 habitaciones' },
  { value: 3, label: '3 habitaciones' },
  { value: 4, label: '4 o mas habitaciones' },
];

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: 'Propiedades verificadas',
    description: 'Revisamos cada anuncio',
  },
  {
    icon: WalletCards,
    title: 'Costos claros',
    description: 'Sin cobros ocultos',
  },
  {
    icon: UsersRound,
    title: 'Opciones para familias',
    description: 'Espacios para cada etapa',
  },
  {
    icon: Compass,
    title: 'Explora sin complicaciones',
    description: 'Busqueda rapida y simple',
  },
];

const DEFAULT_FILTERS = {
  location: '',
  budget: '',
  propertyType: '',
  rooms: '',
};

const COLOMBIA_CENTER = { latitude: 4.711, longitude: -74.0721 };

const removeAccents = (value) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

const formatDistance = (distanceKm) =>
  Number.isFinite(distanceKm) ? `${distanceKm.toFixed(1)} km` : '';

const toRadians = (value) => (value * Math.PI) / 180;

const getDistanceKm = (origin, property) => {
  const latitude = Number(property?.latitude);
  const longitude = Number(property?.longitude);

  if (!origin || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  const earthRadiusKm = 6371;
  const deltaLatitude = toRadians(latitude - origin.latitude);
  const deltaLongitude = toRadians(longitude - origin.longitude);
  const startLatitude = toRadians(origin.latitude);
  const endLatitude = toRadians(latitude);
  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(deltaLongitude / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
};

export function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingFavorite, setSavingFavorite] = useState('');
  const [locationStatus, setLocationStatus] = useState('idle');
  const [userCoordinates, setUserCoordinates] = useState(null);
  const [searchFilters, setSearchFilters] = useState(DEFAULT_FILTERS);

  useEffect(() => {
    let active = true;

    setLoading(true);
    api
      .get('/properties/featured', { auth: isAuthenticated })
      .then((response) => {
        if (!active) return;
        setProperties(response.data || []);
        setError('');
      })
      .catch((requestError) => {
        if (!active) return;
        setProperties([]);
        setError(requestError.message || 'No pudimos cargar las propiedades recomendadas.');
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const buildSearchPath = (filters = searchFilters) => {
    const params = new URLSearchParams();
    const locationValue = removeAccents(filters.location || '');

    if (locationValue) params.set('ciudad', locationValue);
    if (filters.budget === 'over-3500000') {
      params.set('min', '3500000');
    } else if (filters.budget) {
      params.set('max', String(filters.budget));
    }
    if (filters.propertyType) params.set('tipo', filters.propertyType);
    if (filters.rooms) params.set('hab', String(filters.rooms));

    const query = params.toString();
    return query ? `/properties?${query}` : '/properties';
  };

  const handleSearch = (event) => {
    event.preventDefault();
    navigate(buildSearchPath());
  };

  const handleCitySearch = (city) => {
    const nextFilters = { ...searchFilters, location: city };
    setSearchFilters(nextFilters);
    navigate(buildSearchPath(nextFilters));
  };

  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('unavailable');
      return;
    }

    setLocationStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationStatus('ready');
      },
      () => {
        setUserCoordinates(null);
        setLocationStatus('denied');
      },
      { enableHighAccuracy: false, maximumAge: 1000 * 60 * 10, timeout: 8000 }
    );
  };

  const toggleFavorite = async (property) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    setSavingFavorite(property.id);

    try {
      if (property.isFavorite) {
        await api.delete(`/favorites/${property.id}`);
      } else {
        await api.post(`/favorites/${property.id}`, {});
      }

      setProperties((current) =>
        current.map((item) =>
          item.id === property.id ? { ...item, isFavorite: !item.isFavorite } : item
        )
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingFavorite('');
    }
  };

  const recommendedProperties = useMemo(() => {
    const origin = userCoordinates || COLOMBIA_CENTER;

    return properties
      .map((property) => ({
        ...property,
        distanceKm: getDistanceKm(origin, property),
      }))
      .sort((left, right) => {
        if (left.distanceKm === null && right.distanceKm === null) return 0;
        if (left.distanceKm === null) return 1;
        if (right.distanceKm === null) return -1;
        return left.distanceKm - right.distanceKm;
      })
      .slice(0, 4);
  }, [properties, userCoordinates]);

  return (
    <div className="home-page home-page--nido">
      <HomeHero
        filters={searchFilters}
        onFilterChange={setSearchFilters}
        onSearch={handleSearch}
        onCitySearch={handleCitySearch}
      />

      <BenefitHighlights />

      <section className="home-recommended" aria-labelledby="recommended-title">
        <div className="home-recommended__heading">
          <div>
            <span className="section__eyebrow home-recommended__eyebrow">
              <MapPin size={14} />
              Basado en tu ubicacion
            </span>
            <h2 id="recommended-title">Viviendas recomendadas cerca de ti</h2>
          </div>
          <div className="home-recommended__actions">
            <button
              type="button"
              className="home-location-button"
              onClick={requestUserLocation}
              disabled={locationStatus === 'requesting'}
            >
              <Compass size={16} />
              {locationStatus === 'requesting' ? 'Ubicando...' : 'Usar mi ubicacion'}
            </button>
            <button type="button" className="hero-inline-link" onClick={() => navigate('/properties')}>
              Ver todas las propiedades
              <ArrowRight size={17} />
            </button>
          </div>
        </div>

        <InlineMessage tone="danger">{error}</InlineMessage>
        {locationStatus === 'denied' ? (
          <InlineMessage tone="neutral">
            Seguimos mostrando opciones destacadas aunque no compartas tu ubicacion.
          </InlineMessage>
        ) : null}

        {loading ? (
          <div className="property-grid property-grid--home">
            <PropertyCardSkeleton count={4} variant="compact" />
          </div>
        ) : recommendedProperties.length > 0 ? (
          <div className="property-grid property-grid--home">
            {recommendedProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                variant="home"
                proximityLabel={property.distanceKm ? 'Cerca de ti' : 'Recomendada'}
                distanceLabel={formatDistance(property.distanceKm)}
                onToggleFavorite={toggleFavorite}
                disabledFavorite={savingFavorite === property.id}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Aun no hay propiedades publicadas"
            description="Cuando haya viviendas disponibles las veras aqui. Mientras tanto puedes abrir el catalogo para ajustar filtros."
            actionLabel="Explorar catalogo"
            onAction={() => navigate('/properties')}
          />
        )}
      </section>
    </div>
  );
}

function HomeHero({ filters, onFilterChange, onSearch, onCitySearch }) {
  const updateFilter = (field, value) => {
    onFilterChange((current) => ({ ...current, [field]: value }));
  };

  return (
    <section className="home-hero home-hero--image">
      <div className="home-hero__content">
        <div className="home-hero__intro">
          <span className="hero-kicker">
            <Sparkles size={14} />
            Arriendos claros en Colombia
          </span>
          <h1 className="home-hero__title">Donde quieres vivir hoy?</h1>
          <p className="home-hero__subtitle">
            Encuentra arriendos confiables con informacion clara, propiedades verificadas y
            procesos sin complicaciones.
          </p>
        </div>

        <SearchFilters filters={filters} onFilterChange={updateFilter} onSearch={onSearch} />
        <PopularCities selectedCity={filters.location} onSelect={onCitySearch} />
      </div>
    </section>
  );
}

function SearchFilters({ filters, onFilterChange, onSearch }) {
  return (
    <form className="home-search" onSubmit={onSearch}>
      <label className="home-search__field home-search__field--location">
        <span className="home-search__icon">
          <MapPin size={20} />
        </span>
        <span className="home-search__label">Ciudad o zona</span>
        <input
          type="text"
          list="home-popular-cities"
          placeholder="Ej: Bogota, Chapinero"
          value={filters.location}
          onChange={(event) => onFilterChange('location', event.target.value)}
        />
      </label>

      <label className="home-search__field">
        <span className="home-search__icon">
          <WalletCards size={20} />
        </span>
        <span className="home-search__label">Presupuesto</span>
        <select
          value={filters.budget}
          onChange={(event) => onFilterChange('budget', event.target.value)}
        >
          {BUDGET_OPTIONS.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="home-search__field">
        <span className="home-search__icon">
          <Home size={20} />
        </span>
        <span className="home-search__label">Tipo de vivienda</span>
        <select
          value={filters.propertyType}
          onChange={(event) => onFilterChange('propertyType', event.target.value)}
        >
          {PROPERTY_TYPES.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="home-search__field">
        <span className="home-search__icon">
          <BedDouble size={20} />
        </span>
        <span className="home-search__label">Habitaciones</span>
        <select value={filters.rooms} onChange={(event) => onFilterChange('rooms', event.target.value)}>
          {ROOM_OPTIONS.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <button type="submit" className="home-search__button">
        <Search size={20} />
        Buscar
      </button>

      <datalist id="home-popular-cities">
        {POPULAR_CITIES.map((city) => (
          <option key={city} value={city} />
        ))}
      </datalist>
    </form>
  );
}

function PopularCities({ selectedCity, onSelect }) {
  return (
    <div className="home-quick-row" aria-label="Ciudades populares">
      <span>Ciudades populares:</span>
      {POPULAR_CITIES.map((city) => (
        <button
          key={city}
          type="button"
          className={`home-city-chip ${
            selectedCity === city ? 'home-city-chip--active' : ''
          }`}
          onClick={() => onSelect(city)}
        >
          {city}
        </button>
      ))}
    </div>
  );
}

function BenefitHighlights() {
  return (
    <section className="home-benefits" aria-label="Beneficios de Nido">
      {BENEFITS.map(({ icon: Icon, title, description }) => (
        <article key={title} className="home-benefit">
          <span className="home-benefit__icon">
            <Icon size={22} />
          </span>
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
        </article>
      ))}
      <div className="home-benefits__trust" aria-hidden="true">
        <HeartHandshake size={18} />
        <KeyRound size={18} />
        <Bath size={18} />
        <Tag size={18} />
      </div>
    </section>
  );
}
