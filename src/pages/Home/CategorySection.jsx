import React, { useState, useEffect, useRef } from 'react';
import './CategorySection.css';

const CategorySection = () => {
  const categories = [
    {
      id: 'economicas',
      title: 'Económicas',
      description: 'Alojamientos con precios accesibles sin comprometer la comodidad',
      icon: '💰',
    },
    {
      id: 'accesibles',
      title: 'Accesibles',
      description: 'Propiedades adaptadas para personas con movilidad reducida',
      icon: '♿',
    },
    {
      id: 'familiares',
      title: 'Familiares',
      description: 'Espacios amplios y seguros para disfrutar en familia',
      icon: '👨‍👩‍👧‍👦',
    },
    {
      id: 'lujo',
      title: 'Lujo',
      description: 'Experiencias premium con servicios exclusivos',
      icon: '🌟',
    },
    {
      id: 'larga-estadia',
      title: 'Larga Estadía',
      description: 'Opciones mensuales con descuentos especiales',
      icon: '📅',
    },
    {
      id: 'pet-friendly',
      title: 'Pet Friendly',
      description: 'Propiedades que aceptan mascotas',
      icon: '🐾',
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef(null);
  const intervalRef = useRef(null);

  // Configurar el carrusel automático
  useEffect(() => {
    const startAutoScroll = () => {
      intervalRef.current = setInterval(() => {
        if (!isPaused) {
          setCurrentIndex(prev => (prev + 1) % categories.length);
        }
      }, 3000);
    };
    
    startAutoScroll();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [categories.length, isPaused]);

  // Desplazar al índice actual
  useEffect(() => {
    if (containerRef.current) {
      const cardWidth = 260; // Ancho de cada tarjeta + gap
      containerRef.current.scrollTo({
        left: currentIndex * cardWidth,
        behavior: 'smooth'
      });
    }
  }, [currentIndex]);

  // Manejar clic en una tarjeta
  const handleCardClick = (index) => {
    setCurrentIndex(index);
    setIsPaused(true);
    
    // Reanudar después de 5 segundos
    setTimeout(() => {
      setIsPaused(false);
    }, 5000);
  };

  // Manejar clic en los botones de navegación
  const handleNavClick = (direction) => {
    setIsPaused(true);
    if (direction === 'prev') {
      setCurrentIndex(prev => prev === 0 ? categories.length - 1 : prev - 1);
    } else {
      setCurrentIndex(prev => (prev + 1) % categories.length);
    }
    
    // Reanudar después de 5 segundos
    setTimeout(() => {
      setIsPaused(false);
    }, 5000);
  };

  return (
    <section className="category-section">
      <div className="category-container">
        <div className="category-header">
          <h2 className="category-title">Encuentra el alojamiento perfecto para ti</h2>
          <p className="category-subtitle">
            Explora nuestras categorías cuidadosamente seleccionadas para ofrecerte la mejor experiencia de arrendamiento
          </p>
        </div>

        <div className="category-slider-container">
          <button 
            className="slider-nav prev"
            onClick={() => handleNavClick('prev')}
            aria-label="Categoría anterior"
          >
            &lt;
          </button>
          
          <div 
            className="category-grid"
            ref={containerRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {categories.map((category, index) => (
              <div 
                key={category.id} 
                className={`category-card category-${category.id} ${currentIndex === index ? 'active' : ''}`}
                onClick={() => handleCardClick(index)}
              >
                <div className="category-card-content">
                  <div className="category-icon-container">
                    <span className="category-icon">{category.icon}</span>
                  </div>
                  <div className="category-text">
                    <h3 className="category-card-title">{category.title}</h3>
                    <p className="category-card-description">{category.description}</p>
                  </div>
                  <div className="category-card-footer">
                    <button className="category-explore-button">
                      Explorar
                      <svg xmlns="http://www.w3.org/2000/svg" className="category-arrow-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            className="slider-nav next"
            onClick={() => handleNavClick('next')}
            aria-label="Categoría siguiente"
          >
            &gt;
          </button>
        </div>

        <div className="slider-dots">
          {categories.map((_, index) => (
            <button
              key={index}
              className={`slider-dot ${currentIndex === index ? 'active' : ''}`}
              onClick={() => handleCardClick(index)}
              aria-label={`Ir a categoría ${index + 1}`}
            />
          ))}
        </div>

        <div className="category-footer">
          <button className="view-all-button">Ver todas las categorías</button>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;