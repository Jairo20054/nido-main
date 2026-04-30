# 🚀 Cómo Ver el Rediseño

## Requisitos Previos

1. **Backend corriendo** (puerto 5000)
   ```bash
   npm start
   ```
   O en otra terminal:
   ```bash
   npm run dev:server
   ```

2. **Base de datos accesible** (PostgreSQL en 5433)
   ```bash
   docker-compose up -d
   ```

## Iniciar Frontend (Desarrollo)

En una terminal nueva:

```bash
npm run dev:client
```

Esto inicia Vite en `http://localhost:5173`

## Verificar los Cambios

### Opción 1: Verificación Automática
```bash
node scripts/verify-redesign.js
```
Esto chequea que todos los archivos fueron actualizados correctamente.

### Opción 2: Ver en el Navegador

1. Abre `http://localhost:5173`
2. Deberías ver:
   - ✅ Navbar blanca con logo verde y search compacta
   - ✅ Hero section minimalista con título "Encuentra tu próximo hogar"
   - ✅ Barra búsqueda con 3 campos (¿Dónde? | Presupuesto | Habitaciones)
   - ✅ Chips de filtros horizontales
   - ✅ Grid de propiedades con tarjetas redeseñadas
   - ✅ Footer minimalista

## Testing Detallado

### Test 1: Navbar
```
Esperado:
- Logo verde "N" con "Nido" al lado
- Search bar central tipo pill
- Botón "Ingresar" (ghost)
- Botón "Publicar" (verde sólido)

Interacción:
- Escribe en search: "Bogotá"
- Presiona Enter → va a /properties?city=Bogotá
```

### Test 2: Hero Section
```
Esperado:
- Texto "Encuentra tu próximo hogar" (26px máx)
- Subtítulo "Arriendo residencial · Colombia"
- Barra búsqueda con divisores |

Interacción:
- Llena: ¿Dónde? = "Medellín"
- Llena: Presupuesto = "2000000"
- Llena: Habitaciones = "3"
- Click Buscar → navega con parámetros
```

### Test 3: Filtros Rápidos
```
Esperado:
- Chips: Todo, Apartamento, Casa, Estudio, Amoblado, Mascotas OK, Parqueadero
- "Todo" es el activo por defecto (fondo #1a3d2e)
- Scrolleable horizontalmente

Interacción:
- Click "Apartamento" → fondo verde, filtra propiedades
- Click "Amoblado" → filtra amoblados
- El grid se actualiza dinámicamente
```

### Test 4: Grid de Propiedades
```
Esperado:
- Tarjetas en grid responsive (240px desktop)
- Cada tarjeta con:
  - Imagen 160px
  - Badge "Nuevo" o "Popular" (si aplica)
  - Botón ♡ arriba-derecha
  - Título + barrio
  - Rating ★
  - Metadata (hab, baño, m²)
  - Tags (Amoblado, etc.)
  - Precio

Interacción:
- Hover sobre tarjeta → escala 1.01 + borde más visible
- Click ♡ → se llena de color (guardado)
- Click tarjeta → navega a /properties/:id
```

### Test 5: Responsive
```
Desktop (1200px+):
- Grid: 4-5 columnas
- Todo visible, sin scroll horizontal

Tablet (768px - 1199px):
- Grid: 2-3 columnas
- Navbar compacta
- Todo se ve bien

Mobile (<768px):
- Menu hamburguesa en navbar
- Grid: 2-3 columnas pequeñas
- Search bar se expande verticalmente
- Filtros scrollean horizontalmente
- Footer en stack vertical
```

## Verificar Código

### Archivos Modificados

```bash
# Ver HomePage rediseñado
cat src/features/home/HomePage.jsx | grep "home-"

# Ver Navbar actualizada
cat src/components/layout/SiteHeader.jsx | grep "site-header__search"

# Ver Footer minimalista
cat src/components/layout/SiteFooter.jsx | grep "site-footer__"

# Ver estilos nuevos
grep -n "\.home-" src/styles/app.css | head -20
```

## Troubleshooting

### El grid no se ve
```
✓ Verificar que el API retorna propiedades
  → Abre DevTools → Network → /properties/featured
  → Verifica que hay datos en response

✓ Verificar que LoadingState aparece mientras carga
```

### Los filtros no funcionan
```
✓ Abre DevTools → Console
✓ Verifica que activeFilter cambia al hacer click
✓ Verifica que filteredProperties se actualiza
```

### Los botones ♡ no cambian
```
✓ Es normal que sea solo local (sin backend)
✓ El estado se mantiene mientras recargas la página
✓ Si necesitas persistencia, conecta con API
```

### La navbar se ve diferente
```
✓ Limpia cache: Ctrl+Shift+Del (Chrome) o Cmd+Shift+Del (Mac)
✓ Hard refresh: Ctrl+Shift+R (Windows) o Cmd+Shift+R (Mac)
```

## Comparar Antes/Después

### Antes (Viejo Design)
- Hero gigante con tipografía serif (Fraunces)
- Layout 2 columnas (contenido + panel)
- Features cards en el lado derecho
- Mucho texto marketing
- Footer con metadata

### Después (Nuevo Design)
- Hero minimalista (26px máx, Manrope)
- Layout single column fluido
- Filtros interactivos arriba de grid
- Grid de 240px responsive
- Footer limpio y elegante

## Browser DevTools

### Console Debugging

```javascript
// Ver propiedades cargadas
window.__NIDO_DEBUG__ = true

// Verificar activeFilter
// (Abre la página y revisa el estado en React DevTools)

// Test de navegación
window.location.href = "/properties?city=Bogot%C3%A1"
```

### React DevTools
1. Instala extensión React DevTools
2. Abre DevTools → Components
3. Busca `<HomePage />`
4. Expande y revisa state:
   - `properties` → debe tener array de propiedades
   - `activeFilter` → debe cambiar al hacer click en chips
   - `favorites` → debe ser un Set con IDs

## Performance Testing

```bash
# Build optimizado
npm run build

# Preview local del build
npm run preview

# Lighthouse audit
# Abre DevTools → Lighthouse → Generate report
```

## Notas Finales

✅ **Rediseño 100% completo**
✅ **Totalmente responsive**
✅ **Sin librerías nuevas**
✅ **Integrado con API existente**
✅ **Estilos CSS puros**

**¿Preguntas?** Revisa REDESIGN_HOME_COMPLETE.md y VISUAL_GUIDE.md
