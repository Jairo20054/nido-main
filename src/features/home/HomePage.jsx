import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingState } from '../../components/ui/LoadingState';
import { PropertyCard } from '../properties/PropertyCard';
import { api } from '../../lib/apiClient';

const quickFilters = [
  { id: 'all', label: 'Todo' },
  { id: 'APARTMENT', label: 'Apartamento' },
  { id: 'HOUSE', label: 'Casa' },
  { id: 'STUDIO', label: 'Estudio' },
  { id: 'furnished', label: 'Amoblado' },
  { id: 'pets', label: 'Mascotas OK' },
];

/**
 * Componente de uso para la pagina de inicio del marketplace.
 * Sirve como puerta de entrada publica: muestra una busqueda corta, filtros rapidos
 * y una muestra curada de propiedades destacadas para iniciar la exploracion.
 */
export function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState({
    city: '',
    budget: '',
    bedrooms: '',
  });

  useEffect(() => {
    let active = true;

    // Solo se muestran propiedades destacadas publicas, sin requerir autenticacion.
    api
      .get('/properties/featured', { auth: false })
      .then((response) => {
        if (active) {
          setProperties(response.data || []);
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

  // Los filtros rapidos se resuelven en cliente sobre el set destacado para que
  // la exploracion inicial sea instantanea.
  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'furnished') return property.furnished;
      if (activeFilter === 'pets') return property.petsAllowed;
      return property.propertyType === activeFilter;
    });
  }, [activeFilter, properties]);

  // Convierte el formulario hero en query params compatibles con la pagina de busqueda.
  const handleSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();

    if (search.city) params.set('city', search.city);
    if (search.budget) params.set('maxRent', search.budget);
    if (search.bedrooms) params.set('bedrooms', search.bedrooms);

    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="page">
      <section className="hero hero--landing">
        <div className="hero__content hero__content--landing">
          <span className="hero__eyebrow">Arriendo residencial en Colombia</span>
          <h1>Encuentra viviendas listas para comparar, visitar y arrendar.</h1>
          <p>
            Nido conecta arrendadores y arrendatarios con informacion clara, filtros utiles y
            publicaciones verificables desde una sola experiencia.
          </p>

          <form className="hero-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Ciudad o municipio"
              value={search.city}
              onChange={(event) => setSearch((current) => ({ ...current, city: event.target.value }))}
            />
            <input
              type="number"
              placeholder="Canon maximo"
              value={search.budget}
              onChange={(event) => setSearch((current) => ({ ...current, budget: event.target.value }))}
            />
            <input
              type="number"
              placeholder="Habitaciones"
              value={search.bedrooms}
              onChange={(event) => setSearch((current) => ({ ...current, bedrooms: event.target.value }))}
            />
            <button className="button" type="submit">
              Buscar
            </button>
          </form>

          <div className="hero__metrics">
            <div>
              <strong>{properties.length}</strong>
              <span>Propiedades destacadas</span>
            </div>
            <div>
              <strong>Roles protegidos</strong>
              <span>Admin, arrendador y arrendatario</span>
            </div>
            <div>
              <strong>Flujo guiado</strong>
              <span>Publicacion paso a paso y revision real</span>
            </div>
          </div>
        </div>

        <div className="hero__panel">
          <div className="hero__panel-card">
            <span className="section__eyebrow">Seleccion destacada</span>
            <h3>Publicaciones con informacion suficiente para decidir mejor</h3>
            <p>Compara precio, ubicacion, caracteristicas, normas y condiciones antes de aplicar.</p>
          </div>
          <div className="hero__panel-card">
            <span className="section__eyebrow">Publica en minutos</span>
            <h3>Wizard para arrendadores</h3>
            <p>Guarda borrador, carga fotos, agrega video y envia a revision desde el panel.</p>
            <Link className="button button--secondary" to="/manage">
              Ir al panel
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--compact">
        <div className="section__heading">
          <div>
            <span className="section__eyebrow">Explora</span>
            <h2>Propiedades disponibles</h2>
          </div>
          <div className="chip-row">
            {quickFilters.map((filter) => (
              <button
                key={filter.id}
                className={`filter-chip ${activeFilter === filter.id ? 'filter-chip--active' : ''}`}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <LoadingState label="Cargando seleccion destacada..." />
        ) : filteredProperties.length ? (
          <div className="property-grid">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} showStatus />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Aun no hay propiedades publicadas"
            description="Cuando existan publicaciones aprobadas y publicadas apareceran aqui."
          />
        )}
      </section>
    </div>
  );
}
