# TODO: Corrección de Responsividad y Layout Shifts en Nido App

## Información Recopilada
- **Componentes principales revisados**: Header, Layout, PropertyCard, Home, Property, BookingWidget, modales
- **Problemas identificados**:
  - PropertyCard.css: width: 200% incorrecto (debe ser 100%)
  - Carousel de imágenes con position absolute/opacity toggle sin reserva de espacio
  - Manipulación de body.style.overflow en Header sin cleanup adecuado en navegación
  - Falta useLayoutEffect en manipulación de layout
  - Z-index inconsistente en modales
  - Dimensiones fijas en imágenes sin aspect-ratio
  - Animaciones framer-motion potencialmente causando shifts
  - IntersectionObserver sin cleanup en Property

## Plan de Corrección

### 1. Correcciones CSS/HTML
- [ ] src/components/PropertyCard/PropertyCard.css: Corregir width: 200% → 100%
- [ ] src/components/PropertyCard/PropertyCard.css: Implementar aspect-ratio para imágenes
- [ ] src/components/PropertyCard/PropertyCard.css: Mejorar carousel con transform en lugar de opacity
- [ ] src/components/common/Header/Header.css: Verificar z-index escala
- [ ] src/assets/styles/global.css: Confirmar box-sizing global
- [ ] Crear src/assets/styles/layout.css con utilidades (.container, .row, .col)

### 2. Correcciones React/JS
- [ ] src/components/common/Header/Header.jsx: Mejorar cleanup de body overflow con useLayoutEffect
- [ ] src/pages/Property/Property.jsx: Cleanup de IntersectionObserver
- [ ] src/components/PropertyCard/PropertyCard.jsx: Optimizar carousel con useLayoutEffect
- [ ] Verificar keys estables en listas de propiedades
- [ ] Añadir ResizeObserver donde sea necesario

### 3. Responsive
- [ ] Definir breakpoints consistentes: 320, 375, 425, 768, 1024, 1280, 1440
- [ ] Ajustar media queries en todos los componentes
- [ ] Verificar comportamiento hamburger menu
- [ ] Prevenir horizontal overflow en mobile

### 4. Pruebas/Validación
- [ ] Crear tests Playwright/Cypress para navegación home → detail → back
- [ ] Tests de viewport resize
- [ ] Verificar CLS con Lighthouse
- [ ] Snapshots visuales

### 5. Extras
- [ ] Implementar CSS reset mejorado
- [ ] Añadir will-change con moderación
- [ ] Optimizar performance de animaciones

## Dependencias
- PropertyCard.css depende de PropertyCard.jsx
- Header.jsx depende de Layout.jsx
- Tests dependen de todas las correcciones

## Followup Steps
- [ ] Ejecutar tests después de correcciones
- [ ] Verificar en DevTools layout shifts
- [ ] Medir CLS con Lighthouse
- [ ] Pruebas manuales en diferentes viewports
