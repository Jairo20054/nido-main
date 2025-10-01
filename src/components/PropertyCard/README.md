# PropertyCard Component

Componente moderno de tarjeta de propiedad diseñado específicamente para aplicaciones de arrendamiento inmobiliario.

## 🎨 Características de Diseño

### Tamaño y Layout
- **Dimensiones**: 380-420px de ancho, altura dinámica
- **Grid**: 2 columnas en desktop, 1 columna en móvil
- **Responsive**: Adaptación completa a todos los dispositivos

### Elementos Visuales
- **Imagen principal**: 280px de altura con efecto zoom en hover
- **Carrusel**: Navegación entre múltiples imágenes
- **Badges**: Superhost, Nuevo, Pet-friendly
- **Gradiente overlay**: Efecto sutil en hover
- **Sombras**: Elevación suave con transiciones

### Contenido
- Título de la propiedad
- Ubicación con icono
- Rating con estrellas y número de reviews
- Descripción corta (máx. 80 caracteres)
- Características: habitaciones, baños, huéspedes
- Precio destacado por noche
- Información del host con avatar

### Interactividad
- **Hover**: Elevación de tarjeta, zoom de imagen, aparición de botones
- **Botones de acción**: Like, Share, Ver detalles, Contactar
- **Carrusel**: Navegación con flechas e indicadores
- **Animaciones**: Framer Motion para transiciones suaves

## 📦 Props

```javascript
PropertyCard.propTypes = {
  property: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    location: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    images: PropTypes.arrayOf(PropTypes.string).isRequired,
    rating: PropTypes.number,
    reviewCount: PropTypes.number,
    bedrooms: PropTypes.number,
    bathrooms: PropTypes.number,
    maxGuests: PropTypes.number,
    isSuperhost: PropTypes.bool,
    isNew: PropTypes.bool,
    isPetFriendly: PropTypes.bool,
    host: PropTypes.shape({
      name: PropTypes.string,
      avatar: PropTypes.string,
      verified: PropTypes.bool
    })
  }).isRequired,
  onViewDetails: PropTypes.func,
  onContact: PropTypes.func,
  onLike: PropTypes.func,
  onShare: PropTypes.func,
  isLiked: PropTypes.bool
}
```

## 🚀 Uso

```jsx
import PropertyCard from './components/PropertyCard/PropertyCard';

function MyComponent() {
  const handleViewDetails = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  const handleContact = (propertyId) => {
    // Abrir modal de contacto
  };

  const handleLike = (propertyId) => {
    // Toggle like
  };

  const handleShare = (propertyId) => {
    // Compartir propiedad
  };

  return (
    <PropertyCard
      property={{
        id: 1,
        title: "Apartamento en Zona Rosa",
        description: "Hermoso apartamento con vista a la ciudad",
        location: "Zona Rosa, Bogotá",
        price: 120000,
        images: [
          "https://example.com/image1.jpg",
          "https://example.com/image2.jpg"
        ],
        rating: 4.8,
        reviewCount: 45,
        bedrooms: 2,
        bathrooms: 2,
        maxGuests: 4,
        isSuperhost: true,
        isNew: false,
        isPetFriendly: true,
        host: {
          name: "María González",
          avatar: "https://example.com/avatar.jpg",
          verified: true
        }
      }}
      onViewDetails={handleViewDetails}
      onContact={handleContact}
      onLike={handleLike}
      onShare={handleShare}
      isLiked={false}
    />
  );
}
```

## 🎨 Personalización CSS

### Variables CSS Disponibles

```css
:root {
  --primary-color: #2563eb;
  --primary-hover: #1d4ed8;
  --accent-color: #ff3b72;
  --success-color: #10b981;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --bg-white: #ffffff;
  --border-color: #e2e8f0;
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --radius-xl: 20px;
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Clases Modificadoras

- `.property-card--loading`: Estado de carga con shimmer effect
- `.property-card:hover`: Estado hover con elevación

## 📱 Responsive Breakpoints

- **Desktop**: > 1024px - Grid de 2-3 columnas
- **Tablet**: 768px - 1024px - Grid de 2 columnas
- **Mobile**: < 768px - Grid de 1 columna

## ♿ Accesibilidad

- Roles ARIA apropiados
- Labels descriptivos en botones
- Navegación por teclado
- Contraste de colores WCAG AA
- Alt text en imágenes
- Focus visible en elementos interactivos

## 🌙 Dark Mode

Soporte automático para modo oscuro usando `prefers-color-scheme`:

```css
@media (prefers-color-scheme: dark) {
  /* Estilos dark mode */
}
```

## 🎭 Animaciones

Todas las animaciones usan Framer Motion:

- Fade in al montar
- Hover elevation
- Button tap feedback
- Image carousel transitions
- Like heart animation

## 🔧 Optimizaciones

- Lazy loading de imágenes
- Preload de imagen siguiente en carrusel
- Transiciones GPU-accelerated
- Debounce en eventos de hover
- Memoización con React.memo (recomendado)

## 📝 Notas de Implementación

1. **Imágenes**: Usar URLs optimizadas (WebP, tamaños apropiados)
2. **Performance**: Implementar virtualización para listas largas
3. **SEO**: Agregar structured data para propiedades
4. **Analytics**: Trackear interacciones (clicks, likes, shares)

## 🐛 Troubleshooting

### Las imágenes no cargan
- Verificar URLs válidas
- Comprobar CORS headers
- Usar fallback images

### Animaciones lentas
- Reducir número de tarjetas renderizadas
- Implementar virtualización
- Optimizar imágenes

### Grid no se adapta
- Verificar CSS Grid support
- Comprobar breakpoints
- Revisar padding/margin del contenedor

## 📚 Recursos

- [Framer Motion Docs](https://www.framer.com/motion/)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
