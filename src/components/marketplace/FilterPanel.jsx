import React from 'react';
import { motion } from 'framer-motion';
import './FilterPanel.css';

const FilterPanel = ({
  filters,
  onFiltersChange,
  isOpen,
  onToggle,
  className = ''
}) => {
  const handlePriceRangeChange = (min, max) => {
    onFiltersChange({
      ...filters,
      priceRange: [Number(min) || 0, Number(max) || 5000000]
    });
  };

  const handleConditionChange = (condition) => {
    onFiltersChange({
      ...filters,
      condition: condition === filters.condition ? 'all' : condition
    });
  };

  const handleLocationChange = (location) => {
    onFiltersChange({
      ...filters,
      location: location === filters.location ? 'all' : location
    });
  };

  const handleRatingChange = (rating) => {
    onFiltersChange({
      ...filters,
      rating: rating === filters.rating ? 0 : rating
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      priceRange: [0, 5000000],
      condition: 'all',
      location: 'all',
      rating: 0,
      sortBy: 'relevance'
    });
  };

  const hasActiveFilters =
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 5000000 ||
    filters.condition !== 'all' ||
    filters.location !== 'all' ||
    filters.rating > 0;

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span>Filtros</span>
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              Activos
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      <motion.div
        className={`bg-white border border-gray-200 rounded-xl p-6 shadow-sm ${className} ${
          !isOpen ? 'hidden lg:block' : ''
        }`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Rango de precio
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="number"
                placeholder="Mínimo"
                value={filters.priceRange[0] || ''}
                onChange={(e) => handlePriceRangeChange(e.target.value, filters.priceRange[1])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
              />
            </div>
            <div className="flex-1">
              <input
                type="number"
                placeholder="Máximo"
                value={filters.priceRange[1] === 5000000 ? '' : filters.priceRange[1]}
                onChange={(e) => handlePriceRangeChange(filters.priceRange[0], e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Condition */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Condición
          </label>
          <div className="space-y-2">
            {[
              { value: 'all', label: 'Todos' },
              { value: 'new', label: 'Nuevo' },
              { value: 'used', label: 'Usado' }
            ].map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name="condition"
                  value={option.value}
                  checked={filters.condition === option.value}
                  onChange={(e) => handleConditionChange(e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Ubicación
          </label>
          <select
            value={filters.location}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas las ubicaciones</option>
            <option value="Bogotá">Bogotá</option>
            <option value="Medellín">Medellín</option>
            <option value="Cali">Cali</option>
            <option value="Barranquilla">Barranquilla</option>
            <option value="Cartagena">Cartagena</option>
            <option value="Bucaramanga">Bucaramanga</option>
          </select>
        </div>

        {/* Rating */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Calificación mínima
          </label>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => handleRatingChange(rating)}
                className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 ${
                  filters.rating === rating
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  {'★'.repeat(rating)}
                  <span className="text-gray-300 ml-1">{'☆'.repeat(5 - rating)}</span>
                </div>
                <span className="text-sm text-gray-700">{rating}+ estrellas</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Ordenar por
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="relevance">Relevancia</option>
            <option value="price_asc">Precio: menor a mayor</option>
            <option value="price_desc">Precio: mayor a menor</option>
            <option value="rating">Mejor calificados</option>
            <option value="newest">Más recientes</option>
          </select>
        </div>
      </motion.div>
    </>
  );
};

export default FilterPanel;
