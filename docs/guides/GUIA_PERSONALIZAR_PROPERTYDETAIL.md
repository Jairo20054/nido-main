# 📖 GUÍA: Personalizar PropertyDetail Modal

**Archivo Principal**: `src/components/common/PropertyDetail/PropertyDetail.jsx`

---

## 🎨 Cómo Cambiar Colores

### En PropertyDetail.jsx
```javascript
// Cambiar color del botón "Reservar Ahora"
<button className="btn-primary">
  Reservar Ahora
</button>
```

### En PropertyDetail.css
```css
/* Cambiar color gradient del botón primario */
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* Cambiar a tu color */
.btn-primary {
  background: linear-gradient(135deg, #YOUR_COLOR1 0%, #YOUR_COLOR2 100%);
}
```

---

## 📝 Cómo Agregar Más Amenidades

### En PropertyDetail.jsx

**Antes**:
```javascript
<div className="amenities-grid">
  <div className="amenity">✓ WiFi Gratis</div>
  <div className="amenity">✓ Aire Acondicionado</div>
  <div className="amenity">✓ Cocina</div>
  <div className="amenity">✓ TV por Cable</div>
  <div className="amenity">✓ Estacionamiento</div>
  <div className="amenity">✓ Agua Caliente</div>
</div>
```

**Después** (agregar más):
```javascript
<div className="amenities-grid">
  <div className="amenity">✓ WiFi Gratis</div>
  <div className="amenity">✓ Aire Acondicionado</div>
  <div className="amenity">✓ Cocina</div>
  <div className="amenity">✓ TV por Cable</div>
  <div className="amenity">✓ Estacionamiento</div>
  <div className="amenity">✓ Agua Caliente</div>
  <div className="amenity">✓ Piscina</div>
  <div className="amenity">✓ Gimnasio</div>
  <div className="amenity">✓ Ascensor</div>
</div>
```

---

## 🖼️ Cómo Agregar Más Imágenes a Propiedades

### En Home.jsx
```javascript
// Actual (2 imágenes)
images: [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=500&fit=crop',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=500&fit=crop'
]

// Con más imágenes
images: [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=500&fit=crop',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=500&fit=crop',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&h=500&fit=crop',
  'https://images.unsplash.com/photo-1564582913893-77bd1e8e4a2e?w=500&h=500&fit=crop'
]
```

Los indicadores se actualizan automáticamente! 🎉

---

## 🎭 Cómo Cambiar Descripciones

### En PropertyDetail.jsx
```javascript
{/* Cambiar esta sección */}
<div className="description-section">
  <h3>Acerca de esta propiedad</h3>
  <p>
    Una hermosa {property.type.toLowerCase()} ubicada en {property.location}. 
    Con {property.bedrooms} dormitorio{property.bedrooms > 1 ? 's' : ''}, 
    {property.bathrooms} baño{property.bathrooms > 1 ? 's' : ''} y {property.sqft}m² de espacio.
    Perfectoa para tu estancia.
  </p>
</div>

{/* Por ejemplo, a esta */}
<div className="description-section">
  <h3>Sobre esta propiedad</h3>
  <p>
    Disfruta de lujo y comodidad en esta increíble {property.type.toLowerCase()} 
    ubicada en el corazón de {property.location}. Ideal para familias o grupos.
    Ubicación estratégica cerca de centros comerciales y restaurantes.
  </p>
</div>
```

---

## ⚙️ Cómo Integrar Datos Reales

### Opción 1: Desde Backend API

```javascript
import React, { useState, useEffect } from 'react';

const PropertyDetail = ({ property, onClose }) => {
  const [fullProperty, setFullProperty] = useState(null);

  useEffect(() => {
    // Traer datos completos desde API
    fetch(`/api/properties/${property.id}`)
      .then(res => res.json())
      .then(data => setFullProperty(data))
      .catch(err => console.error(err));
  }, [property.id]);

  if (!fullProperty) return <div>Cargando...</div>;

  return (
    // ... resto del código
  );
};
```

### Opción 2: Desde Firebase

```javascript
import { db } from '../config/firebase';

useEffect(() => {
  const docRef = doc(db, 'properties', property.id);
  const unsubscribe = onSnapshot(docRef, (doc) => {
    setFullProperty(doc.data());
  });

  return unsubscribe;
}, [property.id]);
```

---

## 🎬 Cómo Cambiar Animaciones

### En PropertyDetail.css

**Cambiar velocidad de fade-in**:
```css
/* Actual: 0.3s */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Cambiar a 0.5s */
animation: fadeIn 0.5s ease;
```

**Cambiar slide direction**:
```css
/* Actual: viene de abajo (slideUp) */
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Cambiar a desde la izquierda */
@keyframes slideFromLeft {
  from { transform: translateX(-30px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.property-detail-modal {
  animation: slideFromLeft 0.3s ease;
}
```

---

## 🎯 Cómo Agregar Nuevas Secciones

### Agregar Sección de "Huésped"

```javascript
{/* Agregar después de amenidades */}
<div className="host-section">
  <h3>Tu Anfitrión</h3>
  <div className="host-card">
    <img src="https://example.com/avatar.jpg" alt="Host" className="host-avatar" />
    <div>
      <div className="host-name">Juan Pérez</div>
      <div className="host-rating">⭐ 4.9 (125 reseñas)</div>
      <button className="btn-secondary">Contactar Anfitrión</button>
    </div>
  </div>
</div>
```

### CSS para host-section
```css
.host-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.host-card {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.host-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.host-name {
  font-weight: 700;
  color: #111827;
}

.host-rating {
  color: #6b7280;
  font-size: 0.9rem;
}
```

---

## 🔄 Cómo Agregar Reviews

### Agregar Sección de Reviews

```javascript
{/* Antes de amenidades */}
<div className="reviews-section">
  <h3>Reseñas ({property.reviewCount})</h3>
  <div className="reviews-list">
    <div className="review-card">
      <div className="review-header">
        <div className="reviewer-name">María García</div>
        <div className="review-rating">⭐⭐⭐⭐⭐</div>
      </div>
      <p className="review-text">
        "Excelente propiedad, muy limpia y bien ubicada. El anfitrión fue muy atento. 
        Volvería sin dudarlo."
      </p>
      <div className="review-date">Hace 2 semanas</div>
    </div>

    <div className="review-card">
      <div className="review-header">
        <div className="reviewer-name">Carlos López</div>
        <div className="review-rating">⭐⭐⭐⭐</div>
      </div>
      <p className="review-text">
        "Buena propiedad en general. Lo único es que el WiFi fue lento a veces."
      </p>
      <div className="review-date">Hace 1 mes</div>
    </div>
  </div>
</div>
```

### CSS para reviews
```css
.reviews-section {
  margin-bottom: 2rem;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.review-card {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #ff3b72;
}

.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.reviewer-name {
  font-weight: 700;
  color: #111827;
}

.review-text {
  color: #6b7280;
  margin: 0.5rem 0;
  line-height: 1.6;
  font-size: 0.95rem;
}

.review-date {
  color: #9ca3af;
  font-size: 0.85rem;
}
```

---

## 📱 Cómo Hacer Más Responsivo

### En PropertyDetail.css - Agregar Mobile Optimizations

```css
@media (max-width: 480px) {
  /* Título más pequeño */
  .property-title {
    font-size: 1.25rem;
  }

  /* Precio más pequeño */
  .price {
    font-size: 1.5rem;
  }

  /* Grid en 1 columna */
  .features-grid {
    grid-template-columns: 1fr;
  }

  /* Modal full-screen */
  .property-detail-modal {
    width: 100%;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
  }

  /* Galería más pequeña */
  .property-detail-gallery {
    max-height: 250px;
  }

  /* Header sticky */
  .property-detail-header {
    position: sticky;
    top: 0;
  }
}
```

---

## 🎁 Cómo Agregar Favoritos Persistentes

### Con localStorage

```javascript
import React, { useState, useEffect } from 'react';

const PropertyDetail = ({ property, onClose }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    // Cargar desde localStorage
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    setIsFavorite(favorites.includes(property.id));
  }, [property.id]);

  const handleToggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
    if (isFavorite) {
      // Remover
      const filtered = favorites.filter(id => id !== property.id);
      localStorage.setItem('favorites', JSON.stringify(filtered));
    } else {
      // Agregar
      localStorage.setItem('favorites', JSON.stringify([...favorites, property.id]));
    }
    
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="property-detail-overlay">
      <div className="property-detail-modal">
        <div className="property-detail-header">
          <div className="header-controls">
            <button className="control-btn" onClick={handleToggleFavorite}>
              <Heart
                size={24}
                fill={isFavorite ? '#ff3b72' : 'none'}
                color={isFavorite ? '#ff3b72' : '#6b7280'}
              />
            </button>
          </div>
          {/* resto del modal */}
        </div>
      </div>
    </div>
  );
};
```

---

## 🔗 Cómo Integrar Compartir en Redes

### Agregar ShareButtons

```javascript
const handleShare = () => {
  const url = `${window.location.origin}/property/${property.id}`;
  const text = `Mira esta propiedad: ${property.title} en ${property.location}`;

  // Copiar al portapapeles
  navigator.clipboard.writeText(url);
  alert('Link copiado!');

  // O abrir en redes (si quieres)
  // window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`);
};

// En el header
<button className="control-btn" onClick={handleShare}>
  <Share2 size={24} color="#6b7280" />
</button>
```

---

## 🎬 Cómo Cambiar Textos

### Textos Hardcodeados

```javascript
// Buscar y reemplazar:

"Encuentra tu propiedad perfecta"
→ Tu título personalizado

"Explora las mejores opciones de alquiler en tu zona"
→ Tu subtítulo

"Acerca de esta propiedad"
→ "Sobre este lugar", etc

"Amenidades"
→ "Lo que ofrece", etc
```

---

## 🚀 Cómo Deploying a Producción

### Antes de deploy:

1. **Cambiar URLs de imágenes** (usar tus propias imágenes o CDN)
2. **Agregar datos reales** (conectar con API/Backend)
3. **Testear en móvil** (responsive bien)
4. **Agregar SEO** (meta tags)
5. **Testear performance** (Lighthouse)

### Build para producción
```bash
npm run build
# Upload build/ folder a tu hosting
```

---

## 📚 Recursos

- **Unsplash**: https://unsplash.com (imágenes gratis)
- **Lucide Icons**: https://lucide.dev (más iconos)
- **Tailwind Colors**: https://tailwindcss.com/docs/customizing-colors
- **CSS Animations**: https://animate.style

---

**Última actualización**: November 19, 2025

Cualquier pregunta sobre personalización, revisa los archivos:
- `PropertyDetail.jsx` - Lógica
- `PropertyDetail.css` - Estilos
- `Home.jsx` - Integración

