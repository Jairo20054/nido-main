import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Building2, ShieldCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingState } from '../../components/ui/LoadingState';
import { api } from '../../lib/apiClient';
import { PropertyCard } from '../properties/PropertyCard';

export function HomePage() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: '',
    propertyType: '',
    minRent: '',
    bedrooms: '',
  });

  useEffect(() => {
    let active = true;

    api
      .get('/properties/featured', { auth: false })
      .then((response) => {
        if (active) {
          setFeatured(response.data);
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

  const metrics = useMemo(
    () => [
      { label: 'Propiedades curadas', value: 'Solo arriendo' },
      { label: 'Solicitudes ordenadas', value: 'Seguimiento claro' },
      { label: 'Interfaz minimalista', value: 'Menos ruido visual' },
    ],
    []
  );

  const handleSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="page">
      <section className="hero">
        <div className="hero__content">
          <div className="hero__eyebrow">
            <Sparkles size={16} />
            NIDO, enfocado solo en arrendamiento residencial
          </div>
          <h1>Encuentra arriendos bien presentados, sin ruido y con flujo real de solicitud.</h1>
          <p>
            Explora propiedades listas para habitar, guarda las opciones que te interesan y envía
            solicitudes claras desde una experiencia moderna y sobria.
          </p>
          <form className="hero-search" onSubmit={handleSearch}>
            <input
              value={filters.city}
              onChange={(event) => setFilters((current) => ({ ...current, city: event.target.value }))}
              placeholder="Ciudad"
            />
            <input
              value={filters.minRent}
              onChange={(event) => setFilters((current) => ({ ...current, minRent: event.target.value }))}
              placeholder="Canon minimo"
              type="number"
            />
            <input
              value={filters.bedrooms}
              onChange={(event) => setFilters((current) => ({ ...current, bedrooms: event.target.value }))}
              placeholder="Habitaciones"
              type="number"
            />
            <button className="button" type="submit">
              Buscar propiedades
              <ArrowRight size={16} />
            </button>
          </form>
          <div className="hero__metrics">
            {metrics.map((metric) => (
              <div key={metric.label}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="hero__panel">
          <div className="hero__panel-card">
            <Building2 size={22} />
            <h3>Busqueda con criterios reales</h3>
            <p>Canon, ciudad, tipo de inmueble y atributos que sí importan en arriendo local.</p>
          </div>
          <div className="hero__panel-card">
            <ShieldCheck size={22} />
            <h3>Solicitudes trazables</h3>
            <p>Todo el flujo de contacto vive dentro de la plataforma: guardados, solicitudes y gestión.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__heading">
          <div>
            <span className="section__eyebrow">Seleccion destacada</span>
            <h2>Propiedades listas para arrendar</h2>
          </div>
          <button className="button button--secondary" type="button" onClick={() => navigate('/properties')}>
            Ver catalogo completo
          </button>
        </div>

        {loading ? (
          <LoadingState label="Cargando propiedades destacadas..." />
        ) : featured.length ? (
          <div className="property-grid">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Aun no hay propiedades destacadas"
            description="En cuanto existan publicaciones activas apareceran aqui."
          />
        )}
      </section>
    </div>
  );
}
