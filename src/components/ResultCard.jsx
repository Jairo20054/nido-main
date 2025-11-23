import React from 'react';

const ResultCard = ({ item, type }) => {
    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(price);
    };

    return (
        <div className="result-card" style={{
            border: '1px solid #eee',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s',
            backgroundColor: 'white'
        }}>
            <div className="card-image" style={{ height: '200px', backgroundColor: '#f0f0f0', position: 'relative' }}>
                {item.image_url ? (
                    <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
                        Sin imagen
                    </div>
                )}
                {item.category && (
                    <span style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px'
                    }}>
                        {item.category}
                    </span>
                )}
            </div>

            <div className="card-content" style={{ padding: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <h3 style={{ margin: '0', fontSize: '18px', fontWeight: '600', color: '#333' }}>{item.title}</h3>
                    {item.price && (
                        <span style={{ fontWeight: 'bold', color: '#2ecc71' }}>{formatPrice(item.price)}</span>
                    )}
                    {item.budget && (
                        <span style={{ fontWeight: 'bold', color: '#2ecc71' }}>{formatPrice(item.budget)}</span>
                    )}
                </div>

                <p style={{ color: '#666', fontSize: '14px', margin: '0 0 10px 0', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#888' }}>
                    <span>📍 {item.city || 'Ubicación no especificada'}</span>
                    {type === 'roommates' && item.move_in_date && (
                        <span>📅 {new Date(item.move_in_date).toLocaleDateString()}</span>
                    )}
                </div>

                <button style={{
                    width: '100%',
                    marginTop: '15px',
                    padding: '10px',
                    backgroundColor: '#ff385c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600'
                }}>
                    Ver detalles
                </button>
            </div>
        </div>
    );
};

export default ResultCard;
