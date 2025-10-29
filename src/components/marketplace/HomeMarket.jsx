import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { marketplaceApi } from '../../services/marketplaceApi';
import { useCart } from '../../context/CartContext';

// Import components
import ProductCard from './ProductCard';
import SearchBar from './SearchBar';
import CategoryList from './CategoryList';
import CartDrawer from './CartDrawer';
import FilterPanel from './FilterPanel';
import InfiniteScroll from './InfiniteScroll';
import ProductGallery from './ProductGallery';
import SellerCard from './SellerCard';

const HomeMarket = () => {
  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [page, setPage] = useState(1);

  // UI state
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    priceRange: [0, 5000000],
    condition: 'all',
    location: 'all',
    rating: 0,
    sortBy: 'relevance'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Cart context
  const { totalItems } = useCart();

  // Load products function
  const loadProducts = useCallback(async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pageNum,
        limit: 12,
        q: searchQuery,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        minPrice: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
        maxPrice: filters.priceRange[1] < 5000000 ? filters.priceRange[1] : undefined,
        condition: filters.condition !== 'all' ? filters.condition : undefined,
        location: filters.location !== 'all' ? filters.location : undefined,
        rating: filters.rating > 0 ? filters.rating : undefined,
        sortBy: filters.sortBy
      };

      const response = await marketplaceApi.getProducts(params);

      if (append) {
        setProducts(prev => [...prev, ...response.products]);
      } else {
        setProducts(response.products);
      }

      setHasNextPage(pageNum < response.totalPages);
      setPage(pageNum);
    } catch (err) {
      setError('Error al cargar los productos. Por favor, intenta de nuevo.');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, filters]);

  // Initial load
  useEffect(() => {
    loadProducts(1, false);
  }, [loadProducts]);

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    setPage(1);
    // loadProducts will be called via useEffect
  };

  // Handle category selection
  const handleCategorySelect = (categoryId, subcategory) => {
    if (subcategory) {
      setSelectedCategory(`${categoryId}-${subcategory}`);
    } else {
      setSelectedCategory(categoryId);
    }
    setPage(1);
    // loadProducts will be called via useEffect
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    // loadProducts will be called via useEffect
  };

  // Handle infinite scroll
  const handleLoadMore = () => {
    if (!loading && hasNextPage) {
      loadProducts(page + 1, true);
    }
  };

  // Handle product click
  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  // Format price helper
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="home-market">
      {/* Top Bar - Solo búsqueda y carrito */}
      <div className="market-header">
        <div className="market-header-content">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">HomeMarket</h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <SearchBar
                onSearch={handleSearch}
                onCategorySelect={handleCategorySelect}
              />
            </div>

            {/* Cart Button */}
            <div className="flex items-center">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-3 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-full transition-all duration-200 group"
                aria-label={`Carrito de compras (${totalItems} items)`}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center min-w-[24px]">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="market-content">
        {/* Sidebar */}
        <aside className="market-sidebar">
          {/* Categories */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Categorías</h2>
            <CategoryList
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
            />
          </div>

          {/* Filters */}
          <FilterPanel
            filters={filters}
            onFiltersChange={handleFiltersChange}
            isOpen={showFilters}
            onToggle={() => setShowFilters(!showFilters)}
          />
        </aside>

        {/* Main Content Area */}
        <main className="market-main">
          {/* Results Header */}
          <div className="market-results">
            <div className="results-count">
              {products.length} productos
            </div>

            {/* Sort Dropdown */}
            <div className="results-sort">
              <span className="sort-label">Ordenar por:</span>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFiltersChange({ ...filters, sortBy: e.target.value })}
                className="sort-select"
              >
                <option value="relevance">Relevancia</option>
                <option value="price_asc">Precio: menor a mayor</option>
                <option value="price_desc">Precio: mayor a menor</option>
                <option value="rating">Mejor calificados</option>
                <option value="newest">Más recientes</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {error ? (
            <div className="market-error">
              <div className="error-icon">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="error-title">Error al cargar productos</h3>
              <p className="error-text">{error}</p>
              <button
                onClick={() => loadProducts(1, false)}
                className="btn-retry"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <InfiniteScroll
              hasNextPage={hasNextPage}
              isLoading={loading}
              onLoadMore={handleLoadMore}
              className="market-products"
            >
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => handleProductClick(product)}
                />
              ))}

              {/* Loading skeletons */}
              {loading && page === 1 && (
                <>
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 aspect-square rounded-xl mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </>
              )}
            </InfiniteScroll>
          )}

          {/* No results */}
          {!loading && !error && products.length === 0 && (
            <div className="market-empty">
              <div className="empty-icon">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="empty-title">No se encontraron productos</h3>
              <p className="empty-text">Intenta con otros términos de búsqueda o filtros diferentes.</p>
            </div>
          )}
        </main>
      </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">{selectedProduct.title}</h2>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                    aria-label="Cerrar modal"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Product Gallery */}
                  <div>
                    <ProductGallery
                      images={selectedProduct.images}
                      title={selectedProduct.title}
                    />
                  </div>

                  {/* Product Details */}
                  <div className="space-y-8">
                    {/* Price */}
                    <div>
                      <div className="flex items-baseline gap-4 mb-3">
                        <span className="text-4xl font-bold text-blue-600">
                          {formatPrice(selectedProduct.price)}
                        </span>
                        {selectedProduct.originalPrice && (
                          <span className="text-2xl text-gray-500 line-through">
                            {formatPrice(selectedProduct.originalPrice)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className={`px-3 py-1 rounded-full font-medium ${
                          selectedProduct.condition === 'new'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {selectedProduct.condition === 'new' ? 'Nuevo' : 'Usado'}
                        </span>
                        <span className="flex items-center gap-1">
                          📍 {selectedProduct.location}
                        </span>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {'★'.repeat(Math.floor(selectedProduct.rating))}
                        {'☆'.repeat(5 - Math.floor(selectedProduct.rating))}
                      </div>
                      <span className="text-gray-600 font-medium">
                        {selectedProduct.rating} ({selectedProduct.reviewCount} reseñas)
                      </span>
                    </div>

                    {/* Description */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Descripción</h3>
                      <p className="text-gray-700 leading-relaxed text-base">{selectedProduct.description}</p>
                    </div>

                    {/* Features */}
                    {selectedProduct.features && selectedProduct.features.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Características</h3>
                        <ul className="space-y-2">
                          {selectedProduct.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-3 text-gray-700">
                              <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Seller Card */}
                    <SellerCard seller={selectedProduct.seller} />

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                      <button className="flex-1 bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 text-lg">
                        Agregar al carrito
                      </button>
                      <button className="flex-1 bg-gray-100 text-gray-900 py-4 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors duration-200 text-lg">
                        Comprar ahora
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default HomeMarket;
