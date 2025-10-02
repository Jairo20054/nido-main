import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './Marketplace.css';

const Marketplace = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Todo', icon: '🛍️' },
    { id: 'furniture', label: 'Muebles', icon: '🪑' },
    { id: 'decor', label: 'Decoración', icon: '🏺' },
    { id: 'electronics', label: 'Electrónicos', icon: '📱' },
    { id: 'kitchen', label: 'Cocina', icon: '🍳' },
    { id: 'garden', label: 'Jardín', icon: '🌱' }
  ];

  const products = [
    {
      id: 1,
      title: 'Sofá Moderno',
      price: '$1.200.000',
      image: '/images/sofa.jpg',
      category: 'furniture',
      location: 'Bogotá',
      condition: 'Nuevo'
    },
    {
      id: 2,
      title: 'Lámpara de Mesa',
      price: '$150.000',
      image: '/images/lamp.jpg',
      category: 'decor',
      location: 'Medellín',
      condition: 'Usado'
    },
    {
      id: 3,
      title: 'Robot Aspiradora',
      price: '$800.000',
      image: '/images/vacuum.jpg',
      category: 'electronics',
      location: 'Cali',
      condition: 'Nuevo'
    },
    {
      id: 4,
      title: 'Set de Ollas',
      price: '$300.000',
      image: '/images/pots.jpg',
      category: 'kitchen',
      location: 'Barranquilla',
      condition: 'Nuevo'
    },
    {
      id: 5,
      title: 'Mesa de Jardín',
      price: '$450.000',
      image: '/images/garden-table.jpg',
      category: 'garden',
      location: 'Cartagena',
      condition: 'Usado'
    },
    {
      id: 6,
      title: 'Cuadro Decorativo',
      price: '$80.000',
      image: '/images/painting.jpg',
      category: 'decor',
      location: 'Bogotá',
      condition: 'Nuevo'
    }
  ];

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(product => product.category === selectedCategory);

  return (
    <motion.div
      className="marketplace-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="marketplace-header">
        <h1>Marketplace</h1>
        <p>Compra y vende artículos para el hogar</p>
      </div>

      {/* Categories */}
      <div className="categories-section">
        <div className="categories-grid">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-label">{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {filteredProducts.map((product) => (
          <motion.div
            key={product.id}
            className="product-card"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="product-image">
              <img src={product.image} alt={product.title} />
              <span className={`condition-badge ${product.condition === 'Nuevo' ? 'new' : 'used'}`}>
                {product.condition}
              </span>
            </div>
            <div className="product-content">
              <h3>{product.title}</h3>
              <p className="product-location">📍 {product.location}</p>
              <div className="product-footer">
                <span className="product-price">{product.price}</span>
                <button className="contact-button">Contactar</button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Marketplace;
