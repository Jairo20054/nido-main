// Marketplace.jsx
import React, { useState, useEffect } from 'react';
import './Marketplace.css';

// Componente principal del Marketplace
const Marketplace = () => {
  // Estados para manejar los datos y la interfaz
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Categorías específicas para objetos del hogar
  const categories = [
    'Todos',
    'Muebles',
    'Electrodomésticos',
    'Decoración',
    'Cocina',
    'Jardín',
    'Iluminación',
    'Textiles',
    'Organización'
  ];

  // Datos de ejemplo para productos del hogar
  const sampleProducts = [
    {
      id: 1,
      title: 'Sofá cama moderno',
      price: 450000,
      category: 'Muebles',
      location: 'Cal',
      image: '/images/sofa.jpg',
      description: 'Sofá cama en excelente estado, color gris, poco uso',
      seller: 'Juan Pérez',
      date: '2023-10-15'
    },
    {
      id: 2,
      title: 'Juego de comedor para 6 personas',
      price: 780000,
      category: 'Muebles',
      location: 'Cal',
      image: '/images/comedor.jpg',
      description: 'Mesa con 6 sillas, madera de roble, perfecto estado',
      seller: 'María García',
      date: '2023-10-10'
    },
    {
      id: 3,
      title: 'Lavadora Samsung 15kg',
      price: 1200000,
      category: 'Electrodomésticos',
      location: 'Cal',
      image: '/images/lavadora.jpg',
      description: 'Lavadora semi-automática, capacidad 15kg, eficiencia energética A+',
      seller: 'Carlos Rodríguez',
      date: '2023-10-05'
    },
    {
      id: 4,
      title: 'Lámpara de pie moderna',
      price: 85000,
      category: 'Iluminación',
      location: 'Cal',
      image: '/images/lampara.jpg',
      description: 'Lámpara de pie con diseño escandinavo, color negro mate',
      seller: 'Ana López',
      date: '2023-09-28'
    },
    {
      id: 5,
      title: 'Juego de ollas de acero inoxidable',
      price: 150000,
      category: 'Cocina',
      location: 'Cal',
      image: '/images/ollas.jpg',
      description: 'Set de 7 piezas, marca reconocida, como nuevas',
      seller: 'Roberto Silva',
      date: '2023-10-12'
    },
    {
      id: 6,
      title: 'Cortinas blackout',
      price: 120000,
      category: 'Textiles',
      location: 'Cal',
      image: '/images/cortinas.jpg',
      description: 'Cortinas térmicas y blackout, color beige, medidas 2.5x2m',
      seller: 'Laura Martínez',
      date: '2023-10-08'
    },
    {
      id: 7,
      title: 'Mesa de centro con almacenamiento',
      price: 230000,
      category: 'Muebles',
      location: 'Cal',
      image: '/images/mesa-centro.jpg',
      description: 'Mesa de centro moderna con cajones, color nogal',
      seller: 'Diego Fernández',
      date: '2023-09-30'
    },
    {
      id: 8,
      title: 'Organizador de closet',
      price: 75000,
      category: 'Organización',
      location: 'Cal',
      image: '/images/organizador.jpg',
      description: 'Sistema modular para organizar clóset, fácil de instalar',
      seller: 'Sofía Ramírez',
      date: '2023-10-03'
    }
  ];

  // Simular carga de datos
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // En una aplicación real, aquí haríamos una llamada a la API
      setTimeout(() => {
        setProducts(sampleProducts);
        setFilteredProducts(sampleProducts);
        setLoading(false);
      }, 1000);
    };

    loadData();
  }, []);

  // Filtrar productos según búsqueda y categoría
  useEffect(() => {
    let filtered = products;
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrar por categoría
    if (activeCategory !== 'Todos') {
      filtered = filtered.filter(product => product.category === activeCategory);
    }
    
    setFilteredProducts(filtered);
  }, [searchTerm, activeCategory, products]);

  // Manejar búsqueda
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Formatear precio en formato colombiano
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Alternar visibilidad del formulario de creación
  const toggleCreatePost = () => {
    setShowCreatePost(!showCreatePost);
  };

  return (
    <div className="marketplace-container">
      {/* Barra de navegación superior */}
      <header className="marketplace-header">
        <div className="header-top">
          <h1 className="marketplace-title">Marketplace</h1>
          <div className="user-actions">
            <button className="notification-btn">
              <span className="icon">🔔</span>
              <span className="count">3</span>
            </button>
            <button className="inbox-btn">
              <span className="icon">📥</span>
              <span className="count">5</span>
            </button>
            <button className="profile-btn">
              <span className="avatar">👤</span>
            </button>
          </div>
        </div>
        
        <div className="search-container">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar en Marketplace" 
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
        </div>
        
        <nav className="main-nav">
          <button className="nav-btn active">Explorar todo</button>
          <button className="nav-btn">Compra</button>
          <div className="nav-dropdown">
            <button className="nav-btn">Venta</button>
            <div className="dropdown-content">
              <button onClick={toggleCreatePost}>Crear publicación</button>
            </div>
          </div>
        </nav>
      </header>

      {/* Contenido principal */}
      <main className="marketplace-main">
        {/* Panel lateral izquierdo */}
        <aside className="sidebar">
          <div className="location-info">
            <h3>Ubicación</h3>
            <p>Cal: En un radio de 25 km</p>
            <button className="change-location">Cambiar</button>
          </div>
          
          <div className="categories">
            <h3>Categorías</h3>
            <ul>
              {categories.map(category => (
                <li key={category}>
                  <button 
                    className={activeCategory === category ? 'active' : ''}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="filters">
            <h3>Filtros</h3>
            <div className="filter-group">
              <label>Precio</label>
              <div className="price-range">
                <input type="number" placeholder="Mín" />
                <span> - </span>
                <input type="number" placeholder="Máx" />
              </div>
            </div>
            <div className="filter-group">
              <label>Condición</label>
              <select>
                <option value="">Cualquiera</option>
                <option value="new">Nuevo</option>
                <option value="like-new">Como nuevo</option>
                <option value="good">Buen estado</option>
                <option value="fair">Estado regular</option>
              </select>
            </div>
            <button className="apply-filters">Aplicar filtros</button>
          </div>
        </aside>

        {/* Área de productos */}
        <section className="products-section">
          <div className="section-header">
            <h2>Sugerencias de hoy</h2>
            <div className="sort-options">
              <select>
                <option value="recent">Más recientes</option>
                <option value="price-low">Precio: menor a mayor</option>
                <option value="price-high">Precio: mayor a menor</option>
                <option value="name">Orden alfabético</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Cargando productos...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} formatPrice={formatPrice} />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <p>No se encontraron productos que coincidan con tu búsqueda.</p>
              <button onClick={() => {
                setSearchTerm('');
                setActiveCategory('Todos');
              }}>
                Ver todos los productos
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Modal para crear publicación */}
      {showCreatePost && (
        <CreatePostModal onClose={toggleCreatePost} />
      )}
    </div>
  );
};

// Componente para tarjeta de producto
const ProductCard = ({ product, formatPrice }) => {
  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.image} alt={product.title} />
        <button className="favorite-btn">❤️</button>
      </div>
      <div className="product-info">
        <h3 className="product-title">{product.title}</h3>
        <p className="product-price">{formatPrice(product.price)}</p>
        <p className="product-location">{product.location}</p>
        <div className="product-meta">
          <span className="product-category">{product.category}</span>
          <span className="product-date">{product.date}</span>
        </div>
        <div className="product-actions">
          <button className="btn-contact">Contactar</button>
          <button className="btn-details">Ver detalles</button>
        </div>
      </div>
    </div>
  );
};

// Componente modal para crear publicación
const CreatePostModal = ({ onClose }) => {
  const [postType, setPostType] = useState('item');
  const [activePosts, setActivePosts] = useState(3);

  const postTypes = [
    {
      id: 'item',
      title: 'Artículo en venta',
      description: 'Crea una sola publicación para vender uno o más artículos.'
    },
    {
      id: 'vehicle',
      title: 'Vehículos en venta',
      description: 'Vende cualquier tipo de vehículo: autos, motos, bicicletas, etc.'
    },
    {
      id: 'property',
      title: 'Propiedad en venta o alquiler',
      description: 'Publica una casa o departamento para vender o alquilar.'
    }
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Crear publicación</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="post-stats">
          <p><strong>Tus publicaciones</strong> {activePosts} activas</p>
        </div>
        
        <div className="post-type-section">
          <h3>Elegir tipo de publicación</h3>
          <div className="post-type-grid">
            {postTypes.map(type => (
              <div 
                key={type.id}
                className={`post-type-card ${postType === type.id ? 'active' : ''}`}
                onClick={() => setPostType(type.id)}
              >
                <h4>{type.title}</h4>
                <p>{type.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-continue">Continuar</button>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;