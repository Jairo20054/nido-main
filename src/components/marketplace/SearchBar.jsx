import React, { useState } from 'react';

const SearchBar = ({ onSearch, onCategorySelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Todas las categorías' },
    { id: 'electronics', name: 'Electrónicos' },
    { id: 'home', name: 'Hogar y Jardín' },
    { id: 'fashion', name: 'Moda y Accesorios' },
    { id: 'sports', name: 'Deportes' },
    { id: 'books', name: 'Libros' },
    { id: 'toys', name: 'Juguetes' },
    { id: 'automotive', name: 'Automotriz' },
    { id: 'health', name: 'Salud y Belleza' },
    { id: 'office', name: 'Oficina' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
    if (onCategorySelect) {
      onCategorySelect(selectedCategory);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      {/* Search Input */}
      <div className="flex-1 relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar productos..."
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Category Select */}
      <select
        value={selectedCategory}
        onChange={(e) => handleCategoryChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
      >
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      {/* Search Button */}
      <button
        type="submit"
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
      >
        Buscar
      </button>
    </form>
  );
};

export default SearchBar;
