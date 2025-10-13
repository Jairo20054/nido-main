# TODO: Modificar Home al estilo Facebook con API real

## Pendientes

### Backend
- [x] Añadir endpoint POST /api/contact en propertyController.js y propertyRoutes.js

### Frontend - Home Page
- [x] Modificar Home.jsx para consumir API real (GET /api/listings, POST /api/listings, GET /api/listings/:id)
- [x] Añadir búsqueda por texto y filtros simples (precio, habitaciones) en Home.jsx
- [x] Actualizar Home.css con diseño Facebook-style completo usando variables CSS

### Componentes
- [ ] Adaptar LeftSidebar.jsx para navegación enfocada en propiedades (buscar, mis propiedades, favoritos, etc.)
- [ ] Modificar RightSidebar.jsx para destacados de propiedades (propiedades premium, recientes, etc.)
- [ ] Ajustar PostCard.jsx para mejor presentación en feed si es necesario
- [ ] Modificar CreatePost.jsx para crear listings en lugar de posts sociales

### Integración y Testing
- [ ] Verificar integración completa con API real
- [ ] Verificar responsive design y accesibilidad
- [ ] Probar funcionalidad de búsqueda y filtros
- [ ] Probar creación de listings y formulario de contacto
