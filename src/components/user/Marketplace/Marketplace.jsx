import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import CreatePostModal from './CreatePostModal';
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
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [condition, setCondition] = useState('');
  const [location, setLocation] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sellerRating, setSellerRating] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const navigate = useNavigate();

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

  // Condiciones disponibles
  const conditions = [
    { value: '', label: 'Cualquiera' },
    { value: 'new', label: 'Nuevo' },
    { value: 'like-new', label: 'Como nuevo' },
    { value: 'good', label: 'Buen estado' },
    { value: 'fair', label: 'Estado regular' }
  ];

  // Filtros de fecha
  const dateFilters = [
    { value: '', label: 'Cualquier fecha' },
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mes' }
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
      date: '2023-10-15',
      condition: 'good',
      sellerRating: 4.5,
      images: ['/images/sofa1.jpg', '/images/sofa2.jpg', '/images/sofa3.jpg']
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
      date: '2023-10-10',
      condition: 'new',
      sellerRating: 4.8,
      images: ['/images/comedor1.jpg', '/images/comedor2.jpg']
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
      date: '2023-10-05',
      condition: 'like-new',
      sellerRating: 4.2,
      images: ['/images/lavadora1.jpg']
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
      date: '2023-09-28',
      condition: 'new',
      sellerRating: 4.7,
      images: ['/images/lampara1.jpg', '/images/lampara2.jpg']
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
      date: '2023-10-12',
      condition: 'like-new',
      sellerRating: 4.6,
      images: ['/images/ollas1.jpg']
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
      date: '2023-10-08',
      condition: 'new',
      sellerRating: 4.3,
      images: ['/images/cortinas1.jpg']
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
      date: '2023-09-30',
      condition: 'good',
      sellerRating: 4.4,
      images: ['/images/mesa1.jpg', '/images/mesa2.jpg']
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
      date: '2023-10-03',
      condition: 'new',
      sellerRating: 4.9,
      images: ['/images/organizador1.jpg']
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

  // Función para verificar si una fecha cumple con el filtro
  const isDateInRange = (productDate, filter) => {
    if (!filter) return true;
    const date = new Date(productDate);
    const now = new Date();

    switch (filter) {
      case 'today':
        return date.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return date >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        return date >= monthAgo;
      default:
        return true;
    }
  };

  // Filtrar productos según búsqueda y filtros
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

    // Filtrar por precio
    if (priceRange.min) {
      filtered = filtered.filter(product => product.price >= parseInt(priceRange.min));
    }
    if (priceRange.max) {
      filtered = filtered.filter(product => product.price <= parseInt(priceRange.max));
    }

    // Filtrar por condición
    if (condition) {
      filtered = filtered.filter(product => product.condition === condition);
    }

    // Filtrar por ubicación
    if (location) {
      filtered = filtered.filter(product =>
        product.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Filtrar por fecha
    if (dateFilter) {
      filtered = filtered.filter(product => isDateInRange(product.date, dateFilter));
    }

    // Filtrar por calificación del vendedor
    if (sellerRating) {
      filtered = filtered.filter(product => product.sellerRating >= parseFloat(sellerRating));
    }

    setFilteredProducts(filtered);
  }, [searchTerm, activeCategory, products, priceRange, condition, location, dateFilter, sellerRating]);

  // Manejar búsqueda
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    setSearchTerm('');
    setActiveCategory('Todos');
    setPriceRange({ min: '', max: '' });
    setCondition('');
    setLocation('');
    setDateFilter('');
    setSellerRating('');
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

  // Navegar a detalles del producto
  const handleProductClick = (productId) => {
    navigate(`/marketplace/product/${productId}`);
  };

  return (
    <div className="marketplace-container">
      {/* Barra de navegación superior */}
      <header className="marketplace-header">
        <div className="header-top">
          <h1 className="marketplace-title">Marketplace</h1>
    
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
            <button
              className="advanced-filters-toggle"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              ⚙️
            </button>
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

            {/* Filtros avanzados */}
            {showAdvancedFilters && (
              <div className="advanced-filters">
                <div className="filter-group">
                  <label>Rango de Precio</label>
                  <div className="price-range">
                    <input
                      type="number"
                      placeholder="Mín"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                    />
                    <span> - </span>
                    <input
                      type="number"
                      placeholder="Máx"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                    />
                  </div>
                </div>

                <div className="filter-group">
                  <label>Condición</label>
                  <select value={condition} onChange={(e) => setCondition(e.target.value)}>
                    {conditions.map(cond => (
                      <option key={cond.value} value={cond.value}>{cond.label}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Ubicación</label>
                  <input
                    type="text"
                    placeholder="Buscar por ubicación"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <label>Fecha de publicación</label>
                  <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                    {dateFilters.map(filter => (
                      <option key={filter.value} value={filter.value}>{filter.label}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Calificación del vendedor (mínima)</label>
                  <select value={sellerRating} onChange={(e) => setSellerRating(e.target.value)}>
                    <option value="">Cualquiera</option>
                    <option value="4.5">4.5+ estrellas</option>
                    <option value="4.0">4.0+ estrellas</option>
                    <option value="3.5">3.5+ estrellas</option>
                  </select>
                </div>
              </div>
            )}

            <button className="apply-filters" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
              {showAdvancedFilters ? 'Ocultar filtros' : 'Mostrar más filtros'}
            </button>
            <button className="clear-filters" onClick={clearAllFilters}>
              Limpiar filtros
            </button>
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
                <option value="rating">Mejor calificación</option>
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
                <ProductCard
                  key={product.id}
                  product={product}
                  formatPrice={formatPrice}
                  onProductClick={handleProductClick}
                />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <p>No se encontraron productos que coincidan con tu búsqueda.</p>
              <button onClick={clearAllFilters}>
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



export default Marketplace;
