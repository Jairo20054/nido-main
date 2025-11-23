import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import SearchBar from '../components/SearchBar';
import Filters from '../components/Filters/Filters';
import ResultCard from '../components/ResultCard';
import Header from '../components/Header/Header';

const Servicios = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        page: 1,
        limit: 12,
        sort: 'recent'
    });
    const [meta, setMeta] = useState({});

    const filterSchema = [
        {
            name: 'category',
            label: 'Categoría',
            type: 'select',
            options: [
                { value: 'plomeria', label: 'Plomería' },
                { value: 'electricidad', label: 'Electricidad' },
                { value: 'limpieza', label: 'Limpieza' },
                { value: 'carpinteria', label: 'Carpintería' },
                { value: 'jardineria', label: 'Jardinería' },
                { value: 'otros', label: 'Otros' }
            ]
        },
        { name: 'city', label: 'Ciudad', type: 'text', placeholder: 'Ej: Bogotá' },
        { name: 'priceMin', label: 'Precio Mín', type: 'number', placeholder: '0' },
        { name: 'priceMax', label: 'Precio Máx', type: 'number', placeholder: 'Max' },
        {
            name: 'sort',
            label: 'Ordenar por',
            type: 'select',
            options: [
                { value: 'recent', label: 'Más recientes' },
                { value: 'price_asc', label: 'Precio: Menor a Mayor' },
                { value: 'price_desc', label: 'Precio: Mayor a Menor' }
            ]
        }
    ];

    const fetchServices = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Filter out empty values
            const params = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== '' && v !== undefined && v !== null)
            );

            const response = await api.get('/services', { params });
            setItems(response.data.data);
            setMeta(response.data.meta);
        } catch (err) {
            setError('Error al cargar los servicios. Por favor intente nuevamente.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const handleSearch = (term) => {
        setFilters(prev => ({ ...prev, q: term, page: 1 }));
    };

    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    return (
        <div className="page-container">
            <Header />
            <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '20px', color: '#333' }}>Servicios para el Hogar</h1>

                <SearchBar onSearch={handleSearch} placeholder="¿Qué servicio buscas?" />

                <Filters filters={filters} onChange={handleFilterChange} schema={filterSchema} />

                {error && <div style={{ padding: '20px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>Cargando...</div>
                ) : (
                    <>
                        {items.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No se encontraron resultados.</div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                                {items.map(item => (
                                    <ResultCard key={item.id} item={item} type="services" />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {meta.totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px', gap: '10px' }}>
                                <button
                                    disabled={meta.page === 1}
                                    onClick={() => handlePageChange(meta.page - 1)}
                                    style={{ padding: '8px 16px', cursor: 'pointer', disabled: meta.page === 1 }}
                                >
                                    Anterior
                                </button>
                                <span style={{ alignSelf: 'center' }}>Página {meta.page} de {meta.totalPages}</span>
                                <button
                                    disabled={meta.page === meta.totalPages}
                                    onClick={() => handlePageChange(meta.page + 1)}
                                    style={{ padding: '8px 16px', cursor: 'pointer', disabled: meta.page === meta.totalPages }}
                                >
                                    Siguiente
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default Servicios;
