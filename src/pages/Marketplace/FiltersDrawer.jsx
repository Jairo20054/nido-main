import React, { useState } from 'react';

const FiltersDrawer = ({ isOpen, onClose, filters, onFilterChange, products }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  // Extraer opciones únicas de los productos
  const categories = [...new Set(products.map(p => p.category))];
  const brands = [...new Set(products.map(p => p.brand))];
  const materials = [...new Set(products.map(p => p.material))];
  const sellers = [...new Set(products.map(p => p.seller.id))].map(id =>
    products.find(p => p.seller.id === id).seller
  );

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleArrayFilterChange = (key, value, checked) => {
    const currentArray = localFilters[key] || [];
    const newArray = checked
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);

    handleFilterChange(key, newArray);
  };

  const clearFilters = () => {
    const defaultFilters = {
      category: 'all',
      priceRange: [0, 1000000],
      brand: [],
      rating: 0,
      material: [],
      inStock: false,
      seller: [],
      sortBy: 'relevance'
    };
    setLocalFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const getCategoryLabel = (category) => {
    const labels = {
      furniture: 'Muebles',
      decor: 'Decoración',
      kitchen: 'Cocina',
      bedroom: 'Dormitorio',
      bathroom: 'Baño',
      lighting: 'Iluminación',
      storage: 'Organización',
      garden: 'Jardín',
      cleaning: 'Limpieza'
    };
    return labels[category] || category;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed inset-y-0 left-0 z-50 w-full max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:relative md:translate-x-0 md:shadow-none md:w-80 md:max-w-none`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Limpiar
              </button>
              <button
                onClick={onClose}
                className="md:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
              >
                <span className="text-lg">✕</span>
              </button>
            </div>
          </div>

          {/* Filters Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Category */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Categoría</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value="all"
                    checked={localFilters.category === 'all'}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Todas las categorías</span>
                </label>
                {categories.map(category => (
                  <label key={category} className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value={category}
                      checked={localFilters.category === category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{getCategoryLabel(category)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Rango de precio</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Mínimo"
                    value={localFilters.priceRange[0]}
                    onChange={(e) => handleFilterChange('priceRange', [Number(e.target.value), localFilters.priceRange[1]])}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    placeholder="Máximo"
                    value={localFilters.priceRange[1]}
                    onChange={(e) => handleFilterChange('priceRange', [localFilters.priceRange[0], Number(e.target.value)])}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Brand */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Marca</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {brands.map(brand => (
                  <label key={brand} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={localFilters.brand.includes(brand)}
                      onChange={(e) => handleArrayFilterChange('brand', brand, e.target.checked)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Valoración mínima</h3>
              <div className="space-y-2">
                {[4, 3, 2, 1].map(rating => (
                  <label key={rating} className="flex items-center">
                    <input
                      type="radio"
                      name="rating"
                      value={rating}
                      checked={localFilters.rating === rating}
                      onChange={(e) => handleFilterChange('rating', Number(e.target.value))}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
                          ★
                        </span>
                      ))}
                      <span className="ml-1">& arriba</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Material */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Material</h3>
              <div className="space-y-2">
                {materials.map(material => (
                  <label key={material} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={localFilters.material.includes(material)}
                      onChange={(e) => handleArrayFilterChange('material', material, e.target.checked)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{material}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Stock */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={localFilters.inStock}
                  onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Solo productos en stock</span>
              </label>
            </div>

            {/* Seller */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Vendedor</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {sellers.map(seller => (
                  <label key={seller.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={localFilters.seller.includes(seller.id)}
                      onChange={(e) => handleArrayFilterChange('seller', seller.id, e.target.checked)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{seller.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Ordenar por</h3>
              <select
                value={localFilters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="relevance">Relevancia</option>
                <option value="price_asc">Precio: menor a mayor</option>
                <option value="price_desc">Precio: mayor a menor</option>
                <option value="rating">Mejor valorados</option>
                <option value="newest">Más nuevos</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FiltersDrawer;
