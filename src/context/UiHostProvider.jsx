import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import SearchHub from '../components/SearchHub/SearchHub';
import './UiHostProvider.css';

const UiHostContext = createContext();

export const UiHostProvider = ({ children }) => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchKey, setSearchKey] = useState(0); // to reset SearchHub if needed

  const showSearch = useCallback(() => {
    setIsSearchVisible(true);
    setSearchKey(k => k + 1);
  }, []);

  const hideSearch = useCallback(() => {
    setIsSearchVisible(false);
  }, []);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isSearchVisible) {
        hideSearch();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isSearchVisible, hideSearch]);

  return (
    <UiHostContext.Provider value={{ showSearch, hideSearch }}>
      {children}
      {/* Portal-like mount point for SearchHub */}
      {isSearchVisible && (
        <div className="uihost-search-container" role="dialog" aria-modal="true" aria-label="Búsqueda">
          <SearchHub key={searchKey} onClose={hideSearch} />
        </div>
      )}
    </UiHostContext.Provider>
  );
};

export const useUiHost = () => {
  const context = useContext(UiHostContext);
  if (!context) {
    throw new Error('useUiHost debe usarse dentro de UiHostProvider');
  }
  return context;
};
