# 🎨 Rediseño Visual - Home/Landing Nido

## Estructura Completa

```
┌─────────────────────────────────────────────────────────────────┐
│ NAVBAR                                                          │
│ [N] Nido  [Buscar por ciudad...]   Ingresar  [Publicar →]     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ HERO SECTION                                                    │
│                                                                  │
│     Encuentra tu próximo hogar                                   │
│     Arriendo residencial · Colombia                              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ¿Dónde?      | Presupuesto  | Habitaciones     [Buscar →] │ │
│  │ Ciudad       | Canon       | Cualquiera                    │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ FILTROS RÁPIDOS (Scrolleable)                                   │
│ [Todo] [Apartamento] [Casa] [Estudio] [Amoblado] [Mascotas OK] │
│        [Con parqueadero]                                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 148 propiedades en Colombia                                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ GRID DE PROPIEDADES (Auto-fill 240px)                           │
│                                                                  │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐                │
│  │ [Nuevo]│  │        │  │        │  │        │                │
│  │ ╱      │  │        │  │        │  │        │                │
│  │ [♡]    │  │        │  │        │  │        │                │
│  │━━━━━━━━│  │        │  │        │  │        │                │
│  │Casa A  │  │        │  │        │  │        │                │
│  │La Soledad ★ 4.9  │        │  │        │                │
│  │2 hab · 1 baño · 58m²     │  │        │                │
│  │ [Amoblado] [Parquead.]   │  │        │                │
│  │$1.800.000 / mes│        │  │        │                │
│  └────────┘  └────────┘  └────────┘  └────────┘                │
│                                                                  │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐                │
│  │        │  │        │  │        │  │        │                │
│  │[Popular]  │        │  │        │  │        │                │
│  │        │  │        │  │        │  │        │                │
│  └────────┘  └────────┘  └────────┘  └────────┘                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ FOOTER                                                          │
│ © 2026 Nido · Arriendo residencial   Bogotá  Medellín  Cali    │
└─────────────────────────────────────────────────────────────────┘
```

## Componentes Principales

### 1. Navbar
**Estados:**
- Logo verde (#1a3d2e) con "N" blanca
- Search bar compacta en el centro
- Botones derecha: "Ingresar" (ghost) + "Publicar" (verde)

**Responsive:**
- Desktop: Todo horizontal, search visible
- Tablet: Search bar ocupa más espacio
- Mobile: Menu hamburguesa, search collapsa

### 2. Hero Section
**Tipografía:**
- Título: 26px, font-weight 500, color #1c1a16
- Subtítulo: 14px, font-weight 400, color #6f6a63

**Búsqueda:**
- 3 campos con divisores verticales 0.5px
- Botón "Buscar →" verde (#1a3d2e)
- Ancho máximo: 680px

### 3. Quick Filters
**Estilos:**
- Inactivo: fondo blanco, borde 0.5px, texto gris
- Activo: fondo #1a3d2e, texto blanco
- Scrolleable horizontalmente

### 4. Property Card
**Estructura:**
```
┌─ Imagen 160px ─────────┐
│ [Nuevo]          [♡]   │
├────────────────────────┤
│ Título · Barrio    ★4.9 │
│ 2 hab · 1 baño · 58m²   │
│ [Amoblado] [Parquead.]  │
│ $1.800.000 / mes       │
└────────────────────────┘
```

**Hover:**
- Escala 1.01
- Borde más visible

**Interacción:**
- Botón ♡ toggleable (guardado/no guardado)
- Click en tarjeta: va a `/properties/:id`

### 5. Footer
**Contenido:**
- Copyright línea única
- Ciudades principales espaciadas

**Estilos:**
- Borde superior 0.5px
- Fondo blanco
- Padding 32px 24px

## Colores Utilizados

```css
--brand: #1a3d2e              /* Verde principal */
--text: #1c1a16               /* Texto oscuro */
--muted: #6f6a63              /* Texto secundario */
--border: rgba(54, 50, 42, 0.12)  /* Bordes sutiles */
--surface-soft: #ece7dd       /* Fondo gris claro */
--bg: #f4f1eb                 /* Fondo página */
```

## Comportamientos Dinámicos

### 1. Filtros Chips
```javascript
onClick → setActiveFilter(filter.id)
→ filteredProperties actualiza
→ Grid se renderiza nuevamente
```

### 2. Favoritos Local
```javascript
onClick en ♡ → setState Set<property.id>
→ Icono se llena de color
→ (Nota: local por ahora, integrar con API según necesidad)
```

### 3. Búsqueda
```javascript
onSubmit form → handleSearch()
→ navigate(`/properties?city=X&minRent=Y&bedrooms=Z`)
→ Redirige a SearchPage
```

## Responsive Breakpoints

### Desktop (1080px+)
- Grid: repeat(auto-fill, minmax(240px, 1fr))
- Navbar: todo visible
- Search: máximo 300px

### Tablet (768px - 1079px)
- Grid: repeat(auto-fill, minmax(200px, 1fr))
- Navbar: compacta
- Search: ancho variable

### Mobile (< 768px)
- Grid: repeat(auto-fill, minmax(160px, 1fr))
- Navbar: menu hamburguesa
- Search bar: se expande verticalmente
- Filtros: scrolleable horizontal
- Footer: stack vertical

## Performance Optimizations

✅ **CSS-only animations** - No requiere JS
✅ **Grid auto-fill** - Responsive sin queries complejas  
✅ **Lazy loading ready** - Estructura preparada
✅ **Semantic HTML** - Accesible y SEO-friendly
✅ **No external fonts nuevas** - Usa lo que existe (Manrope)

## Testing Checklist

```
NAVBAR
□ Logo visible y linkeable
□ Search funciona
□ Botones de acción visibles
□ Menu hamburguesa aparece en mobile

HERO
□ Título "Encuentra tu próximo hogar" visible
□ Barra búsqueda con 3 campos
□ Botón Buscar navega a /properties

FILTROS
□ Chips clickeables
□ Color cambia cuando activo
□ Scroll horizontal en mobile

GRID
□ Propiedades cargan desde API
□ Grid responsive (240px desktop)
□ Hover sutil (1.01 scale)
□ Botón ♡ toggleable

FOOTER
□ Footer visible
□ Ciudades alineadas

RESPONSIVE
□ Mobile: todos elementos legibles
□ Tablet: grid se adapta
□ Desktop: layout completo visible
```

## Próximos Pasos (Opcional)

1. **Integración de favoritos**: Guardar en backend
2. **Animaciones**: Transiciones suaves en tarjetas
3. **Analytics**: Tracking de clicks en filtros
4. **A/B Testing**: Variantes de colores
5. **SSR Optimization**: Pre-render tarjetas en servidor
