import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  COLOMBIA_PROPERTIES,
  PROCESS_STAGES,
  RENTAL_REQUIREMENTS
} from '../../features/rentals/data/properties';
import {
  buildCatalogMetrics,
  formatCurrencyCOP,
  getTrustVariant
} from '../../features/rentals/utils/rentalFormatters';
import './Home.css';

const initialFilters = {
  city: 'Todas',
  type: 'Todos',
  minPrice: '',
  maxPrice: '',
  bedrooms: 'Cualquiera',
  estrato: 'Cualquiera',
  service: 'Todos'
};

export default function Home() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(initialFilters);
  const [favorites, setFavorites] = useState([]);
  const [comparison, setComparison] = useState([]);

  const cities = useMemo(
    () => ['Todas', ...new Set(COLOMBIA_PROPERTIES.map(property => property.city))],
    []
  );

  const types = useMemo(
    () => ['Todos', ...new Set(COLOMBIA_PROPERTIES.map(property => property.type))],
    []
  );

  const services = useMemo(
    () => ['Todos', ...new Set(COLOMBIA_PROPERTIES.flatMap(property => property.services))],
    []
  );

  const filteredProperties = useMemo(
    () =>
      COLOMBIA_PROPERTIES.filter(property => {
        const minPrice = Number(filters.minPrice || 0);
        const maxPrice = Number(filters.maxPrice || Number.MAX_SAFE_INTEGER);

        return (
          (filters.city === 'Todas' || property.city === filters.city) &&
          (filters.type === 'Todos' || property.type === filters.type) &&
          property.price >= minPrice &&
          property.price <= maxPrice &&
          (filters.bedrooms === 'Cualquiera' || property.bedrooms >= Number(filters.bedrooms)) &&
          (filters.estrato === 'Cualquiera' || property.estrato === Number(filters.estrato)) &&
          (filters.service === 'Todos' || property.services.includes(filters.service))
        );
      }),
    [filters]
  );

  const metrics = useMemo(() => buildCatalogMetrics(filteredProperties), [filteredProperties]);

  const toggleFavorite = propertyId => {
    setFavorites(current =>
      current.includes(propertyId)
        ? current.filter(id => id !== propertyId)
        : [...current, propertyId]
    );
  };

  const toggleComparison = propertyId => {
    setComparison(current => {
      if (current.includes(propertyId)) {
        return current.filter(id => id !== propertyId);
      }
      if (current.length >= 3) {
        return current;
      }
      return [...current, propertyId];
    });
  };

  const selectedComparisonProperties = COLOMBIA_PROPERTIES.filter(property =>
    comparison.includes(property.id)
  );

  return (
    <div className="rentals-home">
      <section className="rentals-hero">
        <p className="hero-pill">Arriendos en Colombia · Transparencia Real</p>
        <h1>Encuentra vivienda con precio justo y confianza verificable</h1>
        <p>
          Catálogo estandarizado para comparar inmuebles por ciudad, barrio, estrato, área,
          servicios y nivel de verificación documental.
        </p>
      </section>

      <section className="rentals-metrics">
        <article>
          <span>Precio promedio</span>
          <strong>{formatCurrencyCOP(metrics.avgPrice)}</strong>
        </article>
        <article>
          <span>Área promedio</span>
          <strong>{metrics.avgArea} m²</strong>
        </article>
        <article>
          <span>Confianza promedio</span>
          <strong>{metrics.avgTrust}/100</strong>
        </article>
        <article>
          <span>Publicaciones verificadas</span>
          <strong>{metrics.verifiedRatio}%</strong>
        </article>
      </section>

      <section className="rentals-main-grid">
        <aside className="filters-panel">
          <h2>Filtros avanzados</h2>

          <label>
            Ciudad
            <select value={filters.city} onChange={event => setFilters({ ...filters, city: event.target.value })}>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </label>

          <label>
            Tipo de inmueble
            <select value={filters.type} onChange={event => setFilters({ ...filters, type: event.target.value })}>
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </label>

          <label>
            Precio mínimo
            <input type="number" value={filters.minPrice} placeholder="Ej: 1200000" onChange={event => setFilters({ ...filters, minPrice: event.target.value })} />
          </label>

          <label>
            Precio máximo
            <input type="number" value={filters.maxPrice} placeholder="Ej: 3500000" onChange={event => setFilters({ ...filters, maxPrice: event.target.value })} />
          </label>

          <label>
            Habitaciones (mínimo)
            <select value={filters.bedrooms} onChange={event => setFilters({ ...filters, bedrooms: event.target.value })}>
              <option>Cualquiera</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
            </select>
          </label>

          <label>
            Estrato
            <select value={filters.estrato} onChange={event => setFilters({ ...filters, estrato: event.target.value })}>
              <option>Cualquiera</option>
              {[2, 3, 4, 5, 6].map(stratum => (
                <option key={stratum} value={stratum}>{stratum}</option>
              ))}
            </select>
          </label>

          <label>
            Servicio destacado
            <select value={filters.service} onChange={event => setFilters({ ...filters, service: event.target.value })}>
              {services.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </label>
        </aside>

        <div className="catalog-section">
          <div className="catalog-header">
            <h2>Inmuebles disponibles ({filteredProperties.length})</h2>
            <p>Compara hasta 3 inmuebles para validar precio vs condiciones.</p>
          </div>

          <div className="properties-grid-v2">
            {filteredProperties.map(property => {
              const trustVariant = getTrustVariant(property.trust.score);

              return (
                <article key={property.id} className="property-card-v2">
                  <img src={property.image} alt={property.title} loading="lazy" />
                  <div className="property-body">
                    <h3>{property.title}</h3>
                    <p>{property.city} · {property.neighborhood}</p>
                    <strong>{formatCurrencyCOP(property.price)} / mes</strong>
                    <small>Administración: {formatCurrencyCOP(property.adminFee)}</small>

                    <ul>
                      <li>{property.type}</li>
                      <li>{property.area} m²</li>
                      <li>{property.bedrooms} hab.</li>
                      <li>Estrato {property.estrato}</li>
                    </ul>

                    <div className={`trust-badge ${trustVariant}`}>
                      Confianza {property.trust.score}/100 · Verificado: {property.trust.verifiedOwner ? 'Sí' : 'Pendiente'}
                    </div>

                    <div className="card-actions">
                      <button type="button" onClick={() => toggleFavorite(property.id)}>
                        {favorites.includes(property.id) ? '★ Guardado' : '☆ Favorito'}
                      </button>
                      <button type="button" onClick={() => toggleComparison(property.id)}>
                        {comparison.includes(property.id) ? 'Quitar comparación' : 'Comparar'}
                      </button>
                      <button type="button" className="primary" onClick={() => navigate(`/property/${property.id}`)}>
                        Ver ficha
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="comparison-panel">
        <h2>Comparador de inmuebles</h2>
        {selectedComparisonProperties.length === 0 ? (
          <p>Selecciona inmuebles en “Comparar” para ver diferencias clave.</p>
        ) : (
          <div className="comparison-table">
            {selectedComparisonProperties.map(property => (
              <article key={property.id}>
                <h3>{property.title}</h3>
                <p>{property.city} · {property.neighborhood}</p>
                <p><strong>{formatCurrencyCOP(property.price)}</strong></p>
                <p>{property.area} m² · {property.bedrooms} hab · Estrato {property.estrato}</p>
                <p>Score de confianza: {property.trust.score}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="trust-sections">
        <article>
          <h2>Requisitos estandarizados</h2>
          <ul>
            {RENTAL_REQUIREMENTS.map(requirement => (
              <li key={requirement}>{requirement}</li>
            ))}
          </ul>
        </article>

        <article>
          <h2>Estados del proceso de arrendamiento</h2>
          <ol>
            {PROCESS_STAGES.map(stage => (
              <li key={stage.key}>
                <strong>{stage.label}:</strong> {stage.description}
              </li>
            ))}
          </ol>
        </article>
      </section>
    </div>
  );
}
