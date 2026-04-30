# TODO - Transformar Nido en Experiencia de Red Social

## Análisis del Estado Actual
- [x] Revisar estructura actual de la app
- [x] Identificar dependencias existentes (React 19, Router v7, Framer Motion, Zustand, etc.)
- [x] Evaluar componentes existentes (PostCard, Layout, Header, LeftSidebar)
- [x] Analizar rutas actuales

## Fase 1: Fundación y Navegación (Semana 1)
- [ ] Crear componente BottomNav - Navegación mobile-first (Home, Reels, Publicar, Servicios, Perfil)
- [ ] Transformar Layout - Remover LeftSidebar, agregar BottomNav para móvil
- [ ] Actualizar routing - Agregar nuevas rutas sociales (/reels, /post/new, /profile/:username, /story/:id)
- [ ] Crear configuración CSS - Variables de diseño social

## Fase 2: Características Sociales Principales (Semana 2-3)
- [ ] Componente ReelsViewer - Reproductor de video vertical con autoplay, doble-tap like
- [ ] Componente Composer - Subida de media con drag & drop, preview, caption
- [ ] StoriesBar & StoriesModal - Historias estilo Instagram con barras de progreso
- [ ] PostCard mejorado - Agregar interacciones sociales, comentarios, shares

## Fase 3: Interacciones Sociales y Perfiles (Semana 4)
- [ ] Páginas de perfil - Perfiles de usuario con seguidores, grid de posts, pestañas
- [ ] Interacciones sociales - Likes, comentarios, follows, saves con UI optimista
- [ ] Componente MapPreview - Mapa interactivo con pins de propiedades
- [ ] Componente ServiceCard - Integración con marketplace

## Fase 4: Pulido y Rendimiento (Semana 5)
- [ ] Virtualización - Implementar para feeds y reels
- [ ] Animaciones - Agregar transiciones con Framer Motion
- [ ] Accesibilidad - Etiquetas ARIA, navegación por teclado
- [ ] Testing - Tests unitarios y E2E

## Componentes Clave a Crear/Modificar
1. **BottomNav** - Barra de navegación móvil
2. **ReelsViewer** - Reproductor de video vertical
3. **Composer** - Interfaz de subida de media
4. **StoriesBar/StoriesModal** - Funcionalidad de stories
5. **Componentes de perfil** - Perfiles de usuario
6. **PostCard mejorado** - Interacciones sociales
7. **MapPreview** - Mapa interactivo
8. **ServiceCard** - Tarjetas de marketplace

## Tokens de Diseño a Implementar
- **Colores**: #FFFFFF fondo, #FBFBFB tarjetas, #FF3B72 acento, #111827 texto
- **Tipografía**: Fuentes Poppins + Inter
- **Espaciado**: Base 4px, border-radius 12px
- **Soporte para modo oscuro**

## Estado del Proyecto
- **Inicio**: Enero 2024
- **Progreso Actual**: Fase 1 en desarrollo
- **Objetivo**: Completar transformación en 5 semanas

## Progreso Actual - Fase 1
- [x] Análisis completado
- [ ] BottomNav en desarrollo
- [ ] Layout transformation pendiente
- [ ] Routing updates pendiente
- [ ] CSS variables pendiente
