# 🎨 GUÍA VISUAL - Qué VER en el Navegador

## URL
```
http://localhost:3000
```

---

## 🏠 PÁGINA HOME - ESTRUCTURA VISUAL

```
┌─────────────────────────────────────────────────────────┐
│                                                           │
│        Hero Section con Gradiente (púrpura-azul)        │
│                                                           │
│            "Explora lugares únicos" (blanco)             │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Dónde    │ Entrada │ Salida  │ Quién │ [Botón] │   │  ← SearchBar
│  └──────────────────────────────────────────────────┘   │
│                                                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                                                           │
│                    GRID DE PROPIEDADES                   │
│                                                           │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────┐ │
│  │   [IMG]  ♥│ │   [IMG]    │ │   [IMG]    │ │ IMG  │ │
│  │  ⭐ 4.8   │ │  ⭐ 4.7    │ │  ⭐ 4.9    │ │ Card │ │
│  │Apartament.│ │Casa moderna│ │Loft único  │ │  4   │ │
│  │Centro     │ │Chapinero   │ │Usaquén     │ │      │ │
│  │3 hab, 85m²│ │4 hab, 120m²│ │2 hab, 65m²│ │      │ │
│  │$2.5M/mes  │ │$3.2M/mes   │ │$1.8M/mes  │ │      │ │
│  └────────────┘ └────────────┘ └────────────┘ │      │ │
│                                                 └──────┘ │
│  (Más propiedades abajo...)                              │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 DETALLES DE CADA SECCIÓN

### 1️⃣ HERO SECTION
**Qué ver:**
- Fondo con gradiente morado-azul
- Texto blanco "Explora lugares únicos" en el centro
- Una sombra sutil sobre el fondo

**Acción:** (No interactivo, solo visual)

---

### 2️⃣ SEARCH BAR
**Ubicación:** Debajo del hero (flotante)
**Qué ver:**
```
┌─────────────────────────────────────────────────────┐
│ Dónde      ║ Entrada    ║ Salida     ║ Quién │ 🔍 │
│ [           ║ [picker]   ║ [picker]   ║ [1-8] │   │
└─────────────────────────────────────────────────────┘
```

**Colores:**
- Fondo blanco con bordes gris claro
- Botón rojo/rosa (#ff4757) en el lado derecho
- Border-radius redondeado (32px)

**Interacciones:**
- ✅ Escribir en "Dónde"
- ✅ Seleccionar fechas en "Entrada" y "Salida"
- ✅ Cambiar cantidad en "Quién"
- ✅ Click botón búsqueda filtra propiedades

---

### 3️⃣ GRID DE PROPIEDADES
**Ubicación:** Debajo del SearchBar
**Disposición:** 
- Desktop (1200px+): 4 columnas
- Tablet (768px): 2-3 columnas
- Mobile (<480px): 1 columna

**Cada Tarjeta (PropertyCard):**
```
┌──────────────────┐
│     [IMAGEN]   ♥ │  ← Botón corazón (esquina superior derecha)
│  › ⬤⬤⬤⬤ ‹       │  ← Navegación de imágenes (si hay varias)
├──────────────────┤
│ ⭐ 4.8 (48)     │  ← Rating y reseñas
│ Apartamento      │  ← Título
│ Centro, Bogotá   │  ← Ubicación
│ 3 hab, 2 baños  │  ← Especificaciones
│ $2.5M por mes    │  ← Precio
└──────────────────┘
```

**Interacciones:**
- ✅ Click corazón → guarda favorito (cambia color a rojo)
- ✅ Flechas › y ‹ → navega entre imágenes
- ✅ Click tarjeta → va a detalles de propiedad
- ✅ Hover → tarjeta se eleva ligeramente

---

## 🎨 COLORES A VER

| Elemento | Color | Código |
|----------|-------|--------|
| Hero fondo | Gradiente Púrpura-Azul | linear-gradient(135deg, #667eea 0%, #764ba2) |
| SearchBar fondo | Blanco | #ffffff |
| SearchBar botón | Rojo/Rosa | #ff4757 |
| Texto principal | Negro intenso | #222 |
| Texto secundario | Gris | #717171 |
| Corazón favorito | Blanco (outline) | Luego Rojo (fill) |
| Bordes | Gris claro | #ddd |

---

## 📱 VER EN DIFERENTES TAMAÑOS

### Desktop (1200px+)
- Abre DevTools (F12)
- Toggle device toolbar desactivado
- Debería ver 4 propiedades por fila
- SearchBar todo en una línea horizontal

### Tablet (768px-1024px)
- F12 → Toggle device toolbar → iPad
- Debería ver 2-3 propiedades por fila
- SearchBar sigue horizontal pero más compacto

### Mobile (< 480px)
- F12 → Toggle device toolbar → iPhone
- Debería ver 1 propiedad por fila
- SearchBar se apila verticalmente
- Menú (si existe) colapsado

---

## 🔄 INTERACCIONES A PROBAR

### 1. BÚSQUEDA
```
1. Escribe en "Dónde": "Bogotá"
2. Click botón búsqueda (icono lupa)
3. Resultado: Grid se filtra mostrando solo propiedades en Bogotá
```

### 2. FAVORITOS
```
1. Haz click en el ♥ de cualquier tarjeta
2. Resultado: Corazón cambia a rojo relleno
3. Recarga la página (F5)
4. Resultado: Corazón sigue rojo (guardado en localStorage)
```

### 3. GALERÍA DE IMÁGENES
```
1. Si una tarjeta tiene múltiples imágenes, verás dots
2. Click en › para siguiente imagen
3. Click en ‹ para imagen anterior
4. Dots se actualizan automáticamente
```

### 4. HOVER EFFECTS
```
1. Pon el mouse sobre una tarjeta
2. Resultado: Tarjeta se eleva ligeramente
3. Sombra aumenta
4. Imagen se zoom suavemente
```

---

## ⚠️ COMPORTAMIENTOS ESPECIALES

### Loading (Inicial)
**Qué ver:**
- Esqueletos animados (placeholders gris) mientras carga
- Animación pulse (parpadeo suave)
- Se reemplaza con tarjetas reales cuando carga

### Sin Conexión a API
**Qué ver:**
- Se muestra texto: "No se pudieron cargar las propiedades"
- Botón "Reintentar"
- O: Se cargan 3 propiedades mock automáticamente

### Sin Resultados
**Qué ver:**
- Mensaje: "No se encontraron propiedades"
- Submensaje: "Prueba con otros criterios de búsqueda"

### Favoritos localStorage
**Técnica:**
- Abre DevTools (F12)
- Application → LocalStorage → http://localhost:3000
- Verás clave `favorites` con array de IDs

---

## 🎬 DEMO RÁPIDO (5 MINUTOS)

1. Abre http://localhost:3000
2. Espera 2-3 segundos a que carguen propiedades
3. Escribe "Bogotá" en el campo "Dónde"
4. Click botón búsqueda
5. Haz click en ♥ de una tarjeta (debería ponerse rojo)
6. Navega imágenes con flechas (›‹)
7. Cambia a mobile (F12 → Toggle device toolbar)
8. Verifica que SearchBar se reorganice en una columna
9. Refresca página (F5) y verifica que los favoritos persistan
10. ¡Listo!

---

## ✅ CHECKLIST VISUAL RÁPIDO

- [ ] Hero section visible con gradiente
- [ ] SearchBar se ve debajo del hero (flotante)
- [ ] Grid de propiedades se ve
- [ ] Cada tarjeta tiene imagen, título, precio
- [ ] Botones de favorito visibles (♥)
- [ ] Números de rating con estrellas visibles
- [ ] Todo se alinea bien en mobile
- [ ] No hay errores rojos en consola (F12)
- [ ] Búsqueda filtra propiedades
- [ ] Favoritos se guardan al recargar

---

## 🎨 COMPARACIÓN CON AIRBNB

| Feature | Nido Home | Airbnb |
|---------|----------|--------|
| Hero Section | ✅ Sí | ✅ Sí |
| SearchBar | ✅ Igual | ✅ Igual |
| Grid Cards | ✅ Similar | ✅ Similar |
| Imagen Card | ✅ Cuadrada | ✅ Cuadrada |
| Favoritos | ✅ Corazón | ✅ Corazón |
| Rating Stars | ✅ Sí | ✅ Sí |
| Hover Effect | ✅ Elevate | ✅ Elevate |
| Responsive | ✅ 100% | ✅ 100% |
| Colors | ✅ Rojo-Gris | ✅ Rosa-Gris |

---

**Diviértete explorando la nueva Home Airbnb-style! 🚀**
