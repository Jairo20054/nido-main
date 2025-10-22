// Marketplace.jsx - CÓDIGO PREMIUM NIVEL GOOGLE/AMAZON
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
  const headerRef = useRef(null);

  // Función para agregar al carrito con animación
  const addToCart = (product, event) => {
    const buttonRect = event.target.getBoundingClientRect();
    const cartButton = document.querySelector('.cart-button');
    const cartRect = cartButton.getBoundingClientRect();
    
    // Crear elemento de animación
    const animElement = document.createElement('div');
    animElement.className = 'add-to-cart-animation';
    animElement.innerHTML = '🛒';
    animElement.style.cssText = `
      position: fixed;
      left: ${buttonRect.left + buttonRect.width/2}px;
      top: ${buttonRect.top}px;
      font-size: 20px;
      z-index: 10000;
      transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;
    
    document.body.appendChild(animElement);
    
    // Animación
    setTimeout(() => {
      animElement.style.left = `${cartRect.left + cartRect.width/2}px`;
      animElement.style.top = `${cartRect.top + cartRect.height/2}px`;
      animElement.style.transform = 'scale(0.5)';
      animElement.style.opacity = '0';
    }, 50);
    
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
      document.body.removeChild(animElement);
    }, 800);
  };

  // Función para eliminar del carrito
  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  // Categorías principales
  const mainCategories = [
    { 
      id: 'furniture', 
      label: 'Muebles', 
      icon: '🪑',
      subcategories: [
        { id: 'sofas', label: 'Sofás y sillones' },
        { id: 'chairs-tables', label: 'Sillas y mesas' },
        { id: 'beds', label: 'Camas y colchones' },
        { id: 'desks', label: 'Escritorios' }
      ]
    },
    { 
      id: 'decor', 
      label: 'Decoración', 
      icon: '🏺',
      subcategories: [
        { id: 'lamps', label: 'Lámparas' },
        { id: 'art-mirrors', label: 'Cuadros y espejos' },
        { id: 'textiles', label: 'Textiles' },
        { id: 'rugs', label: 'Alfombras' }
      ]
    },
    { 
      id: 'storage', 
      label: 'Almacenamiento', 
      icon: '📦',
      subcategories: [
        { id: 'drawers', label: 'Cajoneras' },
        { id: 'organizers', label: 'Organizadores' },
        { id: 'boxes', label: 'Cajas y contenedores' },
        { id: 'shelves', label: 'Estantes' }
      ]
    },
    { 
      id: 'kitchen', 
      label: 'Cocina', 
      icon: '🍳',
      subcategories: [
        { id: 'appliances', label: 'Electrodomésticos' },
        { id: 'utensils', label: 'Utensilios' },
        { id: 'tableware', label: 'Vajilla' },
        { id: 'organization', label: 'Organización' }
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
      image: '🌟'
    },
    {
      id: 'offers',
      label: 'Oportunidades',
      description: 'Productos con descuentos especiales',
      color: 'linear-gradient(135deg, #FF3B72 0%, #FF6B9C 100%)',
      icon: '💸',
      image: '🔥'
    },
    {
      id: 'inspiration',
      label: 'Inspiración',
      description: 'Ideas para tu hogar',
      color: 'linear-gradient(135deg, #00A651 0%, #00C853 100%)',
      icon: '💡',
      image: '✨'
    }
  ];

  // Productos
  const products = [
    {
      id: 1,
      title: 'Sofá Moderno EKTORP',
      price: '$1.299.000',
      originalPrice: '$1.599.000',
      description: 'Sofá de 3 plazas con funda extraíble y diseño escandinavo',
      tags: ['Nuevo', 'Envío gratis'],
      rating: 4.5,
      reviewCount: 128,
      category: 'furniture',
      subcategory: 'sofas',
      image: '🛋️',
      featured: true
    },
    {
      id: 2,
      title: 'Lámpara de Mesa HEKTAR',
      price: '$89.900',
      description: 'Lámpara de mesa con brazo ajustable y luz LED regulable',
      tags: ['Popular'],
      rating: 4.2,
      reviewCount: 64,
      category: 'decor',
      subcategory: 'lamps',
      image: '💡',
      featured: false
    },
    {
      id: 3,
      title: 'Mesa de Centro LACK',
      price: '$129.900',
      description: 'Mesa de centro blanca resistente con almacenamiento integrado',
      tags: ['Económica'],
      rating: 4.0,
      reviewCount: 89,
      category: 'furniture',
      subcategory: 'chairs-tables',
      image: '🪑',
      featured: true
    },
    {
      id: 4,
      title: 'Set de Ollas 3 piezas',
      price: '$199.900',
      originalPrice: '$249.900',
      description: 'Set de ollas antiadherentes de alta durabilidad',
      tags: ['Oferta', 'Nuevo'],
      rating: 4.7,
      reviewCount: 156,
      category: 'kitchen',
      subcategory: 'utensils',
      image: '🍳',
      featured: false
    },
    {
      id: 5,
      title: 'Estantería KALLAX',
      price: '$299.900',
      description: 'Estantería modular 4x2 espacios con múltiples configuraciones',
      tags: ['Versátil'],
      rating: 4.4,
      reviewCount: 203,
      category: 'storage',
      subcategory: 'shelves',
      image: '📚',
      featured: true
    },
    {
      id: 6,
      title: 'Lámpara de Techo NYMÅNE',
      price: '$159.900',
      description: 'Lámpara de techo LED regulable con diseño moderno',
      tags: ['LED', 'Ecológica'],
      rating: 4.6,
      reviewCount: 92,
      category: 'decor',
      subcategory: 'lamps',
      image: '💡',
      featured: false
    },
    {
      id: 7,
      title: 'Cama King Size MALM',
      price: '$899.900',
      description: 'Cama con cajones incorporados y cabecera ajustable',
      tags: ['Práctica', 'Almacenamiento'],
      rating: 4.3,
      reviewCount: 215,
      category: 'furniture',
      subcategory: 'beds',
      image: '🛏️',
      featured: true
    },
    {
      id: 8,
      title: 'Organizador de Cocina VARIERA',
      price: '$49.900',
      description: 'Organizador para cajones de cocina con divisores ajustables',
      tags: ['Práctico'],
      rating: 4.1,
      reviewCount: 178,
      category: 'kitchen',
      subcategory: 'organization',
      image: '🗃️',
      featured: false
    }
  ];

  // Filtrado y búsqueda de productos
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
    
    // Ordenamiento
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

  return (
    <div className="marketplace-container">
      {/* Header Premium */}
      <header className="marketplace-header" ref={headerRef}>
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
                  placeholder="Buscar productos..."
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
              <button 
                className="cart-button"
                onClick={() => setShowCart(!showCart)}
                aria-label="Ver carrito de compras"
              >
                <span className="cart-icon">🛒</span>
                {cartItems.length > 0 && (
                  <span className="cart-count">{cartItems.length}</span>
                )}
                <span className="cart-text">Carrito</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Carrito de Compras Premium */}
      {showCart && (
        <div className="cart-overlay" onClick={() => setShowCart(false)}>
          <div className="cart-container" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h2>Tu Carrito de Compras</h2>
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
                      <div className="cart-total">
                        <span>Subtotal:</span>
                        <span>${cartTotal.toLocaleString()}</span>
                      </div>
                      <div className="shipping-info">
                        <span>Envío:</span>
                        <span>Gratis</span>
                      </div>
                      <div className="final-total">
                        <span>Total:</span>
                        <span>${cartTotal.toLocaleString()}</span>
                      </div>
                    </div>
                    <button className="checkout-button">
                      Proceder al Pago
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

      {/* Categorías Destacadas - Sin bordes */}
      <section className="featured-categories-section">
        <div className="container">
          <h2 className="section-title">Explora por categorías</h2>
          <div className="featured-grid">
            {featuredCategories.map((category) => (
              <div
                key={category.id}
                className="featured-category-card"
                style={{ background: category.color }}
              >
                <div className="featured-content">
                  <div className="featured-icon">{category.icon}</div>
                  <h3>{category.label}</h3>
                  <p>{category.description}</p>
                  <button className="explore-button">Explorar</button>
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
        {/* Sidebar de Categorías */}
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
              </button>
            </div>

            {mainCategories.map((category) => (
              <div key={category.id} className="nav-section">
                <button 
                  className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-label">{category.label}</span>
                  <span className="expand-icon">
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
                        {subcategory.label}
                      </button>
                    ))}
                  </div>
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
          <section className="quick-filters-section">
            <div className="container">
              <div className="quick-filters">
                <div className="filters-scroll">
                  <button 
                    className={`filter-chip ${selectedCategory === 'all' ? 'active' : ''}`}
                    onClick={() => handleCategorySelect('all')}
                  >
                    <span className="chip-text">Todo</span>
                  </button>
                  {mainCategories.map((category) => (
                    <button
                      key={category.id}
                      className={`filter-chip ${selectedCategory === category.id ? 'active' : ''}`}
                      onClick={() => handleCategorySelect(category.id)}
                    >
                      <span className="chip-icon">{category.icon}</span>
                      <span className="chip-text">{category.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Header de Productos */}
          <section className="products-header">
            <div className="container">
              <div className="products-header-content">
                <div className="products-info">
                  <h2>{getCurrentCategoryLabel()}</h2>
                  <span className="product-count">{filteredProducts.length} productos encontrados</span>
                </div>
                <div className="products-controls">
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
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Grid de Productos */}
          <section className="products-section">
            <div className="container">
              <div className="products-grid">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <div key={product.id} className="product-card">
                      <div className="product-image">
                        <div className="product-emoji">{product.image}</div>
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
                        <button className="wishlist-button">
                          <span className="heart-icon">♥</span>
                        </button>
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
                            {product.rating} ({product.reviewCount} reseñas)
                          </span>
                        </div>

                        <div className="product-pricing">
                          <span className="current-price">{product.price}</span>
                          {product.originalPrice && (
                            <span className="original-price">{product.originalPrice}</span>
                          )}
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
                  ))
                ) : (
                  <div className="no-products">
                    <div className="no-products-icon">🔍</div>
                    <h3>No se encontraron productos</h3>
                    <p>Intenta ajustar tus filtros o términos de búsqueda</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Animación para agregar al carrito */}
      <style jsx>{`
        .add-to-cart-animation {
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default Marketplace;