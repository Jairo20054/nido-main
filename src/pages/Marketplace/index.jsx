import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './Cart/CartContext';
import MarketplaceHeader from './MarketplaceHeader';
import ProductGrid from './ProductGrid';
import FiltersDrawer from './FiltersDrawer';
import './index.module.css';

const Marketplace = () => {
  const navigate = useNavigate();
  const { totalItems, addItem } = useCart();

  // Estados principales
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: [0, 1000000],
    brand: [],
    rating: 0,
    material: [],
    inStock: false,
    seller: [],
    sortBy: 'relevance'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeSection, setActiveSection] = useState('all');

  // Mock data - reemplazar con API real
  const mockProducts = [
    {
      id: 1,
      title: 'Sofá Modular Lina 3 Plazas',
      price: 1299000,
      originalPrice: 1599000,
      discount: 19,
      category: 'furniture',
      images: ['/images/products/sofa-lina-1.jpg'],
      rating: 4.6,
      reviewsCount: 142,
      stock: 12,
      variants: [{ id: 'v1', color: 'Gris', sku: 'SOFA-LINA-GR', price: 1299000 }],
      brand: 'CasaLinea',
      material: 'Tela',
      seller: {
        id: 'seller_01',
        name: 'Tienda Hogar S.A.',
        rating: 4.8,
        location: 'Bogotá, Colombia'
      },
      shipping: { estimated_days: '3-7', cost: 35000 },
      description: 'Sofá modular ideal para salas modernas...',
      featured: true,
      isNew: false,
      isOffer: false,
      isBestSeller: true
    },
    {
      id: 2,
      title: 'Set Ollas Antiadherentes 5 Piezas',
      price: 199900,
      originalPrice: 249900,
      discount: 20,
      category: 'kitchen',
      images: ['/images/products/ollas-set.jpg'],
      rating: 4.7,
      reviewsCount: 156,
      stock: 8,
      variants: [],
      brand: 'CookMaster',
      material: 'Aluminio',
      seller: {
        id: 'seller_02',
        name: 'Cocina Express',
        rating: 4.6,
        location: 'Medellín, Colombia'
      },
      shipping: { estimated_days: '2-5', cost: 25000 },
      description: 'Set completo de ollas antiadherentes...',
      featured: false,
      isNew: true,
      isOffer: true,
      isBestSeller: false
    },
    // Agregar más productos según necesidad
  ];

  // Cargar productos
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      // Simular llamada a API
      setTimeout(() => {
        setProducts(mockProducts);
        setFilteredProducts(mockProducts);
        setLoading(false);
      }, 1000);
    };
    loadProducts();
  }, []);

  // Aplicar filtros y búsqueda
  useEffect(() => {
    let result = [...products];

    // Filtro de búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(product =>
        product.title.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    }

    // Filtros aplicados
    if (filters.category !== 'all') {
      result = result.filter(product => product.category === filters.category);
    }

    result = result.filter(product =>
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    if (filters.brand.length > 0) {
      result = result.filter(product => filters.brand.includes(product.brand));
    }

    if (filters.rating > 0) {
      result = result.filter(product => product.rating >= filters.rating);
    }

    if (filters.material.length > 0) {
      result = result.filter(product => filters.material.includes(product.material));
    }

    if (filters.inStock) {
      result = result.filter(product => product.stock > 0);
    }

    if (filters.seller.length > 0) {
      result = result.filter(product => filters.seller.includes(product.seller.id));
    }

    // Ordenamiento
    switch (filters.sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      default:
        // relevance - mantener orden original
        break;
    }

    setFilteredProducts(result);
  }, [products, searchQuery, filters]);

  // Filtrar por sección destacada
  const getSectionProducts = useCallback((section) => {
    switch (section) {
      case 'new':
        return filteredProducts.filter(p => p.isNew);
      case 'offers':
        return filteredProducts.filter(p => p.isOffer || p.discount > 0);
      case 'bestsellers':
        return filteredProducts.filter(p => p.isBestSeller);
      case 'suggested':
        return filteredProducts.slice(0, 8); // Lógica de recomendación
      default:
        return filteredProducts;
    }
  }, [filteredProducts]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setActiveSection('all');
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleProductClick = useCallback((productId) => {
    navigate(`/marketplace/product/${productId}`);
  }, [navigate]);

  const currentProducts = getSectionProducts(activeSection);

  return (
    <div className="marketplace">
      <MarketplaceHeader
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onToggleFilters={() => setShowFilters(!showFilters)}
        cartItemCount={totalItems}
      />

      <main className="marketplace-main">
        <FiltersDrawer
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          filters={filters}
          onFilterChange={handleFilterChange}
          products={products}
        />

        <div className="marketplace-content">
          {/* Secciones destacadas */}
          <div className="featured-sections">
            <button
              className={`section-tab ${activeSection === 'all' ? 'active' : ''}`}
              onClick={() => setActiveSection('all')}
            >
              Todos los productos
            </button>
            <button
              className={`section-tab ${activeSection === 'new' ? 'active' : ''}`}
              onClick={() => setActiveSection('new')}
            >
              Novedades
            </button>
            <button
              className={`section-tab ${activeSection === 'offers' ? 'active' : ''}`}
              onClick={() => setActiveSection('offers')}
            >
              Ofertas del día
            </button>
            <button
              className={`section-tab ${activeSection === 'bestsellers' ? 'active' : ''}`}
              onClick={() => setActiveSection('bestsellers')}
            >
              Más vendidos
            </button>
            <button
              className={`section-tab ${activeSection === 'suggested' ? 'active' : ''}`}
              onClick={() => setActiveSection('suggested')}
            >
              Sugeridos para ti
            </button>
          </div>

          <ProductGrid
            products={currentProducts}
            loading={loading}
            onProductClick={handleProductClick}
            onAddToCart={addItem}
          />
        </div>
      </main>
    </div>
  );
};

export default Marketplace;
