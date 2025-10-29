import React, { useState, useEffect, useRef } from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, loading, onProductClick, onAddToCart }) => {
  const [visibleProducts, setVisibleProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef(null);
  const loadingRef = useRef(null);

  const ITEMS_PER_PAGE = 12;

  // Reset cuando cambian los productos
  useEffect(() => {
    setVisibleProducts([]);
    setPage(1);
    setHasMore(true);
  }, [products]);

  // Cargar productos iniciales
  useEffect(() => {
    if (products.length > 0 && visibleProducts.length === 0) {
      const initialProducts = products.slice(0, ITEMS_PER_PAGE);
      setVisibleProducts(initialProducts);
      setHasMore(products.length > ITEMS_PER_PAGE);
    }
  }, [products, visibleProducts.length]);

  // Infinite scroll
  useEffect(() => {
    if (loading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreProducts();
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [loading, hasMore, page, products]);

  const loadMoreProducts = () => {
    const startIndex = page * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const newProducts = products.slice(startIndex, endIndex);

    if (newProducts.length > 0) {
      setVisibleProducts(prev => [...prev, ...newProducts]);
      setPage(prev => prev + 1);
      setHasMore(endIndex < products.length);
    } else {
      setHasMore(false);
    }
  };

  if (loading && visibleProducts.length === 0) {
    return (
      <div className="product-grid-loading">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
              <div className="space-y-2">
                <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                <div className="bg-gray-200 h-6 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!loading && products.length === 0) {
    return (
      <div className="no-products text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No se encontraron productos
        </h3>
        <p className="text-gray-600">
          Intenta ajustar tus filtros o búsqueda
        </p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {visibleProducts.map((product, index) => (
          <ProductCard
            key={`${product.id}-${index}`}
            product={product}
            onClick={() => onProductClick(product.id)}
            onAddToCart={() => onAddToCart(product)}
            index={index}
          />
        ))}
      </div>

      {/* Loading indicator for infinite scroll */}
      {hasMore && (
        <div ref={loadingRef} className="flex justify-center py-8">
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Cargando más productos...</span>
          </div>
        </div>
      )}

      {/* End of results */}
      {!hasMore && visibleProducts.length > 0 && (
        <div className="text-center py-8 text-gray-600">
          <p>Has visto todos los productos disponibles</p>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
