import React, { useState } from 'react';

const FilterPanel = ({ filters, onFiltersChange, isOpen, onToggle }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const locations = [
    'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Cúcuta', 'Bucaramanga', 'Pereira', 'Santa Marta', 'Ibagué'
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handlePriceRangeChange = (min, max) => {
    const newFilters = { ...localFilters, priceRange: [min, max] };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      priceRange: [0, 5000000],
      condition: 'all',
      location: 'all',
      rating: 0,
      sortBy: 'relevance'
    };
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
        <button
          onClick={onToggle}
          className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
        >
          <svg className={`w-5 h-5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div className={`space-y-6 ${isOpen || 'hidden md:block'}`}>
        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Rango de precio
          </label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Mínimo"
                value={localFilters.priceRange[0] || ''}
                onChange={(e) => handlePriceRangeChange(Number(e.target.value) || 0, localFilters.priceRange[1])}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <input
                type="number"
                placeholder="Máximo"
                value={localFilters.priceRange[1] || ''}
                onChange={(e) => handlePriceRangeChange(localFilters.priceRange[0], Number(e.target.value) || 5000000)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="text-xs text-gray-600">
              Hasta $5.000.000 COP
            </div>
          </div>
        </div>

        {/* Condition */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Condición
          </label>
          <select
            value={localFilters.condition}
            onChange={(e) => handleFilterChange('condition', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas</option>
            <option value="new">Nuevo</option>
            <option value="used">Usado</option>
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Ubicación
          </label>
          <select
            value={localFilters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas las ubicaciones</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Calificación mínima
          </label>
          <div className="space-y-2">
            {[0, 1, 2, 3, 4, 5].map((rating) => (
              <label key={rating} className="flex items-center">
                <input
                  type="radio"
                  name="rating"
                  value={rating}
                  checked={localFilters.rating === rating}
                  onChange={(e) => handleFilterChange('rating', Number(e.target.value))}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {rating === 0 ? 'Todas' : `${'★'.repeat(rating)}${'☆'.repeat(5 - rating)} o más`}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Reset Filters */}
        <button
          onClick={resetFilters}
          className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
