import React from 'react';
import './Filters.css'; // Create this file if needed for specific styles

const Filters = ({ filters, onChange, schema }) => {
    const handleChange = (key, value) => {
        onChange({ ...filters, [key]: value });
    };

    return (
        <div className="filters-container" style={{ padding: '15px', border: '1px solid #eee', borderRadius: '8px', marginBottom: '20px' }}>
            <h3>Filtros</h3>
            <div className="filters-grid" style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                {schema.map((field) => (
                    <div key={field.name} className="filter-group">
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>{field.label}</label>

                        {field.type === 'select' && (
                            <select
                                value={filters[field.name] || ''}
                                onChange={(e) => handleChange(field.name, e.target.value)}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            >
                                <option value="">Todos</option>
                                {field.options.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        )}

                        {field.type === 'number' && (
                            <input
                                type="number"
                                value={filters[field.name] || ''}
                                onChange={(e) => handleChange(field.name, e.target.value)}
                                placeholder={field.placeholder}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        )}

                        {field.type === 'text' && (
                            <input
                                type="text"
                                value={filters[field.name] || ''}
                                onChange={(e) => handleChange(field.name, e.target.value)}
                                placeholder={field.placeholder}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        )}

                        {field.type === 'date' && (
                            <input
                                type="date"
                                value={filters[field.name] || ''}
                                onChange={(e) => handleChange(field.name, e.target.value)}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        )}

                        {field.type === 'boolean' && (
                            <select
                                value={filters[field.name] === undefined ? '' : filters[field.name]}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    handleChange(field.name, val === '' ? undefined : val === 'true');
                                }}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            >
                                <option value="">Indiferente</option>
                                <option value="true">Sí</option>
                                <option value="false">No</option>
                            </select>
                        )}

                    </div>
                ))}
            </div>
        </div>
    );
};

export default Filters;
