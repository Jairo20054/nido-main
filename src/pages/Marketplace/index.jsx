import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { marketplaceApi } from '../../../services/marketplaceApi';
import { useCart } from '../../../context/CartContext';

// Import components
import ProductCard from '../../marketplace/ProductCard';
import SearchBar from '../../marketplace/SearchBar';
import CategoryList from '../../marketplace/CategoryList';
import CartDrawer from '../../marketplace/CartDrawer';
import FilterPanel from '../../marketplace/FilterPanel';
import InfiniteScroll from '../../marketplace/InfiniteScroll';
import ProductGallery from '../../marketplace/ProductGallery';
import SellerCard from '../../marketplace/SellerCard';

const Marketplace = () => {
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
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
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

            {/* Navigation */}
            <nav className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200">
                <span className="sr-only">Inicio</span>
                🏠
              </button>
              <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200">
                <span className="sr-only">Favoritos</span>
                ❤️
              </button>
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                <span className="sr-only">Carrito</span>
                🛒
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
              <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200">
                <span className="sr-only">Perfil</span>
                👤
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8 w-full">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            {/* Categories */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
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
          <main className="flex-1 w-full">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6 w-full">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {searchQuery ? `Resultados para "${searchQuery}"` : 'Productos destacados'}
                </h2>
                <span className="text-sm text-gray-600">
                  {products.length} productos encontrados
                </span>
              </div>

              {/* Sort Dropdown */}
              <select
                value={filters.sortBy}
                onChange={(e) => handleFiltersChange({ ...filters, sortBy: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="relevance">Relevancia</option>
                <option value="price_asc">Precio: menor a mayor</option>
                <option value="price_desc">Precio: mayor a menor</option>
                <option value="rating">Mejor calificados</option>
                <option value="newest">Más recientes</option>
              </select>
            </div>

            {/* Products Grid */}
            {error ? (
              <div className="text-center py-12 w-full">
                <div className="text-red-600 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => loadProducts(1, false)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <InfiniteScroll
                hasNextPage={hasNextPage}
                isLoading={loading}
                onLoadMore={handleLoadMore}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full"
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
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </>
                )}
              </InfiniteScroll>
            )}

            {/* No results */}
            {!loading && !error && products.length === 0 && (
              <div className="text-center py-12 w-full">
                <div className="text-gray-400 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
                <p className="text-gray-600">Intenta con otros términos de búsqueda o filtros diferentes.</p>
              </div>
            )}
          </main>
        </div>
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
              className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedProduct.title}</h2>
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Product Gallery */}
                  <div>
                    <ProductGallery
                      images={selectedProduct.images}
                      title={selectedProduct.title}
                    />
                  </div>

                  {/* Product Details */}
                  <div className="space-y-6">
                    {/* Price */}
                    <div>
                      <div className="flex items-baseline gap-3 mb-2">
                        <span className="text-3xl font-bold text-blue-600">
                          {formatPrice(selectedProduct.price)}
                        </span>
                        {selectedProduct.originalPrice && (
                          <span className="text-xl text-gray-500 line-through">
                            {formatPrice(selectedProduct.originalPrice)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className={`px-2 py-1 rounded ${
                          selectedProduct.condition === 'new'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {selectedProduct.condition === 'new' ? 'Nuevo' : 'Usado'}
                        </span>
                        <span>📍 {selectedProduct.location}</span>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {'★'.repeat(Math.floor(selectedProduct.rating))}
                        {'☆'.repeat(5 - Math.floor(selectedProduct.rating))}
                      </div>
                      <span className="text-gray-600">
                        {selectedProduct.rating} ({selectedProduct.reviewCount} reseñas)
                      </span>
                    </div>

                    {/* Description */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
                      <p className="text-gray-700 leading-relaxed">{selectedProduct.description}</p>
                    </div>

                    {/* Features */}
                    {selectedProduct.features && selectedProduct.features.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Características</h3>
                        <ul className="space-y-1">
                          {selectedProduct.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-gray-700">
                              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0"></span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Seller Card */}
                    <SellerCard seller={selectedProduct.seller} />

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200">
                        Agregar al carrito
                      </button>
                      <button className="flex-1 bg-gray-100 text-gray-900 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-200">
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

export default Marketplace;
