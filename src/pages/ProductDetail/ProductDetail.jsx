import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  // Mock product data - in real app this would come from API
  const mockProducts = [
    {
      id: 1,
      title: 'Sofá cama moderno',
      price: 450000,
      category: 'Muebles',
      location: 'Cal',
      image: '/images/sofa.jpg',
      images: ['🛋️', '🛋️', '🛋️', '🛋️'],
      description: 'Sofá cama en excelente estado, color gris, poco uso',
      seller: {
        name: 'Juan Pérez',
        rating: 4.5,
        sales: 1250,
        location: 'Cal, Colombia'
      },
      rating: 4.5,
      reviews: 128,
      installments: 12,
      freeShipping: true,
      tags: ['Nuevo', 'Envío gratis'],
      featured: true,
      stock: 15,
      specifications: {
        'Material': 'Tela premium',
        'Color': 'Gris',
        'Plazas': '3',
        'Dimensiones': '220cm x 90cm x 85cm',
        'Peso': '45kg',
        'Garantía': '2 años'
      }
    },
    {
      id: 2,
      title: 'Juego de comedor para 6 personas',
      price: 780000,
      category: 'Muebles',
      location: 'Cal',
      image: '/images/comedor.jpg',
      images: ['🍽️', '🍽️', '🍽️', '🍽️'],
      description: 'Mesa con 6 sillas, madera de roble, perfecto estado',
      seller: {
        name: 'María García',
        rating: 4.8,
        sales: 890,
        location: 'Cal, Colombia'
      },
      rating: 4.8,
      reviews: 156,
      installments: 6,
      freeShipping: true,
      tags: ['Oferta', 'Premium'],
      stock: 8,
      specifications: {
        'Material': 'Madera de roble',
        'Piezas': '7 (mesa + 6 sillas)',
        'Color': 'Marrón',
        'Dimensiones mesa': '160cm x 90cm x 75cm',
        'Peso': '85kg',
        'Garantía': '3 años'
      }
    },
    {
      id: 3,
      title: 'Lavadora Samsung 15kg',
      price: 1200000,
      category: 'Electrodomésticos',
      location: 'Cal',
      image: '/images/lavadora.jpg',
      images: ['🧺', '🧺', '🧺', '🧺'],
      description: 'Lavadora semi-automática, capacidad 15kg, eficiencia energética A+',
      seller: {
        name: 'Carlos Rodríguez',
        rating: 4.2,
        sales: 650,
        location: 'Cal, Colombia'
      },
      rating: 4.2,
      reviews: 89,
      installments: 12,
      freeShipping: true,
      tags: ['Nuevo', 'Envío gratis'],
      stock: 5,
      specifications: {
        'Capacidad': '15kg',
        'Tipo': 'Semi-automática',
        'Eficiencia energética': 'A+',
        'Programas': '8 programas',
        'Dimensiones': '85cm x 60cm x 50cm',
        'Peso': '35kg',
        'Garantía': '2 años'
      }
    },
    {
      id: 4,
      title: 'Lámpara de pie moderna',
      price: 85000,
      category: 'Iluminación',
      location: 'Cal',
      image: '/images/lampara.jpg',
      images: ['💡', '💡', '💡', '💡'],
      description: 'Lámpara de pie con diseño escandinavo, color negro mate',
      seller: {
        name: 'Ana López',
        rating: 4.7,
        sales: 420,
        location: 'Cal, Colombia'
      },
      rating: 4.7,
      reviews: 67,
      installments: 3,
      freeShipping: false,
      tags: ['Nuevo'],
      stock: 12,
      specifications: {
        'Estilo': 'Escandinavo',
        'Color': 'Negro mate',
        'Altura': '180cm',
        'Base': 'Metal',
        'Bombilla': 'LED incluida',
        'Potencia': '60W',
        'Garantía': '1 año'
      }
    },
    {
      id: 5,
      title: 'Juego de ollas de acero inoxidable',
      price: 150000,
      category: 'Cocina',
      location: 'Cal',
      image: '/images/ollas.jpg',
      images: ['🍳', '🍳', '🍳', '🍳'],
      description: 'Set de 7 piezas, marca reconocida, como nuevas',
      seller: {
        name: 'Roberto Silva',
        rating: 4.6,
        sales: 380,
        location: 'Cal, Colombia'
      },
      rating: 4.6,
      reviews: 94,
      installments: 6,
      freeShipping: true,
      tags: ['Como nuevo', 'Envío gratis'],
      stock: 7,
      specifications: {
        'Material': 'Acero inoxidable',
        'Piezas': '7',
        'Diámetros': '16cm, 18cm, 20cm, 22cm, 24cm',
        'Mango': 'Ergonómico',
        'Compatible': 'Todos los tipos de cocina',
        'Peso': '3.2kg',
        'Garantía': '2 años'
      }
    },
    {
      id: 6,
      title: 'Cortinas blackout',
      price: 120000,
      category: 'Textiles',
      location: 'Cal',
      image: '/images/cortinas.jpg',
      images: ['🪟', '🪟', '🪟', '🪟'],
      description: 'Cortinas térmicas y blackout, color beige, medidas 2.5x2m',
      seller: {
        name: 'Laura Martínez',
        rating: 4.3,
        sales: 290,
        location: 'Cal, Colombia'
      },
      rating: 4.3,
      reviews: 52,
      installments: 4,
      freeShipping: false,
      tags: ['Nuevo'],
      stock: 20,
      specifications: {
        'Tipo': 'Blackout térmico',
        'Color': 'Beige',
        'Medidas': '2.5m x 2m',
        'Material': 'Poliéster',
        'Tratamiento': 'Antiarrugas',
        'Instalación': 'Con riel incluido',
        'Garantía': '6 meses'
      }
    },
    {
      id: 7,
      title: 'Mesa de centro con almacenamiento',
      price: 230000,
      category: 'Muebles',
      location: 'Cal',
      image: '/images/mesa-centro.jpg',
      images: ['🪑', '🪑', '🪑', '🪑'],
      description: 'Mesa de centro moderna con cajones, color nogal',
      seller: {
        name: 'Diego Fernández',
        rating: 4.4,
        sales: 180,
        location: 'Cal, Colombia'
      },
      rating: 4.4,
      reviews: 38,
      installments: 8,
      freeShipping: true,
      tags: ['Buen estado', 'Envío gratis'],
      stock: 3,
      specifications: {
        'Material': 'Madera MDF',
        'Color': 'Nogal',
        'Dimensiones': '120cm x 60cm x 45cm',
        'Almacenamiento': '2 cajones + 1 puerta',
        'Peso': '28kg',
        'Ensamblaje': 'Requiere armado',
        'Garantía': '1 año'
      }
    },
    {
      id: 8,
      title: 'Organizador de closet',
      price: 75000,
      category: 'Organización',
      location: 'Cal',
      image: '/images/organizador.jpg',
      images: ['🗄️', '🗄️', '🗄️', '🗄️'],
      description: 'Sistema modular para organizar clóset, fácil de instalar',
      seller: {
        name: 'Sofía Ramírez',
        rating: 4.9,
        sales: 95,
        location: 'Cal, Colombia'
      },
      rating: 4.9,
      reviews: 23,
      installments: 3,
      freeShipping: false,
      tags: ['Nuevo'],
      stock: 15,
      specifications: {
        'Tipo': 'Modular',
        'Material': 'Plástico ABS',
        'Piezas': '12 módulos',
        'Colores': 'Blanco y transparente',
        'Instalación': 'Sin herramientas',
        'Capacidad': 'Hasta 50kg',
        'Garantía': '1 año'
      }
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchProduct = async () => {
      setLoading(true);
      // In real app: const response = await fetch(`/api/products/${id}`);
      setTimeout(() => {
        const foundProduct = mockProducts.find(p => p.id === parseInt(id));
        if (foundProduct) {
          setProduct(foundProduct);
        }
        setLoading(false);
      }, 500);
    };

    fetchProduct();
  }, [id]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

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

  const handleAddToCart = () => {
    // In real app, this would add to cart context/state
    console.log(`Agregando ${quantity} unidades de ${product.title} al carrito`);
    // You could show a success message or navigate to cart
    alert(`¡${quantity} unidad(es) de "${product.title}" agregada(s) al carrito!`);
  };

  const handleBuyNow = () => {
    // In real app, this would go to checkout
    console.log(`Comprando ${quantity} unidades de ${product.title}`);
    alert(`Redirigiendo al checkout para comprar "${product.title}"...`);
  };

  const handleContactSeller = () => {
    // In real app, this would open a chat modal or redirect to messaging
    alert(`Iniciando conversación con ${product.seller.name} sobre "${product.title}"`);
  };

  const handleShare = () => {
    // In real app, this would open a share modal
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: product.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="loading-spinner"></div>
        <p>Cargando producto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-error">
        <h2>Producto no encontrado</h2>
        <p>El producto que buscas no existe o ha sido removido.</p>
        <button onClick={() => navigate('/marketplace')} className="back-button">
          Volver al Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="product-detail">
      <div className="product-container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <span onClick={() => navigate('/')} className="breadcrumb-link">Inicio</span>
          <span className="breadcrumb-separator">›</span>
          <span onClick={() => navigate('/marketplace')} className="breadcrumb-link">Marketplace</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">{product.title}</span>
        </nav>

        <div className="product-main">
          {/* Product Images */}
          <div className="product-gallery">
            <div className="main-image">
              <div className="image-container">
                <div className="product-image">{product.images[selectedImage]}</div>
              </div>
            </div>
            <div className="thumbnail-gallery">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <div className="thumbnail-image">{image}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="product-info">
            <div className="product-header">
              <h1 className="product-title">{product.title}</h1>
              <div className="product-meta">
                <div className="rating-section">
                  {renderStars(product.rating)}
                  <span className="reviews-count">({product.reviews} reseñas)</span>
                </div>
                {product.featured && <span className="featured-badge">Destacado</span>}
              </div>
            </div>

            <div className="product-price">
              <span className="current-price">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="original-price">{formatPrice(product.originalPrice)}</span>
              )}
              {product.discount && (
                <span className="discount-badge">-{product.discount}%</span>
              )}
            </div>

            <div className="product-installments">
              {product.installments > 1 ? (
                <>en {product.installments}x {formatPrice(product.price / product.installments)}</>
              ) : (
                <span className="single-payment">Pago único</span>
              )}
            </div>

            <div className="product-tags">
              {product.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>

            <div className="product-stock">
              {product.stock > 10 ? (
                <span className="stock-available">✓ Stock disponible</span>
              ) : product.stock > 0 ? (
                <span className="stock-low">⚠️ Últimas {product.stock} unidades</span>
              ) : (
                <span className="stock-out">✗ Sin stock</span>
              )}
            </div>

            <div className="quantity-selector">
              <label>Cantidad:</label>
              <div className="quantity-controls">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>

            <div className="product-actions">
              <button
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                🛒 Agregar al carrito
              </button>
              <button
                className="buy-now-btn"
                onClick={handleBuyNow}
                disabled={product.stock === 0}
              >
                ⚡ Comprar ahora
              </button>
              <button
                className="contact-seller-btn"
                onClick={handleContactSeller}
              >
                💬 Contactar vendedor
              </button>
              <button
                className="share-btn"
                onClick={handleShare}
              >
                📤 Compartir
              </button>
            </div>

            <div className="product-benefits">
              {product.freeShipping && (
                <div className="benefit">
                  <span className="benefit-icon">🚚</span>
                  <span>Envío gratis</span>
                </div>
              )}
              <div className="benefit">
                <span className="benefit-icon">↩️</span>
                <span>Devolución gratuita</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">🛡️</span>
                <span>Garantía incluida</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="product-details">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Descripción
            </button>
            <button
              className={`tab ${activeTab === 'specifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('specifications')}
            >
              Especificaciones
            </button>
            <button
              className={`tab ${activeTab === 'seller' ? 'active' : ''}`}
              onClick={() => setActiveTab('seller')}
            >
              Vendedor
            </button>
            <button
              className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reseñas
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'description' && (
              <div className="description-content">
                <p>{product.description}</p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="specifications-content">
                <table className="specs-table">
                  <tbody>
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <tr key={key}>
                        <td className="spec-label">{key}</td>
                        <td className="spec-value">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'seller' && (
              <div className="seller-content">
                <div className="seller-info">
                  <div className="seller-avatar">
                    <span>🏪</span>
                  </div>
                  <div className="seller-details">
                    <h3>{product.seller.name}</h3>
                    <div className="seller-rating">
                      {renderStars(product.seller.rating)}
                      <span>({product.seller.sales} ventas)</span>
                    </div>
                    <p className="seller-location">📍 {product.seller.location}</p>
                  </div>
                </div>
                <div className="seller-stats">
                  <div className="stat">
                    <span className="stat-value">{product.seller.sales}</span>
                    <span className="stat-label">Ventas</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{product.seller.rating}</span>
                    <span className="stat-label">Calificación</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="reviews-content">
                <div className="reviews-summary">
                  <div className="overall-rating">
                    <span className="rating-number">{product.rating}</span>
                    <div className="rating-stars">{renderStars(product.rating)}</div>
                    <span className="reviews-count">{product.reviews} reseñas</span>
                  </div>
                </div>
                <div className="reviews-list">
                  {/* Mock reviews - in real app these would come from API */}
                  <div className="review">
                    <div className="review-header">
                      <span className="reviewer-name">María González</span>
                      <div className="review-rating">{renderStars(5)}</div>
                    </div>
                    <p className="review-text">Excelente producto, llegó en perfectas condiciones y la calidad es increíble.</p>
                    <span className="review-date">Hace 2 días</span>
                  </div>
                  <div className="review">
                    <div className="review-header">
                      <span className="reviewer-name">Carlos Rodríguez</span>
                      <div className="review-rating">{renderStars(4)}</div>
                    </div>
                    <p className="review-text">Muy buen producto, cumple con lo esperado. El envío fue rápido.</p>
                    <span className="review-date">Hace 1 semana</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
