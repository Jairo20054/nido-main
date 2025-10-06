# TODO: Transformar Remodelaciones a Feed Social

## Pasos para Implementar

### 1. Actualizar Estructura de Datos y Estados
- [x] Cambiar `projects` por `posts` con nueva estructura (usuario, contenido, medios, interacciones)
- [x] Actualizar estados: `selectedPost` en lugar de `selectedProject`
- [x] Agregar nuevos estados para interacciones (likes, comentarios)

### 2. Agregar Nuevos Íconos
- [x] HeartIcon para likes
- [x] CommentIcon para comentarios
- [x] ShareIcon para compartir
- [x] PlayIcon para videos
- [x] VerifiedIcon para usuarios verificados
- [x] ThreeDotsIcon para menú de opciones

### 3. Actualizar Lógica de Componente
- [x] Cambiar `handleProjectClick` por `handlePostClick`
- [x] Actualizar filtros para publicaciones
- [x] Implementar lógica de likes y comentarios (mock)
- [x] Agregar soporte para videos (embed YouTube)

### 4. Rediseñar UI del Feed
- [x] Crear tarjetas de publicación con encabezado de usuario
- [x] Implementar carrusel de imágenes
- [x] Agregar reproductor de video
- [x] Botones de interacción (like, comment, share)
- [x] Etiquetas de categoría en publicaciones

### 5. Actualizar Modal de Detalles
- [x] Cambiar a vista detallada de publicación
- [x] Agregar sección de comentarios
- [x] Expandir galería de medios
- [x] Botones de acción (seguir, compartir)

### 6. Actualizar Encabezado y Estadísticas
- [x] Cambiar subtítulo a enfoque comunitario
- [x] Actualizar estadísticas a métricas sociales
- [x] Mantener filtros de categoría

### 7. Crear/Actualizar CSS
- [x] Estilos para feed social
- [x] Diseño responsivo para móvil y desktop
- [x] Animaciones y transiciones
- [x] Tema visual coherente

### 8. Pruebas y Ajustes
- [ ] Verificar funcionalidad en diferentes dispositivos
- [ ] Asegurar accesibilidad
- [ ] Optimizar rendimiento
