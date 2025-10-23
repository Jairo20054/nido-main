import React, { useState, useEffect, useRef } from 'react';
import './Marketplace.css';

const Marketplace = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const headerRef = useRef(null);
  const touchStartX = useRef(null);
  const autoTimer = useRef(null);

  // Función para manejar búsqueda
  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log('Buscando:', searchQuery);
    }
  };

  // Efecto para header con scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Categorías principales
  const categories = [
    { id: 'all', label: 'Todos', icon: '🏠' },
    { id: 'furniture', label: 'Muebles', icon: '🛋️' },
    { id: 'decor', label: 'Decoración', icon: '🖼️' },
    { id: 'kitchen', label: 'Cocina', icon: '🍳' },
    { id: 'bedroom', label: 'Dormitorio', icon: '🛏️' },
    { id: 'bathroom', label: 'Baño', icon: '🚿' },
    { id: 'lighting', label: 'Iluminación', icon: '💡' },
    { id: 'storage', label: 'Almacenamiento', icon: '📦' },
    { id: 'garden', label: 'Jardín', icon: '🌿' },
    { id: 'cleaning', label: 'Limpieza', icon: '🧹' }
  ];

  // Slides del carrusel
  const carouselSlides = [
    {
      id: 'hot-sale',
      title: 'LIQUIDACIÓN HOTSALE',
      highlights: ['🎯 HASTA 50% OFF', '💳 HASTA 12 CUOTAS SIN INTERÉS', '🚚 ENVÍO GRATIS'],
      description: 'Aprovecha los mejores descuentos en muebles y decoración para tu hogar. Stock limitado.',
      ctaText: 'Ver ofertas',
      ctaHref: '#',
      image: '🛋️',
      imageBadge: 'Oferta Especial',
      bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: 'furniture-sale',
      title: 'MUEBLES EN OFERTA',
      highlights: ['🛏️ 30% OFF EN COLCHONES', '⭐ HASTA 18 CUOTAS', '🎁 BASE CAMA DE REGALO'],
      description: 'Dormí mejor con nuestra promoción exclusiva en dormitorio. Calidad premium garantizada.',
      ctaText: 'Comprar ahora',
      ctaHref: '#',
      image: '🛏️',
      imageBadge: '-30%',
      bgGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      id: 'home-decor',
      title: 'DECORACIÓN PARA TU HOGAR',
      highlights: ['🍳 40% EN UTENSILIOS', '⚡ ENVÍO EN 24H', '🔧 INSTALACIÓN GRATIS'],
      description: 'Equipa tu cocina con los mejores productos a precios increíbles. Calidad profesional.',
      ctaText: 'Explorar',
      ctaHref: '#',
      image: '🍳',
      imageBadge: '-40%',
      bgGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    }
  ];

  // Funcionalidad del carrusel
  const totalSlides = carouselSlides.length;

  const goToSlide = (index) => {
    setCurrentSlide(((index % totalSlides) + totalSlides) % totalSlides);
  };

  const nextSlide = () => {
    goToSlide(currentSlide + 1);
  };

  const prevSlide = () => {
    goToSlide(currentSlide - 1);
  };

  // Auto-play del carrusel
  useEffect(() => {
    if (isPaused) return;
    
    autoTimer.current = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(autoTimer.current);
  }, [currentSlide, isPaused]);

  // Eventos táctiles para el carrusel
  const onPointerDown = (e) => {
    touchStartX.current = e.clientX ?? e.touches?.[0]?.clientX;
  };

  const onPointerUp = (e) => {
    if (touchStartX.current == null) return;
    const endX = e.clientX ?? e.changedTouches?.[0]?.clientX;
    const dx = endX - touchStartX.current;
    const threshold = 60;
    if (dx > threshold) prevSlide();
    else if (dx < -threshold) nextSlide();
    touchStartX.current = null;
  };

  // Productos del marketplace
  const products = [
    {
      id: 1,
      title: 'Sofá Moderno 3 Plazas Gris',
      price: 1299000,
      originalPrice: 1599000,
      discount: 19,
      category: 'furniture',
      image: '🛋️',
      rating: 4.5,
      reviews: 128,
      installments: 12,
      freeShipping: true,
      tags: ['Nuevo', 'Envío gratis'],
      featured: true
    },
    {
      id: 2,
      title: 'Set de Ollas Antiadherentes 5 Piezas',
      price: 199900,
      originalPrice: 249900,
      discount: 20,
      category: 'kitchen',
      image: '🍳',
      rating: 4.7,
      reviews: 156,
      installments: 6,
      freeShipping: true,
      tags: ['Oferta', 'Premium']
    },
    {
      id: 3,
      title: 'Lámpara de Techo LED Moderna',
      price: 89900,
      category: 'lighting',
      image: '💡',
      rating: 4.2,
      reviews: 64,
      installments: 3,
      freeShipping: false,
      tags: ['LED', 'Moderno']
    },
    {
      id: 4,
      title: 'Juego de Sábanas King Size Algodón',
      price: 75900,
      category: 'bedroom',
      image: '🛏️',
      rating: 4.0,
      reviews: 89,
      installments: 3,
      freeShipping: true,
      tags: ['Algodón', 'Suave']
    },
    {
      id: 5,
      title: 'Estantería Modular 4x2 Espacios',
      price: 299900,
      category: 'storage',
      image: '📚',
      rating: 4.4,
      reviews: 203,
      installments: 12,
      freeShipping: true,
      tags: ['Modular', 'Madera'],
      featured: true
    },
    {
      id: 6,
      title: 'Cortinas Blackout 2x2 metros',
      price: 45900,
      category: 'decor',
      image: '🪟',
      rating: 4.6,
      reviews: 92,
      installments: 3,
      freeShipping: false,
      tags: ['Oscurecimiento', 'Térmicas']
    },
    {
      id: 7,
      title: 'Mesa de Centro Vidrio Templado',
      price: 129900,
      category: 'furniture',
      image: '🪑',
      rating: 4.3,
      reviews: 215,
      installments: 6,
      freeShipping: true,
      tags: ['Moderno', 'Resistente']
    },
    {
      id: 8,
      title: 'Organizador de Baño Multiusos',
      price: 34900,
      category: 'bathroom',
      image: '🚿',
      rating: 4.1,
      reviews: 178,
      installments: 3,
      freeShipping: false,
      tags: ['Práctico', 'Ajustable']
    },
    {
      id: 9,
      title: 'Silla de Oficina Ergonómica',
      price: 189900,
      originalPrice: 229900,
      discount: 17,
      category: 'furniture',
      image: '💺',
      rating: 4.8,
      reviews: 94,
      installments: 12,
      freeShipping: true,
      tags: ['Ergonómica', 'Confort'],
      featured: true
    },
    {
      id: 10,
      title: 'Set de Jardín 3 Piezas Exterior',
      price: 459900,
      category: 'garden',
      image: '🌿',
      rating: 4.5,
      reviews: 67,
      installments: 12,
      freeShipping: true,
      tags: ['Exterior', 'Resistente']
    },
    {
      id: 11,
      title: 'Aspiradora Robot Inteligente',
      price: 399900,
      originalPrice: 499900,
      discount: 20,
      category: 'cleaning',
      image: '🤖',
      rating: 4.6,
      reviews: 234,
      installments: 12,
      freeShipping: true,
      tags: ['Robot', 'Automática'],
      featured: true
    },
    {
      id: 12,
      title: 'Set de Utensilios de Cocina 15 Piezas',
      price: 89900,
      category: 'kitchen',
      image: '🔪',
      rating: 4.3,
      reviews: 156,
      installments: 3,
      freeShipping: true,
      tags: ['Completo', 'Acero']
    }
  ];

  // Filtrado de productos
  useEffect(() => {
    let result = products;
    
    if (selectedCategory !== 'all') {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(product => 
        product.title.toLowerCase().includes(query) ||
        product.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    setFilteredProducts(result);
  }, [selectedCategory, searchQuery]);

  // Agregar al carrito
  const addToCart = (product) => {
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
  };

  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Renderizar estrellas de rating
  const renderStars = (rating) => {
    return (
      <div className="stars">
        {'★'.repeat(Math.floor(rating))}
        {'☆'.repeat(5 - Math.floor(rating))}
      </div>
    );
  };

  return (
    <div className="marketplace">
      {/* Header */}
      <header className={`marketplace-header ${isScrolled ? 'scrolled' : ''}`} ref={headerRef}>
        <div className="header-container">
          <div className="header-left">
            <div className="logo">
        
            </div>
          </div>

          {/* Barra de búsqueda premium */}
          <div className="header-center">
            <div className="search-container">
              <div className="search-bar">
                <div className="search-input-container">
                  <input
                    type="text"
                    placeholder="Buscar productos, marcas y más..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="search-input"
                  />
                  {searchQuery && (
                    <button 
                      className="clear-search"
                      onClick={() => setSearchQuery('')}
                    >
                      ×
                    </button>
                  )}
                </div>
                <button 
                  className="search-button"
                  onClick={handleSearch}
                >
                  <span className="search-icon">🔍</span>
                </button>
              </div>
              
              {/* Sugerencias de búsqueda */}
              {searchQuery && (
                <div className="search-suggestions">
                  <div className="suggestion-category">
                    <span className="category-title">Sugerencias</span>
                    <div className="suggestion-list">
                      <button className="suggestion-item">
                        <span className="suggestion-icon">🔍</span>
                        {searchQuery} en muebles
                      </button>
                      <button className="suggestion-item">
                        <span className="suggestion-icon">🔍</span>
                        {searchQuery} en decoración
                      </button>
                      <button className="suggestion-item">
                        <span className="suggestion-icon">🔍</span>
                        {searchQuery} en cocina
                      </button>
                    </div>
                  </div>
                  
                  <div className="suggestion-category">
                    <span className="category-title">Búsquedas populares</span>
                    <div className="suggestion-list">
                      <button className="suggestion-item">
                        <span className="suggestion-icon">🔥</span>
                        Sofá moderno
                      </button>
                      <button className="suggestion-item">
                        <span className="suggestion-icon">🔥</span>
                        Mesa de centro
                      </button>
                      <button className="suggestion-item">
                        <span className="suggestion-icon">🔥</span>
                        Lámpara LED
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="header-right">
            <button 
              className="cart-button"
              onClick={() => setShowCart(!showCart)}
            >
              <span className="cart-icon">🛒</span>
              {cartItems.length > 0 && (
                <span className="cart-count">{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
              )}
              <span className="cart-text">Carrito</span>
            </button>
          </div>
        </div>

        {/* Barra de categorías */}
        <div className="categories-bar">
          <div className="categories-scroll">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-label">{category.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Carrusel de Ofertas Mejorado */}
      <section 
        className="offers-carousel"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="carousel-container">
          <div 
            className="carousel-track"
            onMouseDown={onPointerDown}
            onMouseUp={onPointerUp}
            onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
            onTouchEnd={onPointerUp}
          >
            {carouselSlides.map((slide, index) => (
              <div 
                key={slide.id}
                className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
              >
                <div className="slide-content" style={{ background: slide.bgGradient }}>
                  <div className="slide-text">
                    <h2>{slide.title}</h2>
                    <div className="slide-highlights">
                      {slide.highlights.map((highlight, i) => (
                        <span key={i} className="highlight-item">{highlight}</span>
                      ))}
                    </div>
                    <p className="slide-description">{slide.description}</p>
                    <button className="slide-cta">{slide.ctaText}</button>
                  </div>
                  <div className="slide-image">
                    <div className="image-placeholder">{slide.image}</div>
                    <div className="image-badge">{slide.imageBadge}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Controles del carrusel */}
          <button className="carousel-control prev" onClick={prevSlide}>
            ‹
          </button>
          <button className="carousel-control next" onClick={nextSlide}>
            ›
          </button>
          
          {/* Indicadores */}
          <div className="carousel-indicators">
            {carouselSlides.map((_, index) => (
              <button 
                key={index}
                className={`indicator ${currentSlide === index ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              ></button>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de medios de pago */}
      <section className="payment-methods">
        <div className="payment-container">
          <h3>Medios de pago</h3>
          <p>Paga tus compras de forma rápida y segura</p>
          <div className="payment-icons">
            <span>💳</span>
            <span>📱</span>
            <span>💰</span>
            <span>🏦</span>
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <main className="marketplace-content">
        {/* Sección de productos baratos */}
        <section className="products-section">
          <div className="section-header">
            <h3>Menos de $40.000</h3>
            <p>Descubre productos con nuevos precios</p>
          </div>
          <div className="products-grid">
            {products.filter(product => product.price < 40000).map(product => (
              <div key={product.id} className="product-card">
                <div className="card-image">
                  <div className="image-placeholder">{product.image}</div>
                  {product.discount && (
                    <div className="discount-badge">-{product.discount}%</div>
                  )}
                  {product.freeShipping && (
                    <div className="shipping-badge">Envío gratis</div>
                  )}
                </div>
                
                <div className="card-content">
                  <h4 className="card-title">{product.title}</h4>
                  
                  <div className="card-price">
                    <span className="current-price">{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                      <span className="original-price">{formatPrice(product.originalPrice)}</span>
                    )}
                  </div>
                  
                  <div className="card-installments">
                    en {product.installments} cuotas de {formatPrice(product.price / product.installments)}
                  </div>
                  
                  <div className="card-rating">
                    {renderStars(product.rating)}
                    <span>({product.reviews})</span>
                  </div>

                  <button 
                    className="add-to-cart-btn"
                    onClick={() => addToCart(product)}
                  >
                    Agregar al carrito
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sección de más vendidos */}
        <section className="products-section">
          <div className="section-header">
            <h3>Más vendidos</h3>
            <p>Explora los productos que son tendencia</p>
          </div>
          <div className="products-grid">
            {products.sort((a, b) => b.reviews - a.reviews).slice(0, 6).map(product => (
              <div key={product.id} className="product-card">
                <div className="card-image">
                  <div className="image-placeholder">{product.image}</div>
                  {product.discount && (
                    <div className="discount-badge">-{product.discount}%</div>
                  )}
                  {product.freeShipping && (
                    <div className="shipping-badge">Envío gratis</div>
                  )}
                </div>
                
                <div className="card-content">
                  <h4 className="card-title">{product.title}</h4>
                  
                  <div className="card-price">
                    <span className="current-price">{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                      <span className="original-price">{formatPrice(product.originalPrice)}</span>
                    )}
                  </div>
                  
                  <div className="card-installments">
                    en {product.installments} cuotas de {formatPrice(product.price / product.installments)}
                  </div>
                  
                  <div className="card-rating">
                    {renderStars(product.rating)}
                    <span>({product.reviews})</span>
                  </div>

                  <button 
                    className="add-to-cart-btn"
                    onClick={() => addToCart(product)}
                  >
                    Agregar al carrito
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sección de todos los productos */}
        <section className="products-section">
          <div className="section-header">
            <h3>Todos los productos</h3>
            <p>{filteredProducts.length} productos encontrados</p>
          </div>
          <div className="products-grid">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                <div className="card-image">
                  <div className="image-placeholder">{product.image}</div>
                  {product.discount && (
                    <div className="discount-badge">-{product.discount}%</div>
                  )}
                  {product.freeShipping && (
                    <div className="shipping-badge">Envío gratis</div>
                  )}
                </div>
                
                <div className="card-content">
                  <h4 className="card-title">{product.title}</h4>
                  
                  <div className="card-price">
                    <span className="current-price">{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                      <span className="original-price">{formatPrice(product.originalPrice)}</span>
                    )}
                  </div>
                  
                  <div className="card-installments">
                    en {product.installments} cuotas de {formatPrice(product.price / product.installments)}
                  </div>
                  
                  <div className="card-rating">
                    {renderStars(product.rating)}
                    <span>({product.reviews})</span>
                  </div>

                  <button 
                    className="add-to-cart-btn"
                    onClick={() => addToCart(product)}
                  >
                    Agregar al carrito
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Carrito de compras */}
      {showCart && (
        <div className="cart-overlay" onClick={() => setShowCart(false)}>
          <div className="cart-container" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h2>Tu Carrito</h2>
              <button 
                className="close-cart"
                onClick={() => setShowCart(false)}
              >
                ×
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
                          <p className="item-price">{formatPrice(item.price)}</p>
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
                                } else {
                                  setCartItems(prev => prev.filter(cartItem => cartItem.id !== item.id));
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
                          onClick={() => setCartItems(prev => prev.filter(cartItem => cartItem.id !== item.id))}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="cart-footer">
                    <div className="cart-summary">
                      <div className="summary-row total">
                        <span>Total:</span>
                        <span>{formatPrice(cartItems.reduce((total, item) => total + (item.price * item.quantity), 0))}</span>
                      </div>
                    </div>
                    
                    <button className="checkout-button">
                      Finalizar Compra
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="marketplace-footer">
        <div className="footer-container">
          <div className="footer-section">
            <h4>HogarExpress</h4>
            <p>Tu marketplace de confianza para productos del hogar</p>
          </div>
          
          <div className="footer-section">
            <h4>Categorías</h4>
            <ul>
              {categories.slice(1).map(category => (
                <li key={category.id}><a href="#">{category.label}</a></li>
              ))}
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Ayuda</h4>
            <ul>
              <li><a href="#">Cómo comprar</a></li>
              <li><a href="#">Envíos y entregas</a></li>
              <li><a href="#">Devoluciones</a></li>
              <li><a href="#">Preguntas frecuentes</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Contacto</h4>
            <ul>
              <li><a href="#">Atención al cliente</a></li>
              <li><a href="#">Vender en HogarExpress</a></li>
              <li><a href="#">Trabaja con nosotros</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© 2024 HogarExpress. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Marketplace;