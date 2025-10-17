import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './Marketplace.css';

const Marketplace = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedSections, setExpandedSections] = useState({});
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Categorías principales estilo IKEA
  const mainCategories = [
    { 
      id: 'furniture', 
      label: 'Muebles', 
      icon: '🪑',
      description: 'Muebles que te acompañan todos los días',
      subcategories: [
        'Sofás y sillones', 'Sillas y mesas', 'Camas y colchones', 'Escritorios y sillas',
        'Armarios y roperos', 'Estanterías', 'Mesas de centro'
      ]
    },
    { 
      id: 'decor', 
      label: 'Decoración', 
      icon: '🏺',
      description: 'Decora tu espacio con estilo',
      subcategories: [
        'Lámparas de techo', 'Lámparas de mesa', 'Lámparas de pie', 'Cuadros y espejos',
        'Textiles', 'Alfombras', 'Plantas y macetas'
      ]
    },
    { 
      id: 'storage', 
      label: 'Almacenamiento', 
      icon: '📦',
      description: 'Organiza y optimiza tu espacio',
      subcategories: [
        'Cajoneras', 'Organizadores', 'Cajas y contenedores', 'Estantes',
        'Percheros', 'Muebles de baño'
      ]
    },
    { 
      id: 'kitchen', 
      label: 'Cocina', 
      icon: '🍳',
      description: 'Todo para tu cocina',
      subcategories: [
        'Electrodomésticos', 'Utensilios de cocina', 'Vajilla', 'Cubiertos',
        'Organización de cocina', 'Menaje'
      ]
    },
    { 
      id: 'lighting', 
      label: 'Iluminación', 
      icon: '💡',
      description: 'Encuentra una luz perfecta para cada ocasión',
      subcategories: [
        'Lámparas de techo', 'Lámparas de mesa', 'Lámparas de pie', 'Lámparas de pared',
        'Iluminación LED', 'Lámparas infantiles'
      ]
    },
    { 
      id: 'textiles', 
      label: 'Textiles', 
      icon: '🛏️',
      description: 'Confort para tu hogar',
      subcategories: [
        'Sábanas y fundas', 'Edredones y mantas', 'Cortinas', 'Toallas',
        'Alfombras', 'Cojines'
      ]
    }
  ];

  const featuredCategories = [
    {
      id: 'new',
      label: 'Novedades',
      description: 'Descubre nuestros últimos productos',
      image: '/images/new-arrivals.jpg',
      color: '#0058A3'
    },
    {
      id: 'offers',
      label: 'Oportunidades',
      description: 'Productos con descuentos especiales',
      image: '/images/special-offers.jpg',
      color: '#FF3B72'
    },
    {
      id: 'inspiration',
      label: 'Inspiración',
      description: 'Ideas para tu hogar',
      image: '/images/inspiration.jpg',
      color: '#00A651'
    }
  ];

  const products = [
    {
      id: 1,
      title: 'Sofá Moderno EKTORP',
      price: '$1.299.000',
      originalPrice: '$1.599.000',
      image: '/images/sofa-ektorp.jpg',
      category: 'furniture',
      subcategory: 'Sofás y sillones',
      description: 'Sofá de 3 plazas con funda extraíble',
      tags: ['Nuevo', 'Envío gratis'],
      rating: 4.5,
      reviewCount: 128
    },
    {
      id: 2,
      title: 'Lámpara de Mesa HEKTAR',
      price: '$89.900',
      image: '/images/lamp-hektar.jpg',
      category: 'lighting',
      subcategory: 'Lámparas de mesa',
      description: 'Lámpara de mesa con brazo ajustable',
      tags: ['Popular'],
      rating: 4.2,
      reviewCount: 64
    },
    {
      id: 3,
      title: 'Mesa de Centro LACK',
      price: '$129.900',
      image: '/images/coffee-table-lack.jpg',
      category: 'furniture',
      subcategory: 'Mesas de centro',
      description: 'Mesa de centro blanca resistente',
      tags: ['Económica'],
      rating: 4.0,
      reviewCount: 89
    },
    {
      id: 4,
      title: 'Set de Ollas 3 piezas',
      price: '$199.900',
      originalPrice: '$249.900',
      image: '/images/pots-set.jpg',
      category: 'kitchen',
      subcategory: 'Utensilios de cocina',
      description: 'Set de ollas antiadherentes',
      tags: ['Oferta', 'Nuevo'],
      rating: 4.7,
      reviewCount: 156
    },
    {
      id: 5,
      title: 'Estantería KALLAX',
      price: '$299.900',
      image: '/images/shelf-kallax.jpg',
      category: 'storage',
      subcategory: 'Estanterías',
      description: 'Estantería modular 4x2 espacios',
      tags: ['Versátil'],
      rating: 4.4,
      reviewCount: 203
    },
    {
      id: 6,
      title: 'Lámpara de Techo NYMÅNE',
      price: '$159.900',
      image: '/images/ceiling-lamp.jpg',
      category: 'lighting',
      subcategory: 'Lámparas de techo',
      description: 'Lámpara de techo LED regulable',
      tags: ['LED', 'Ecológica'],
      rating: 4.6,
      reviewCount: 92
    },
    {
      id: 7,
      title: 'Silla de Escritorio MARKUS',
      price: '$599.900',
      image: '/images/office-chair.jpg',
      category: 'furniture',
      subcategory: 'Sillas y mesas',
      description: 'Silla ergonómica para oficina',
      tags: ['Ergonómica'],
      rating: 4.3,
      reviewCount: 187
    },
    {
      id: 8,
      title: 'Juego de Sábanas MALOU',
      price: '$79.900',
      image: '/images/bed-sheets.jpg',
      category: 'textiles',
      subcategory: 'Sábanas y fundas',
      description: 'Juego de sábanas de algodón 100%',
      tags: ['Algodón'],
      rating: 4.1,
      reviewCount: 134
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
      {/* Header Principal */}
      <header className="marketplace-header">
        <div className="header-content">
          <h1>Marketplace Nido</h1>
          <p>Encuentra muebles, decoración e inspiración para tu hogar</p>
        </div>
        <div className="header-actions">
          <button className="mobile-menu-button" onClick={() => setShowMobileMenu(!showMobileMenu)}>
            <span>☰</span>
          </button>
          <button className="filter-button">
            <span>Filtros</span>
            <span>▼</span>
          </button>
          <button className="sort-button">
            <span>Ordenar por: Destacados</span>
            <span>▼</span>
          </button>
        </div>
      </header>

      {/* Categorías Destacadas */}
      <section className="featured-categories">
        <h2>Explora por categorías</h2>
        <div className="featured-grid">
          {featuredCategories.map((category) => (
            <motion.div
              key={category.id}
              className="featured-category-card"
              whileHover={{ scale: 1.02 }}
              style={{ backgroundColor: category.color }}
            >
              <div className="featured-content">
                <h3>{category.label}</h3>
                <p>{category.description}</p>
                <button className="explore-button">Explorar</button>
              </div>
              <div className="featured-image">
                <div className="image-placeholder"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="marketplace-layout">
        {/* Sidebar de Categorías */}
        <aside className={`categories-sidebar ${showMobileMenu ? 'mobile-open' : ''}`}>
          <div className="sidebar-header">
            <h3>Categorías</h3>
            <button className="close-sidebar" onClick={() => setShowMobileMenu(false)}>×</button>
          </div>
          <nav className="sidebar-nav">
            <div className="nav-section">
              <h3>Productos</h3>
              <ul>
                <li><a href="#espacios">Espacios del hogar</a></li>
                <li><a href="#ofertas">Oportunidades</a></li>
                <li><a href="#novedades">Novedades</a></li>
                <li><a href="#inspiracion">Inspiración y planificación</a></li>
                <li><a href="#mas">Más</a></li>
              </ul>
            </div>

            {mainCategories.map((category) => (
              <div key={category.id} className="nav-section">
                <button 
                  className="section-header"
                  onClick={() => toggleSection(category.id)}
                >
                  <span>{category.label}</span>
                  <span className="expand-icon">
                    {expandedSections[category.id] ? '−' : '+'}
                  </span>
                </button>
                {expandedSections[category.id] && (
                  <motion.ul
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    {category.subcategories.map((subcategory, index) => (
                      <li key={index}>
                        <a href={`#${subcategory.toLowerCase().replace(/\s+/g, '-')}`}>
                          {subcategory}
                        </a>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Overlay para móvil */}
        {showMobileMenu && (
          <div className="mobile-overlay" onClick={() => setShowMobileMenu(false)}></div>
        )}

        {/* Contenido Principal */}
        <main className="marketplace-main">
          {/* Filtros Rápidos */}
          <section className="quick-filters">
            <div className="filters-scroll">
              <button 
                className={`filter-chip ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                Todo
              </button>
              {mainCategories.map((category) => (
                <button
                  key={category.id}
                  className={`filter-chip ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <span className="chip-icon">{category.icon}</span>
                  {category.label}
                </button>
              ))}
            </div>
          </section>

          {/* Grid de Productos */}
          <section className="products-section">
            <div className="section-header">
              <h2>
                {selectedCategory === 'all' 
                  ? 'Todos los productos' 
                  : mainCategories.find(c => c.id === selectedCategory)?.label
                }
              </h2>
              <span className="product-count">{filteredProducts.length} productos</span>
            </div>

            <div className="products-grid">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  className="product-card"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="product-image">
                    <div className="image-placeholder"></div>
                    {product.originalPrice && (
                      <span className="discount-badge">
                        -{Math.round((1 - parseInt(product.price.replace(/\D/g, '')) / parseInt(product.originalPrice.replace(/\D/g, ''))) * 100)}%
                      </span>
                    )}
                    <div className="product-tags">
                      {product.tags.map((tag, index) => (
                        <span key={index} className="product-tag">{tag}</span>
                      ))}
                    </div>
                    <button className="wishlist-button">♥</button>
                  </div>

                  <div className="product-info">
                    <h3 className="product-title">{product.title}</h3>
                    <p className="product-description">{product.description}</p>
                    
                    <div className="product-rating">
                      <div className="stars">
                        {'★'.repeat(Math.floor(product.rating))}
                        {'☆'.repeat(5 - Math.floor(product.rating))}
                      </div>
                      <span className="rating-text">
                        {product.rating} ({product.reviewCount})
                      </span>
                    </div>

                    <div className="product-pricing">
                      <span className="current-price">{product.price}</span>
                      {product.originalPrice && (
                        <span className="original-price">{product.originalPrice}</span>
                      )}
                    </div>

                    <button className="add-to-cart-button">
                      <span>Agregar al carrito</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </motion.div>
  );
};

export default Marketplace;