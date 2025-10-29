import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { marketplaceApi } from '../../services/marketplaceApi';
import './CategoryList.css';

const CategoryList = ({ selectedCategory, onCategorySelect, className = '' }) => {
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await marketplaceApi.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleCategoryClick = (categoryId) => {
    if (selectedCategory === categoryId) {
      onCategorySelect('all'); // Deselect if already selected
    } else {
      onCategorySelect(categoryId);
    }
  };

  const handleSubcategoryClick = (categoryId, subcategory) => {
    onCategorySelect(categoryId, subcategory);
  };

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`category-list ${className}`}>
      {/* All Categories Button */}
      <button
        onClick={() => onCategorySelect('all')}
        className={`category-item ${selectedCategory === 'all' || !selectedCategory ? 'active' : ''}`}
      >
        <span className="text-lg mr-2">🏠</span>
        Todas las categorías
      </button>

      {/* Category List */}
      {categories.map((category) => {
        const isSelected = selectedCategory === category.id;
        const hasSelectedSubcategory = category.subcategories.some(sub =>
          selectedCategory === `${category.id}-${sub}`
        );

        return (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`category-item ${isSelected || hasSelectedSubcategory ? 'active' : ''}`}
          >
            <span className="text-lg mr-2" aria-hidden="true">{category.icon}</span>
            {category.label}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryList;
