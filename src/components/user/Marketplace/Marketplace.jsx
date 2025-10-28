import React, { useState, useEffect, useRef } from 'react';
import './Marketplace.css';

const Marketplace = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const headerRef = useRef(null);
  const autoTimer = useRef(null);
  const touchStartX = useRef(null);

  // Categorías principales
  const categories = [
    { id: 'all', label: 'Inicio', icon: '🏠' },
    { id: 'furniture', label: 'Muebles', icon: '🛋️' },
    { id: 'decor', label: 'Decoración', icon: '🎨' },
    { id: 'kitchen', label: 'Cocina', icon: '🍳' },
    { id: 'bedroom', label: 'Dormitorio', icon: '🛏️' },
    { id: 'bathroom', label: 'Baño', icon: '🚿' },
    { id: 'lighting', label: 'Iluminación', icon: '💡' },
    { id: 'storage', label: 'Organización', icon: '📦' },
    { id: 'garden', label: 'Jardín', icon: '🌿' },
    { id: 'cleaning', label: 'Limpieza', icon: '🧹' },
    { id: 'electronics', label: 'Electro', icon: '📱' },
    { id: 'tools', label: 'Herramientas', icon: '🛠️' }
  ];

  // Slides del carrusel
  const carouselSlides = [
    {
      id: 'hot-sale',
      title: 'LIQUIDACIÓN HOTSALE',
      subtitle: 'Hasta 50% OFF + 12 Cuotas',
      highlights: ['🔥 Ofertas exclusivas', '🚚 Envío gratis', '💳 Hasta 12 cuotas'],
      description: 'Aprovecha los mejores descuentos en muebles y decoración para tu hogar. Stock limitado.',
      ctaText: 'Ver ofertas',
      image: '🛋️',
      badge: '-50%',
      bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: 'furniture-week',
      title: 'SEMANA DE MUEBLES',
      subtitle: '30% OFF + Cuotas sin interés',
      highlights: ['🛏️ Dormitorio completo', '🛋️ Sofás y sillones', '📦 Envío en 48h'],
      description: 'Renueva tu hogar con los mejores muebles a precios increíbles. Calidad premium garantizada.',
      ctaText: 'Comprar ahora',
      image: '🛏️',
      badge: '-30%',
      bgGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      id: 'home-decor',
      title: 'DECORACIÓN PREMIUM',
      subtitle: 'Hasta 40% OFF',
      highlights: ['🎨 Diseño exclusivo', '⚡ Envío express', '🎁 Instalación gratis'],
      description: 'Transforma tus espacios con nuestra colección premium de decoración para el hogar.',
      ctaText: 'Descubrir',
      image: '🏺',
      badge: '-40%',
      bgGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    }
  ];

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
      featured: true,
      stock: 15
    },
    {
      id: 2,
      title: 'Set Ollas Antiadherentes 5 Piezas',
      price: 199900,
      originalPrice: 249900,
      discount: 20,
      category: 'kitchen',
      image: '🍳',
      rating: 4.7,
      reviews: 156,
      installments: 6,
      freeShipping: true,
      tags: ['Oferta', 'Premium'],
      stock: 8
    },
    {
      id: 3,
      title: 'Lámpara Techo LED Moderna',
      price: 89900,
      category: 'lighting',
      image: '💡',
      rating: 4.2,
      reviews: 64,
      installments: 3,
      freeShipping: false,
      tags: ['LED', 'Moderno'],
      stock: 12
    },
    {
      id: 4,
      title: 'Sábanas King Size Algodón Premium',
      price: 75900,
      category: 'bedroom',
      image: '🛏️',
      rating: 4.0,
      reviews: 89,
      installments: 3,
      freeShipping: true,
      tags: ['Algodón', 'Suave'],
      stock: 25
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
      featured: true,
      stock: 7
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
      tags: ['Oscurecimiento', 'Térmicas'],
      stock: 18
    },
    {
      id: 7,
      title: 'Mesa Centro Vidrio Templado',
      price: 129900,
      category: 'furniture',
      image: '🪑',
      rating: 4.3,
      reviews: 215,
      installments: 6,
      freeShipping: true,
      tags: ['Moderno', 'Resistente'],
      stock: 10
    },
    {
      id: 8,
      title: 'Organizador Baño Multiusos',
      price: 34900,
      category: 'bathroom',
      image: '🚿',
      rating: 4.1,
      reviews: 178,
      installments: 3,
      freeShipping: false,
      tags: ['Práctico', 'Ajustable'],
      stock: 22
    },
    {
      id: 9,
      title: 'Silla Oficina Ergonómica',
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
      featured: true,
      stock: 5
    },
    {
      id: 10,
      title: 'Set Jardín 3 Piezas Exterior',
      price: 459900,
      category: 'garden',
      image: '🌿',
      rating: 4.5,
      reviews: 67,
      installments: 12,
      freeShipping: true,
      tags: ['Exterior', 'Resistente'],
      stock: 9
    },
    {
      id: 11,
      title: 'Aspiradora Robot Inteligente',
      price: 399900,
      originalPrice: 499900,
      discount: 20,
      category: 'electronics',
      image: '🤖',
      rating: 4.6,
      reviews: 234,
      installments: 12,
      freeShipping: true,
      tags: ['Robot', 'Automática'],
      featured: true,
      stock: 11
    },
    {
      id: 12,
      title: 'Set Utensilios Cocina 15 Piezas',
      price: 89900,
      category: 'kitchen',
      image: '🔪',
      rating: 4.3,
      reviews: 156,
      installments: 3,
      freeShipping: true,
      tags: ['Completo', 'Acero'],
      stock: 30
    }
  ];



  // Filtrado de productos
  useEffect(() => {
    let result = products;

    // Filtrar por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(product =>
        product.title.toLowerCase().includes(query) ||
        product.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredProducts(result);
  }, [searchQuery]);

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
    // Mostrar feedback visual
    console.log(`Producto "${product.title}" agregado al carrito`);
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
        {[...Array(5)].map((_, index) => (
          <span 
            key={index} 
            className={index < Math.floor(rating) ? 'star filled' : 'star'}
          >
            {index < Math.floor(rating) ? '★' : '☆'}
          </span>
        ))}
        <span className="rating-value">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Manejar búsqueda
  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsLoading(true);
      console.log('Buscando:', searchQuery);
      // Simular búsqueda asíncrona
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
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

  // Funciones del carrusel
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto-play del carrusel
  useEffect(() => {
    if (!isPaused) {
      autoTimer.current = setInterval(nextSlide, 6000);
    } else {
      clearInterval(autoTimer.current);
    }
    return () => clearInterval(autoTimer.current);
  }, [isPaused, currentSlide]);

  // Funciones de touch/drag
  const onPointerDown = (e) => {
    touchStartX.current = e.clientX;
  };

  const onPointerUp = (e) => {
    if (!touchStartX.current) return;

    const touchEndX = e.clientX || e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) { // Umbral mínimo para swipe
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }

    touchStartX.current = null;
  };

  return (
    <div className="marketplace">
      {/* Header */}
      <header className={`marketplace-header ${isScrolled ? 'scrolled' : ''}`} ref={headerRef}>
        <div className="header-top">
          <div className="header-container">
            <div className="header-center">
              <div className="search-container">
                <div className="search-bar">
                  <input
                    type="text"
                    placeholder="Buscar productos, marcas y más..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="search-input"
                  />
                  <button className="search-button" onClick={handleSearch}>
                    <span className="search-icon">🔍</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="header-right">
              <button
                className="cart-button"
                onClick={() => setShowCart(!showCart)}
              >
                <span className="cart-icon">🛒</span>
                {cartItems.length > 0 && (
                  <span className="cart-count">
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
                <span className="cart-text">Carrito</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Banner de envío gratis */}
      <div className="shipping-banner">
        <div className="shipping-container">
          <span className="shipping-text">🚚 ¡Envío gratis en compras superiores a $100.000!</span>
        </div>
      </div>

      {/* Carrusel de Ofertas */}
      <section 
        className="offers-carousel"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="carousel-container">
          <div 
            className="carousel-track"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            onMouseDown={onPointerDown}
            onMouseUp={onPointerUp}
            onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
            onTouchEnd={onPointerUp}
          >
            {carouselSlides.map((slide, index) => (
              <div 
                key={slide.id}
                className="carousel-slide"
                style={{ background: slide.bgGradient }}
              >
                <div className="slide-content">
                  <div className="slide-text">
                    <span className="slide-badge">{slide.badge}</span>
                    <h2>{slide.title}</h2>
                    <h3>{slide.subtitle}</h3>
                    <div className="slide-highlights">
                      {slide.highlights.map((highlight, i) => (
                        <span key={i} className="highlight-item">
                          {highlight}
                        </span>
                      ))}
                    </div>
                    <p className="slide-description">{slide.description}</p>
                    <button className="slide-cta">{slide.ctaText}</button>
                  </div>
                  <div className="slide-image">
                    <div className="image-placeholder">{slide.image}</div>
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
              />
            ))}
          </div>
        </div>
      </section>

      {/* Sección de productos destacados */}
      <main className="marketplace-content">
        {/* Ofertas flash */}
        <section className="products-section flash-sales">
          <div className="section-header">
            <div className="section-title">
              <span className="title-icon">⚡</span>
              <h2>Ofertas Flash</h2>
              <span className="time-remaining">Termina en 02:15:30</span>
            </div>
            <button className="see-all-btn">Ver todas</button>
          </div>
          <div className="products-grid">
            {products.filter(p => p.discount >= 15).slice(0, 6).map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={addToCart}
                formatPrice={formatPrice}
                renderStars={renderStars}
              />
            ))}
          </div>
        </section>

        {/* Productos baratos */}
        <section className="products-section">
          <div className="section-header">
            <h3>Menos de $100.000</h3>
            <p>Perfectos para renovar tu hogar</p>
          </div>
          <div className="products-grid">
            {products.filter(product => product.price < 100000).map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={addToCart}
                formatPrice={formatPrice}
                renderStars={renderStars}
              />
            ))}
          </div>
        </section>

        {/* Más vendidos */}
        <section className="products-section">
          <div className="section-header">
            <h3>Los más vendidos</h3>
            <p>Productos favoritos de nuestra comunidad</p>
          </div>
          <div className="products-grid">
            {products.sort((a, b) => b.reviews - a.reviews).slice(0, 8).map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={addToCart}
                formatPrice={formatPrice}
                renderStars={renderStars}
              />
            ))}
          </div>
        </section>

        {/* Todos los productos */}
        <section className="products-section">
          <div className="section-header">
            <h3>Explorar productos</h3>
            <p>{filteredProducts.length} productos encontrados</p>
          </div>
          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Buscando productos...</p>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={addToCart}
                    formatPrice={formatPrice}
                    renderStars={renderStars}
                  />
                ))
              ) : (
                <div className="no-results">
                  <div className="no-results-icon">🔍</div>
                  <h4>No se encontraron productos</h4>
                  <p>Intenta con otros términos de búsqueda</p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Carrito de compras */}
      <Cart 
        showCart={showCart}
        setShowCart={setShowCart}
        cartItems={cartItems}
        setCartItems={setCartItems}
        formatPrice={formatPrice}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

// Componente de tarjeta de producto
const ProductCard = ({ product, onAddToCart, formatPrice, renderStars }) => {
  const [imageLoaded, setImageLoaded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="card-image">
        <div className="image-container">
          {imageLoaded ? (
            <div className="image-placeholder">{product.image}</div>
          ) : (
            <div className="image-loading">Cargando...</div>
          )}
        </div>

        {product.discount && (
          <div className="discount-badge">-{product.discount}%</div>
        )}

        {product.freeShipping && (
          <div className="shipping-badge">Envío gratis</div>
        )}

        {product.featured && (
          <div className="featured-badge">Destacado</div>
        )}

        <button
          className="quick-view-btn"
          onClick={() => console.log('Vista rápida:', product.id)}
          style={{
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateY(0)' : 'translateY(10px)'
          }}
        >
          👁️
        </button>
      </div>

      <div className="card-content">
        <h4 className="card-title" title={product.title}>{product.title}</h4>

        <div className="card-price">
          <span className="current-price">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="original-price">{formatPrice(product.originalPrice)}</span>
          )}
        </div>

        <div className="card-installments">
          {product.installments > 1 ? (
            <>en {product.installments}x {formatPrice(product.price / product.installments)}</>
          ) : (
            <span className="single-payment">Pago único</span>
          )}
        </div>

        <div className="card-rating">
          {renderStars(product.rating)}
          <span className="reviews-count">({product.reviews})</span>
        </div>

        <div className="card-stock">
          {product.stock > 10 ? (
            <span className="stock-available">✓ Stock disponible</span>
          ) : product.stock > 0 ? (
            <span className="stock-low">⚠️ Últimas {product.stock} unidades</span>
          ) : (
            <span className="stock-out">✗ Sin stock</span>
          )}
        </div>

        <button
          className={`add-to-cart-btn ${product.stock === 0 ? 'disabled' : ''}`}
          onClick={() => product.stock > 0 && onAddToCart(product)}
          disabled={product.stock === 0}
        >
          {product.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
        </button>
      </div>
    </div>
  );
};

// Componente del carrito
const Cart = ({ showCart, setShowCart, cartItems, setCartItems, formatPrice }) => {
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) {
      setCartItems(prev => prev.filter(item => item.id !== id));
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  if (!showCart) return null;

  return (
    <div className="cart-overlay" onClick={() => setShowCart(false)}>
      <div className="cart-container" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2>
            Tu Carrito 
            {itemsCount > 0 && <span className="cart-items-count">({itemsCount})</span>}
          </h2>
          <button className="close-cart" onClick={() => setShowCart(false)}>
            ×
          </button>
        </div>
        
        <div className="cart-content">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <h3>Tu carrito está vacío</h3>
              <p>Agrega algunos productos para comenzar</p>
              <button 
                className="continue-shopping"
                onClick={() => setShowCart(false)}
              >
                Seguir comprando
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
                      <p className="item-price">{formatPrice(item.price)}</p>
                      <div className="quantity-controls">
                        <button 
                          className="quantity-btn"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          −
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button 
                          className="quantity-btn"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="cart-item-total">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                    <button 
                      className="remove-item"
                      onClick={() => updateQuantity(item.id, 0)}
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
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Envío:</span>
                    <span className="free-shipping">Gratis</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total:</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
                
                <button className="checkout-button" onClick={() => console.log('Procediendo al checkout')}>
                  Finalizar Compra
                </button>
                
                <div className="payment-methods">
                  <span>💳 Aceptamos todas las tarjetas</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente del footer
const Footer = () => {
  return (
    <footer className="marketplace-footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-section">
            <div className="footer-logo">
              <span className="logo-icon">🏠</span>
              <span className="logo-text">HogarExpress</span>
            </div>
            <p>Tu marketplace de confianza para productos del hogar. Calidad, precio y servicio en un solo lugar.</p>
            <div className="social-links">
              <a href="#" className="social-link">📘</a>
              <a href="#" className="social-link">📷</a>
              <a href="#" className="social-link">🐦</a>
            </div>
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
            <h4>Mi cuenta</h4>
            <ul>
              <li><a href="#">Mis pedidos</a></li>
              <li><a href="#">Mis favoritos</a></li>
              <li><a href="#">Direcciones</a></li>
              <li><a href="#">Cupones</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contacto</h4>
            <ul>
              <li><a href="#">Atención al cliente</a></li>
              <li><a href="#">Vender en HogarExpress</a></li>
              <li><a href="#">Trabaja con nosotros</a></li>
              <li><a href="#">WhatsApp: +57 300 123 4567</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>© 2024 HogarExpress. Todos los derechos reservados.</p>
            <div className="footer-links">
              <a href="#">Términos y condiciones</a>
              <a href="#">Política de privacidad</a>
              <a href="#">Defensa del consumidor</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Marketplace;