import React from 'react';
import { motion } from 'framer-motion';
import './Services.css';

const Services = () => {
  const services = [
    {
      id: 1,
      title: 'Limpieza Profesional',
      description: 'Servicio de limpieza profunda para propiedades',
      price: '$50.000',
      image: '/images/cleaning.jpg',
      category: 'Mantenimiento'
    },
    {
      id: 2,
      title: 'Mantenimiento Eléctrico',
      description: 'Reparaciones y mantenimiento eléctrico',
      price: '$30.000',
      image: '/images/electric.jpg',
      category: 'Mantenimiento'
    },
    {
      id: 3,
      title: 'Jardinería',
      description: 'Cuidado y mantenimiento de jardines',
      price: '$25.000',
      image: '/images/gardening.jpg',
      category: 'Mantenimiento'
    },
    {
      id: 4,
      title: 'Fotografía Profesional',
      description: 'Sesiones fotográficas para propiedades',
      price: '$80.000',
      image: '/images/photography.jpg',
      category: 'Marketing'
    }
  ];

  return (
    <motion.div
      className="services-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="services-header">
        <h1>Servicios Adicionales</h1>
        <p>Encuentra servicios profesionales para tu propiedad</p>
      </div>

      <div className="services-grid">
        {services.map((service) => (
          <motion.div
            key={service.id}
            className="service-card"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="service-image">
              <img src={service.image} alt={service.title} />
              <span className="service-category">{service.category}</span>
            </div>
            <div className="service-content">
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <div className="service-footer">
                <span className="service-price">{service.price}</span>
                <button className="service-button">Contactar</button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Services;
