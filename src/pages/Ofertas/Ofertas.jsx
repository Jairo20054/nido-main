import React from 'react';
import './Ofertas.css';

const Ofertas = () => {
  // Datos de ejemplo para las ofertas
  const ofertas = [
    {
      id: 1,
      titulo: 'Descuento en Hospedaje Premium',
      descripcion: 'Aprovecha un 30% de descuento en nuestras propiedades premium durante el fin de semana.',
      precioOriginal: '$200',
      precioDescuento: '$140',
      descuento: '30%',
      imagen: 'Imagen de propiedad premium'
    },
    {
      id: 2,
      titulo: 'Oferta de Último Minuto',
      descripcion: 'Reserva hoy y obtén hasta un 25% de descuento en destinos seleccionados.',
      precioOriginal: '$150',
      precioDescuento: '$112.50',
      descuento: '25%',
      imagen: 'Imagen de destino turístico'
    },
    {
      id: 3,
      titulo: 'Paquete Familiar Especial',
      descripcion: 'Descuento especial para familias: 20% off en estancias de 3 noches o más.',
      precioOriginal: '$300',
      precioDescuento: '$240',
      descuento: '20%',
      imagen: 'Imagen de familia en propiedad'
    },
    {
      id: 4,
      titulo: 'Oferta de Temporada',
      descripcion: 'Disfruta de precios reducidos en propiedades de temporada con cancelación gratuita.',
      precioOriginal: '$180',
      precioDescuento: '$144',
      descuento: '20%',
      imagen: 'Imagen de propiedad estacional'
    },
    {
      id: 5,
      titulo: 'Descuento para Miembros',
      descripcion: 'Únete a nuestro programa de fidelidad y obtén 15% de descuento inmediato.',
      precioOriginal: '$250',
      precioDescuento: '$212.50',
      descuento: '15%',
      imagen: 'Imagen de membresía'
    },
    {
      id: 6,
      titulo: 'Oferta Flash',
      descripcion: 'Oferta limitada por tiempo: 40% de descuento en propiedades seleccionadas.',
      precioOriginal: '$220',
      precioDescuento: '$132',
      descuento: '40%',
      imagen: 'Imagen de oferta flash'
    }
  ];

  return (
    <div className="ofertas-container">
      <div className="ofertas-header">
        <h1 className="ofertas-title">Ofertas Especiales</h1>
        <p className="ofertas-subtitle">
          Descubre nuestras ofertas exclusivas y promociones especiales para hacer tu viaje inolvidable.
        </p>
      </div>

      <div className="ofertas-grid">
        {ofertas.map((oferta) => (
          <div key={oferta.id} className="oferta-card">
            <div className="oferta-image">
              {oferta.imagen}
              <span className="oferta-discount">-{oferta.descuento}</span>
            </div>
            <div className="oferta-content">
              <h3 className="oferta-title">{oferta.titulo}</h3>
              <p className="oferta-description">{oferta.descripcion}</p>
              <div className="oferta-price">
                <span className="oferta-price-original">{oferta.precioOriginal}</span>
                <span className="oferta-price-discounted">{oferta.precioDescuento}</span>
              </div>
              <button className="oferta-button">Reservar Ahora</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ofertas;
