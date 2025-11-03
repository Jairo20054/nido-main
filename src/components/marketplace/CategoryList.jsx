import React from 'react';

const CategoryList = ({ selectedCategory, onCategorySelect }) => {
  const categories = [
    { id: 'all', name: 'Todas las categorías', icon: '🛍️' },
    { id: 'electronics', name: 'Electrónicos', icon: '📱' },
    { id: 'home', name: 'Hogar y Jardín', icon: '🏠' },
    { id: 'fashion', name: 'Moda y Accesorios', icon: '👗' },
    { id: 'sports', name: 'Deportes', icon: '⚽' },
    { id: 'books', name: 'Libros', icon: '📚' },
    { id: 'toys', name: 'Juguetes', icon: '🧸' },
    { id: 'automotive', name: 'Automotriz', icon: '🚗' },
    { id: 'health', name: 'Salud y Belleza', icon: '💄' },
    { id: 'office', name: 'Oficina', icon: '💼' },
  ];

  return (
    <div className="space-y-2">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategorySelect(category.id)}
          className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 flex items-center gap-3 ${
            selectedCategory === category.id
              ? 'bg-blue-100 text-blue-700 font-medium'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span className="text-lg">{category.icon}</span>
          <span className="text-sm">{category.name}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryList;
