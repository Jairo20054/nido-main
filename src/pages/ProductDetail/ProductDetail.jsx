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
      title: 'Sofá Moderno 3 Plazas Gris',
      price: 1299000,
      originalPrice: 1599000,
      discount: 19,
      category: 'furniture',
      images: ['🛋️', '🛋️', '🛋️', '🛋️'],
      rating: 4.5,
      reviews: 128,
      installments: 12,
      freeShipping: true,
      tags: ['Nuevo', 'Envío gratis'],
      featured: true,
      stock: 15,
      description: 'Sofá moderno de 3 plazas con diseño contemporáneo. Fabricado con materiales de alta calidad y tapizado en tela gris premium. Incluye cojines decorativos y estructura resistente.',
      specifications: {
        'Material': 'Tela premium',
        'Color': 'Gris',
        'Plazas': '3',
        'Dimensiones': '220cm x 90cm x 85cm',
        'Peso': '45kg',
        'Garantía': '2 años'
      },
      seller: {
        name: 'Muebles Modernos',
        rating: 4.8,
        sales: 1250,
        location: 'Bogotá, Colombia'
      }
    },
    {
      id: 2,
      title: 'Set Ollas Antiadherentes 5 Piezas',
      price: 199900,
      originalPrice: 249900,
      discount: 20,
      category: 'kitchen',
      images: ['🍳', '🍳', '🍳', '🍳'],
      rating: 4.7,
      reviews: 156,
      installments: 6,
      freeShipping: true,
      tags: ['Oferta', 'Premium'],
      stock: 8,
      description: 'Set completo de 5 ollas antiadherentes con revestimiento cerámico. Ideales para cocinar sin aceite y mantener los alimentos saludables.',
      specifications: {
        'Material': 'Aluminio con revestimiento cerámico',
        'Piezas': '5',
        'Colores': 'Negro y rojo',
        'Diámetros': '16cm, 18cm, 20cm, 22cm, 24cm',
        'Mango': 'Ergonómico con silicona',
        'Compatible': 'Inducción, gas, vitrocerámica'
      },
      seller: {
        name: 'Cocina Express',
        rating: 4.6,
        sales: 890,
        location: 'Medellín, Colombia'
      }
    },
    // Add more products as needed
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
  };

  const handleBuyNow = () => {
    // In real app, this would go to checkout
    console.log(`Comprando ${quantity} unidades de ${product.title}`);
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
                Agregar al carrito
              </button>
              <button
                className="buy-now-btn"
                onClick={handleBuyNow}
                disabled={product.stock === 0}
              >
                Comprar ahora
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
