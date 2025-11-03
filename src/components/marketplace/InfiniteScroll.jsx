import React, { useEffect, useRef } from 'react';

const InfiniteScroll = ({ hasNextPage, isLoading, onLoadMore, children, className = '' }) => {
  const loadMoreRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isLoading) {
          onLoadMore();
        }
      },
      {
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasNextPage, isLoading, onLoadMore]);

  return (
    <div className={className}>
      {children}

      {/* Loading Trigger */}
      {hasNextPage && (
        <div
          ref={loadMoreRef}
          className="flex items-center justify-center py-8"
        >
          {isLoading ? (
            <div className="flex items-center gap-2 text-gray-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-sm">Cargando más productos...</span>
            </div>
          ) : (
            <div className="h-4"></div> // Invisible trigger element
          )}
        </div>
      )}

      {/* End of Results */}
      {!hasNextPage && !isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-600 text-sm">
            No hay más productos para mostrar
          </p>
        </div>
      )}
    </div>
  );
};

export default InfiniteScroll;
