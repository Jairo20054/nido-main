// Marketplace.jsx - COMPONENTE PREMIUM NIVEL AMAZON
import React, { useState, useEffect, useRef } from 'react';
import './Marketplace.css';

const Marketplace = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [expandedSections, setExpandedSections] = useState({});
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef(null);

  // Efecto para header con scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Función mejorada para agregar al carrito con animación
  const addToCart = (product, event) => {
    const buttonRect = event.target.getBoundingClientRect();
    const cartButton = document.querySelector('.cart-button');
    const cartRect = cartButton.getBoundingClientRect();
    
    // Crear elemento de animación mejorado
    const animElement = document.createElement('div');
    animElement.className = 'add-to-cart-animation';
    animElement.innerHTML = product.image;
    animElement.style.cssText = `
      position: fixed;
      left: ${buttonRect.left + buttonRect.width/2}px;
      top: ${buttonRect.top}px;
      font-size: 24px;
      z-index: 10000;
      transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      pointer-events: none;
    `;
    
    document.body.appendChild(animElement);
    
    // Animación mejorada
    requestAnimationFrame(() => {
      animElement.style.left = `${cartRect.left + cartRect.width/2}px`;
      animElement.style.top = `${cartRect.top + cartRect.height/2}px`;
      animElement.style.transform = 'scale(0.3) rotate(360deg)';
      animElement.style.opacity = '0';
    });
    
    // Agregar al carrito después de la animación
    setTimeout(() => {
      setCartItems(prev => {
        const existingItem = prev.find(item => item.id === product.id);
        if (existingItem) {
          return prev.map(item =>
            item.id === product.id 
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prev, { ...product, quantity: 1 }];
      });
      
      // Efecto de notificación
      const notification = document.createElement('div');
      notification.textContent = '¡Producto agregado!';
      notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #0058A3;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10001;
        animation: slideInRight 0.3s ease;
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 2000);
      
      document.body.removeChild(animElement);
    }, 600);
  };

  // Función para eliminar del carrito
  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  // Categorías principales mejoradas
  const mainCategories = [
    { 
      id: 'furniture', 
      label: 'Muebles', 
      icon: '🪑',
      color: '#0058A3',
      subcategories: [
        { id: 'sofas', label: 'Sofás y sillones', count: 24 },
        { id: 'chairs-tables', label: 'Sillas y mesas', count: 18 },
        { id: 'beds', label: 'Camas y colchones', count: 12 },
        { id: 'desks', label: 'Escritorios', count: 15 }
      ]
    },
    { 
      id: 'decor', 
      label: 'Decoración', 
      icon: '🏺',
      color: '#FF6B9C',
      subcategories: [
        { id: 'lamps', label: 'Lámparas', count: 32 },
        { id: 'art-mirrors', label: 'Cuadros y espejos', count: 28 },
        { id: 'textiles', label: 'Textiles', count: 45 },
        { id: 'rugs', label: 'Alfombras', count: 22 }
      ]
    },
    { 
      id: 'storage', 
      label: 'Almacenamiento', 
      icon: '📦',
      color: '#00C853',
      subcategories: [
        { id: 'drawers', label: 'Cajoneras', count: 19 },
        { id: 'organizers', label: 'Organizadores', count: 36 },
        { id: 'boxes', label: 'Cajas y contenedores', count: 41 },
        { id: 'shelves', label: 'Estantes', count: 27 }
      ]
    },
    { 
      id: 'kitchen', 
      label: 'Cocina', 
      icon: '🍳',
      color: '#FF9500',
      subcategories: [
        { id: 'appliances', label: 'Electrodomésticos', count: 16 },
        { id: 'utensils', label: 'Utensilios', count: 58 },
        { id: 'tableware', label: 'Vajilla', count: 34 },
        { id: 'organization', label: 'Organización', count: 29 }
      ]
    },
    { 
      id: 'lighting', 
      label: 'Iluminación', 
      icon: '💡',
      color: '#9C27B0',
      subcategories: [
        { id: 'ceiling', label: 'Techo', count: 23 },
        { id: 'table-lamps', label: 'Mesa', count: 31 },
        { id: 'floor-lamps', label: 'Pie', count: 18 },
        { id: 'outdoor', label: 'Exterior', count: 14 }
      ]
    },
    { 
      id: 'outdoor', 
      label: 'Exterior', 
      icon: '🌿',
      color: '#4CAF50',
      subcategories: [
        { id: 'garden', label: 'Jardín', count: 21 },
        { id: 'patio', label: 'Terraza', count: 17 },
        { id: 'bbq', label: 'Barbacoa', count: 12 },
        { id: 'outdoor-decor', label: 'Decoración', count: 26 }
      ]
    }
  ];

  const featuredCategories = [
    {
      id: 'new',
      label: 'Novedades',
      description: 'Descubre nuestros últimos productos',
      color: 'linear-gradient(135deg, #0058A3 0%, #0077CC 100%)',
      icon: '🆕',
      image: '🌟',
      count: '24 nuevos'
    },
    {
      id: 'offers',
      label: 'Oportunidades',
      description: 'Productos con descuentos especiales',
      color: 'linear-gradient(135deg, #FF3B72 0%, #FF6B9C 100%)',
      icon: '💸',
      image: '🔥',
      count: 'Hasta 50% OFF'
    },
    {
      id: 'inspiration',
      label: 'Inspiración',
      description: 'Ideas para tu hogar',
      color: 'linear-gradient(135deg, #00A651 0%, #00C853 100%)',
      icon: '💡',
      image: '✨',
      count: '12 guías'
    },
    {
      id: 'trending',
      label: 'Tendencias',
      description: 'Lo más popular esta semana',
      color: 'linear-gradient(135deg, #9C27B0 0%, #E91E63 100%)',
      icon: '📈',
      image: '🎯',
      count: '+200 vendidos'
    }
  ];

  // Productos mejorados
  const products = [
    {
      id: 1,
      title: 'Sofá Moderno EKTORP 3 Plazas',
      price: '$1.299.000',
      originalPrice: '$1.599.000',
      description: 'Sofá de 3 plazas con funda extraíble y diseño escandinavo. Perfecto para salas modernas.',
      tags: ['Nuevo', 'Envío gratis', 'Ecológico'],
      rating: 4.5,
      reviewCount: 128,
      category: 'furniture',
      subcategory: 'sofas',
      image: '🛋️',
      featured: true,
      stock: 15,
      delivery: 'Envío gratis',
      colors: ['#2C5530', '#4A4A4A', '#E5E5E5']
    },
    {
      id: 2,
      title: 'Lámpara de Mesa HEKTAR LED',
      price: '$89.900',
      description: 'Lámpara de mesa con brazo ajustable y luz LED regulable. Ideal para lectura.',
      tags: ['Popular', 'LED', 'Ajustable'],
      rating: 4.2,
      reviewCount: 64,
      category: 'lighting',
      subcategory: 'table-lamps',
      image: '💡',
      featured: false,
      stock: 8,
      delivery: '24-48h',
      colors: ['#000000', '#FFFFFF']
    },
    {
      id: 3,
      title: 'Mesa de Centro LACK con Almacenamiento',
      price: '$129.900',
      description: 'Mesa de centro blanca resistente con almacenamiento integrado. Diseño minimalista.',
      tags: ['Económica', 'Práctica', 'Moderno'],
      rating: 4.0,
      reviewCount: 89,
      category: 'furniture',
      subcategory: 'chairs-tables',
      image: '🪑',
      featured: true,
      stock: 25,
      delivery: 'Envío gratis'
    },
    {
      id: 4,
      title: 'Set de Ollas Premium 5 piezas',
      price: '$199.900',
      originalPrice: '$249.900',
      description: 'Set de ollas antiadherentes de alta durabilidad. Incluye tapas de vidrio.',
      tags: ['Oferta', 'Nuevo', 'Premium'],
      rating: 4.7,
      reviewCount: 156,
      category: 'kitchen',
      subcategory: 'utensils',
      image: '🍳',
      featured: false,
      stock: 12,
      delivery: 'Gratis'
    },
    {
      id: 5,
      title: 'Estantería KALLAX Modular 4x2',
      price: '$299.900',
      description: 'Estantería modular 4x2 espacios con múltiples configuraciones. Madera sostenible.',
      tags: ['Versátil', 'Modular', 'Sostenible'],
      rating: 4.4,
      reviewCount: 203,
      category: 'storage',
      subcategory: 'shelves',
      image: '📚',
      featured: true,
      stock: 18,
      delivery: 'Montaje incluido'
    },
    {
      id: 6,
      title: 'Lámpara de Techo NYMÅNE LED',
      price: '$159.900',
      description: 'Lámpara de techo LED regulable con diseño moderno. Bajo consumo energético.',
      tags: ['LED', 'Ecológica', 'Moderno'],
      rating: 4.6,
      reviewCount: 92,
      category: 'lighting',
      subcategory: 'ceiling',
      image: '💡',
      featured: false,
      stock: 6,
      delivery: 'Instalación incluida'
    },
    {
      id: 7,
      title: 'Cama King Size MALM con Cajones',
      price: '$899.900',
      description: 'Cama con cajones incorporados y cabecera ajustable. Espacio de almacenamiento óptimo.',
      tags: ['Práctica', 'Almacenamiento', 'King Size'],
      rating: 4.3,
      reviewCount: 215,
      category: 'furniture',
      subcategory: 'beds',
      image: '🛏️',
      featured: true,
      stock: 7,
      delivery: 'Montaje profesional'
    },
    {
      id: 8,
      title: 'Organizador de Cocina VARIERA',
      price: '$49.900',
      description: 'Organizador para cajones de cocina con divisores ajustables. Maximiza el espacio.',
      tags: ['Práctico', 'Ajustable', 'Organización'],
      rating: 4.1,
      reviewCount: 178,
      category: 'kitchen',
      subcategory: 'organization',
      image: '🗃️',
      featured: false,
      stock: 42,
      delivery: 'Entrega rápida'
    },
    {
      id: 9,
      title: 'Silla de Oficina ERGONOMIC',
      price: '$189.900',
      originalPrice: '$229.900',
      description: 'Silla ergonómica con soporte lumbar y ajuste de altura. Confort prolongado.',
      tags: ['Ergonómica', 'Oferta', 'Confort'],
      rating: 4.8,
      reviewCount: 94,
      category: 'furniture',
      subcategory: 'chairs-tables',
      image: '💺',
      featured: true,
      stock: 11,
      delivery: 'Envío gratis'
    },
    {
      id: 10,
      title: 'Set de Jardín Exterior 3 piezas',
      price: '$459.900',
      description: 'Set de mesa y 2 sillas para exterior. Resistente a la intemperie.',
      tags: ['Exterior', 'Resistente', 'Jardín'],
      rating: 4.5,
      reviewCount: 67,
      category: 'outdoor',
      subcategory: 'patio',
      image: '🌿',
      featured: false,
      stock: 9,
      delivery: 'Envío programado'
    }
  ];

  // Filtrado y búsqueda mejorados
  useEffect(() => {
    let result = products;
    
    // Filtro por categoría
    if (selectedCategory !== 'all') {
      result = result.filter(product => product.category === selectedCategory);
      
      if (selectedSubcategory !== 'all') {
        result = result.filter(product => product.subcategory === selectedSubcategory);
      }
    }
    
    // Filtro por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(product => 
        product.title.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Ordenamiento mejorado
    switch(sortBy) {
      case 'price-low':
        result = [...result].sort((a, b) => parseInt(a.price.replace(/\D/g, '')) - parseInt(b.price.replace(/\D/g, '')));
        break;
      case 'price-high':
        result = [...result].sort((a, b) => parseInt(b.price.replace(/\D/g, '')) - parseInt(a.price.replace(/\D/g, '')));
        break;
      case 'rating':
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      case 'featured':
        result = [...result].sort((a, b) => (b.featured === a.featured) ? 0 : b.featured ? -1 : 1);
        break;
      default:
        break;
    }
    
    setFilteredProducts(result);
  }, [selectedCategory, selectedSubcategory, searchQuery, sortBy]);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory('all');
    setShowMobileMenu(false);
    
    // Auto-expandir categoría seleccionada
    if (categoryId !== 'all') {
      setExpandedSections(prev => ({
        ...prev,
        [categoryId]: true
      }));
    }
  };

  const handleSubcategorySelect = (subcategoryId) => {
    setSelectedSubcategory(subcategoryId);
  };

  const getCurrentCategoryLabel = () => {
    if (selectedCategory === 'all') return 'Todos los productos';
    const category = mainCategories.find(c => c.id === selectedCategory);
    if (selectedSubcategory !== 'all') {
      const subcategory = category.subcategories.find(s => s.id === selectedSubcategory);
      return `${category.label} - ${subcategory.label}`;
    }
    return category.label;
  };

  // Calcular total del carrito
  const cartTotal = cartItems.reduce((total, item) => {
    const price = parseInt(item.price.replace(/\D/g, '')) * item.quantity;
    return total + price;
  }, 0);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Función para formatear precio
  const formatPrice = (price) => {
    return price.replace(/\$/g, '').replace(/\./g, '');
  };

  return (
    <div className="marketplace-container">
      {/* Header Premium Mejorado */}
      <header className={`marketplace-header ${isScrolled ? 'scrolled' : ''}`} ref={headerRef}>
        <div className="header-content">
          <div className="header-main">
            <div className="header-left">
              <button 
                className="mobile-menu-button"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                aria-label="Abrir menú de categorías"
              >
                <span className="menu-icon">☰</span>
              </button>
              <div className="logo-section">
                <h1 className="logo">Marketplace Nido</h1>
                <p className="tagline">Encuentra muebles, decoración e inspiración para tu hogar</p>
              </div>
            </div>
            
            <div className="header-center">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Buscar productos, categorías..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button className="search-button">
                  <span className="search-icon">🔍</span>
                </button>
              </div>
            </div>
            
            <div className="header-right">
              <button className="header-action">
                <span className="action-icon">👤</span>
                <span className="action-text">Mi cuenta</span>
              </button>
              <button className="header-action">
                <span className="action-icon">❤️</span>
                <span className="action-text">Favoritos</span>
              </button>
              <button 
                className="cart-button"
                onClick={() => setShowCart(!showCart)}
                aria-label="Ver carrito de compras"
              >
                <span className="cart-icon">🛒</span>
                {cartItems.length > 0 && (
                  <span className="cart-count">{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                )}
                <span className="cart-text">Carrito</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Carrito de Compras Premium Mejorado */}
      {showCart && (
        <div className="cart-overlay" onClick={() => setShowCart(false)}>
          <div className="cart-container" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h2>Tu Carrito de Compras</h2>
              <div className="cart-stats">
                <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)} productos</span>
              </div>
              <button 
                className="close-cart"
                onClick={() => setShowCart(false)}
                aria-label="Cerrar carrito"
              >
                <span>×</span>
              </button>
            </div>
            
            <div className="cart-content">
              {cartItems.length === 0 ? (
                <div className="empty-cart">
                  <div className="empty-cart-icon">🛒</div>
                  <h3>Tu carrito está vacío</h3>
                  <p>Agrega algunos productos para comenzar</p>
                  <button className="continue-shopping" onClick={() => setShowCart(false)}>
                    Explorar productos
                  </button>
                </div>
              ) : (
                <>
                  <div className="cart-items">
                    {cartItems.map(item => (
                      <div key={item.id} className="cart-item">
                        <div className="cart-item-image">
                          <div className="item-emoji">{item.image}</div>
                        </div>
                        <div className="cart-item-details">
                          <h4>{item.title}</h4>
                          <p className="item-price">{item.price}</p>
                          <div className="item-meta">
                            <span className="item-stock">Stock: {item.stock}</span>
                            <span className="item-delivery">{item.delivery}</span>
                          </div>
                          <div className="quantity-controls">
                            <button 
                              className="quantity-btn"
                              onClick={() => {
                                if (item.quantity > 1) {
                                  setCartItems(prev => 
                                    prev.map(cartItem =>
                                      cartItem.id === item.id 
                                        ? { ...cartItem, quantity: cartItem.quantity - 1 }
                                        : cartItem
                                    )
                                  );
                                }
                              }}
                            >
                              −
                            </button>
                            <span className="quantity">{item.quantity}</span>
                            <button 
                              className="quantity-btn"
                              onClick={() => setCartItems(prev => 
                                prev.map(cartItem =>
                                  cartItem.id === item.id 
                                    ? { ...cartItem, quantity: cartItem.quantity + 1 }
                                    : cartItem
                                )
                              )}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <button 
                          className="remove-item"
                          onClick={() => removeFromCart(item.id)}
                          aria-label="Eliminar producto"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="cart-footer">
                    <div className="cart-summary">
                      <div className="summary-row">
                        <span>Subtotal:</span>
                        <span>${cartTotal.toLocaleString()}</span>
                      </div>
                      <div className="summary-row">
                        <span>Envío:</span>
                        <span className="free-shipping">Gratis</span>
                      </div>
                      <div className="summary-row">
                        <span>Descuento:</span>
                        <span className="discount">-$0</span>
                      </div>
                      <div className="summary-row total">
                        <span>Total:</span>
                        <span>${cartTotal.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="cart-benefits">
                      <div className="benefit">
                        <span className="benefit-icon">🚚</span>
                        <span>Envío gratis en pedidos +$200.000</span>
                      </div>
                      <div className="benefit">
                        <span className="benefit-icon">🔄</span>
                        <span>Devoluciones gratis en 30 días</span>
                      </div>
                    </div>
                    
                    <button className="checkout-button">
                      <span className="checkout-icon">🔒</span>
                      Proceder al Pago Seguro
                    </button>
                    <button className="continue-shopping" onClick={() => setShowCart(false)}>
                      Seguir Comprando
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Categorías Destacadas - Diseño Moderno */}
      <section className="featured-categories-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Explora por categorías</h2>
            <p className="section-subtitle">Descubre nuestra selección premium para tu hogar</p>
          </div>
          <div className="featured-grid">
            {featuredCategories.map((category) => (
              <div
                key={category.id}
                className="featured-category-card"
                style={{ background: category.color }}
              >
                <div className="featured-content">
                  <div className="featured-badge">
                    <span className="featured-icon">{category.icon}</span>
                    <span className="featured-count">{category.count}</span>
                  </div>
                  <h3>{category.label}</h3>
                  <p>{category.description}</p>
                  <button className="explore-button">
                    Explorar
                    <span className="button-arrow">→</span>
                  </button>
                </div>
                <div className="featured-decoration">
                  <span className="decoration-emoji">{category.image}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="marketplace-layout">
        {/* Sidebar de Categorías Mejorado */}
        <aside className={`categories-sidebar ${showMobileMenu ? 'mobile-open' : ''}`}>
          <div className="sidebar-header">
            <h3>Filtrar por Categorías</h3>
            <button 
              className="close-sidebar"
              onClick={() => setShowMobileMenu(false)}
              aria-label="Cerrar menú de categorías"
            >
              <span>×</span>
            </button>
          </div>
          
          <nav className="sidebar-nav">
            <div className="nav-section">
              <button 
                className={`category-item ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => handleCategorySelect('all')}
              >
                <span className="category-icon">🏠</span>
                <span className="category-label">Todos los productos</span>
                <span className="category-count">{products.length}</span>
              </button>
            </div>

            {mainCategories.map((category) => (
              <div key={category.id} className="nav-section">
                <button 
                  className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <span className="category-icon" style={{ color: category.color }}>
                    {category.icon}
                  </span>
                  <span className="category-label">{category.label}</span>
                  <span className="category-count">
                    {category.subcategories.reduce((sum, sub) => sum + sub.count, 0)}
                  </span>
                  <span 
                    className="expand-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSection(category.id);
                    }}
                  >
                    {expandedSections[category.id] ? '−' : '+'}
                  </span>
                </button>
                
                {expandedSections[category.id] && (
                  <div className="subcategories-list">
                    {category.subcategories.map((subcategory) => (
                      <button
                        key={subcategory.id}
                        className={`subcategory-item ${selectedSubcategory === subcategory.id ? 'active' : ''}`}
                        onClick={() => handleSubcategorySelect(subcategory.id)}
                      >
                        <span className="subcategory-label">{subcategory.label}</span>
                        <span className="subcategory-count">{subcategory.count}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Filtros adicionales */}
          <div className="sidebar-filters">
            <h4>Filtros Avanzados</h4>
            <div className="filter-group">
              <label>Precio</label>
              <div className="price-range">
                <span>$50.000</span>
                <span>$2.000.000</span>
              </div>
              <input type="range" className="price-slider" />
            </div>
            <div className="filter-group">
              <label>Calificación</label>
              <div className="rating-filters">
                {[4, 3, 2, 1].map(rating => (
                  <button key={rating} className="rating-filter">
                    {'★'.repeat(rating)}{'☆'.repeat(5 - rating)} y más
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay para móvil */}
        {showMobileMenu && (
          <div className="mobile-overlay" onClick={() => setShowMobileMenu(false)}></div>
        )}

        {/* Contenido Principal Mejorado */}
        <main className="marketplace-main">
          {/* Filtros Rápidos Mejorados */}
          <section className="quick-filters-section">
            <div className="container">
              <div className="quick-filters">
                <div className="filters-header">
                  <h3>Filtros rápidos</h3>
                  <button className="clear-filters">
                    Limpiar filtros
                  </button>
                </div>
                <div className="filters-scroll">
                  <button 
                    className={`filter-chip ${selectedCategory === 'all' ? 'active' : ''}`}
                    onClick={() => handleCategorySelect('all')}
                  >
                    <span className="chip-icon">🏠</span>
                    <span className="chip-text">Todo</span>
                  </button>
                  {mainCategories.map((category) => (
                    <button
                      key={category.id}
                      className={`filter-chip ${selectedCategory === category.id ? 'active' : ''}`}
                      onClick={() => handleCategorySelect(category.id)}
                      style={{ 
                        borderColor: selectedCategory === category.id ? category.color : '',
                        background: selectedCategory === category.id ? category.color + '20' : '' 
                      }}
                    >
                      <span className="chip-icon">{category.icon}</span>
                      <span className="chip-text">{category.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Header de Productos Mejorado */}
          <section className="products-header">
            <div className="container">
              <div className="products-header-content">
                <div className="products-info">
                  <h2>{getCurrentCategoryLabel()}</h2>
                  <div className="products-meta">
                    <span className="product-count">{filteredProducts.length} productos encontrados</span>
                    <span className="products-rating">
                      ⭐ 4.5 • +2.000 reseñas
                    </span>
                  </div>
                </div>
                <div className="products-controls">
                  <div className="view-controls">
                    <button className="view-btn active">🟰</button>
                    <button className="view-btn">⬜</button>
                  </div>
                  <div className="sort-control">
                    <label htmlFor="sort-select">Ordenar por:</label>
                    <select 
                      id="sort-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="sort-select"
                    >
                      <option value="featured">Destacados</option>
                      <option value="price-low">Precio: Menor a Mayor</option>
                      <option value="price-high">Precio: Mayor a Menor</option>
                      <option value="rating">Mejor Valorados</option>
                      <option value="newest">Más recientes</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Grid de Productos Mejorado */}
          <section className="products-section">
            <div className="container">
              {filteredProducts.length > 0 ? (
                <div className="products-grid">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="product-card">
                      <div className="product-image">
                        <div className="product-emoji">{product.image}</div>
                        {product.originalPrice && (
                          <span className="discount-badge">
                            -{Math.round((1 - parseInt(formatPrice(product.price)) / parseInt(formatPrice(product.originalPrice))) * 100)}%
                          </span>
                        )}
                        <div className="product-tags">
                          {product.tags.map((tag, index) => (
                            <span key={index} className="product-tag">{tag}</span>
                          ))}
                        </div>
                        <button className="wishlist-button">
                          <span className="heart-icon">❤️</span>
                        </button>
                        <button className="quick-view-button">
                          👁️ Vista rápida
                        </button>
                      </div>

                      <div className="product-info">
                        <h3 className="product-title">{product.title}</h3>
                        <p className="product-description">{product.description}</p>
                        
                        <div className="product-meta">
                          <div className="product-rating">
                            <div className="stars">
                              {'★'.repeat(Math.floor(product.rating))}
                              {'☆'.repeat(5 - Math.floor(product.rating))}
                            </div>
                            <span className="rating-text">
                              {product.rating} ({product.reviewCount})
                            </span>
                          </div>
                          <div className="product-stock">
                            <span className={`stock-status ${product.stock > 10 ? 'in-stock' : 'low-stock'}`}>
                              {product.stock > 10 ? '✓ En stock' : `! Solo ${product.stock}`}
                            </span>
                          </div>
                        </div>

                        <div className="product-pricing">
                          <span className="current-price">{product.price}</span>
                          {product.originalPrice && (
                            <span className="original-price">{product.originalPrice}</span>
                          )}
                        </div>

                        <div className="product-delivery">
                          <span className="delivery-info">🚚 {product.delivery}</span>
                        </div>

                        <button 
                          className="add-to-cart-button"
                          onClick={(e) => addToCart(product, e)}
                        >
                          <span className="button-text">Agregar al carrito</span>
                          <span className="button-icon">+</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-products">
                  <div className="no-products-icon">🔍</div>
                  <h3>No se encontraron productos</h3>
                  <p>Intenta ajustar tus filtros o términos de búsqueda</p>
                  <button 
                    className="reset-filters"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedSubcategory('all');
                      setSearchQuery('');
                    }}
                  >
                    Restablecer filtros
                  </button>
                </div>
              )}
              
              {/* Paginación */}
              {filteredProducts.length > 0 && (
                <div className="pagination">
                  <button className="pagination-btn disabled">← Anterior</button>
                  <div className="pagination-pages">
                    <button className="page-btn active">1</button>
                    <button className="page-btn">2</button>
                    <button className="page-btn">3</button>
                    <span className="page-dots">...</span>
                    <button className="page-btn">8</button>
                  </div>
                  <button className="pagination-btn">Siguiente →</button>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      {/* Footer Premium */}
      <footer className="marketplace-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Marketplace Nido</h4>
              <p>Tu destino para muebles y decoración de calidad. Transformamos espacios en hogares.</p>
              <div className="social-links">
                <a href="#" aria-label="Facebook">📘</a>
                <a href="#" aria-label="Instagram">📷</a>
                <a href="#" aria-label="Pinterest">📌</a>
                <a href="#" aria-label="Twitter">🐦</a>
              </div>
            </div>
            <div className="footer-section">
              <h5>Comprar</h5>
              <ul>
                <li><a href="#">Todos los productos</a></li>
                <li><a href="#">Novedades</a></li>
                <li><a href="#">Ofertas</a></li>
                <li><a href="#">Productos populares</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h5>Servicio al cliente</h5>
              <ul>
                <li><a href="#">Contacto</a></li>
                <li><a href="#">Envíos y entregas</a></li>
                <li><a href="#">Devoluciones</a></li>
                <li><a href="#">Preguntas frecuentes</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h5>Newsletter</h5>
              <p>Recibe ofertas exclusivas y novedades</p>
              <div className="newsletter-form">
                <input type="email" placeholder="tu@email.com" />
                <button>Suscribirse</button>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Marketplace Nido. Todos los derechos reservados.</p>
            <div className="footer-links">
              <a href="#">Términos y condiciones</a>
              <a href="#">Política de privacidad</a>
              <a href="#">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Marketplace;