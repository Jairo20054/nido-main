import React, { useEffect, useRef, useCallback } from 'react';

const InfiniteScroll = ({
  children,
  hasNextPage,
  isLoading,
  onLoadMore,
  threshold = 100,
  className = ''
}) => {
  const loadingRef = useRef(null);

  const handleIntersection = useCallback(
    (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isLoading) {
        onLoadMore();
      }
    },
    [hasNextPage, isLoading, onLoadMore]
  );

  useEffect(() => {
    const element = loadingRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
      rootMargin: `${threshold}px`
    });

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [handleIntersection, threshold]);

  return (
    <div className={className}>
      {children}

      {/* Loading indicator and intersection trigger */}
      {hasNextPage && (
        <div
          ref={loadingRef}
          className="flex justify-center items-center py-8"
          aria-label="Cargando más productos"
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="text-gray-600">Cargando más productos...</span>
            </div>
          ) : (
            <div className="w-8 h-8" aria-hidden="true"></div> // Invisible trigger element
          )}
        </div>
      )}

      {/* End of results message */}
      {!hasNextPage && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          <p>No hay más productos para mostrar</p>
        </div>
      )}
    </div>
  );
};

export default InfiniteScroll;
