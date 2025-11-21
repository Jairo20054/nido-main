# 🧪 Testing Checklist - PropertyDetailPage

## ✅ Pre-requisitos
- [ ] Aplicación ejecutándose en http://localhost:3000
- [ ] Sin errores en la consola del navegador
- [ ] Todos los estilos cargados correctamente

---

## 🏠 1. Tests en Home Page

### Carga de Home
- [ ] Home page carga sin errores
- [ ] SearchBar visible en la parte superior
- [ ] Grid de 6 propiedades visible
- [ ] Cada PropertyCard muestra:
  - [ ] Imagen
  - [ ] Título
  - [ ] Ubicación
  - [ ] Precio
  - [ ] Rating

### Navegación desde Home
- [ ] Al hacer clic en **Apartamento El Poblado** → navega a `/property/1`
- [ ] Al hacer clic en **Casa Moderna** → navega a `/property/2`
- [ ] Al hacer clic en **Estudio Centro** → navega a `/property/3`
- [ ] Al hacer clic en **Penthouse Laureles** → navega a `/property/4`
- [ ] Al hacer clic en **Loft Industrial** → navega a `/property/5`
- [ ] Al hacer clic en **Villa Exclusiva** → navega a `/property/6`

---

## 🔍 2. Tests en PropertyDetailPage

### Header
- [ ] Botón "Volver" visible y funcional
- [ ] Al clic en "Volver" → regresa a Home
- [ ] Título de propiedad visible en el header
- [ ] Botón favorito (❤️) visible
- [ ] Botón compartir (📤) visible
- [ ] Header permanece sticky al hacer scroll

### Galería de Imágenes

#### Imagen Principal
- [ ] Imagen principal se muestra grande
- [ ] Aspecto 4:3 en desktop (responsivo)
- [ ] Contador muestra "1 / 4" (número correcto de imágenes)
- [ ] Imagen cambia al navegar

#### Navegación
- [ ] Botón anterior (◄) visible cuando hay más imágenes
- [ ] Al clic en botón anterior → va a imagen anterior
- [ ] Botón siguiente (►) visible
- [ ] Al clic en botón siguiente → va a imagen siguiente
- [ ] Ciclado correcto: última → primera y primera → última
- [ ] Contador actualiza al navegar

#### Thumbnails
- [ ] Thumbnails (miniaturas) visibles debajo de imagen principal
- [ ] 4 thumbnails para cada propiedad
- [ ] Thumbnail actual tiene borde azul/destacado
- [ ] Al clic en thumbnail → carga esa imagen
- [ ] Animación suave al seleccionar

### Información Básica
- [ ] Título de propiedad visible y grande
- [ ] Ubicación visible con icono de pin (📍)
- [ ] Rating visible con estrella (⭐)
- [ ] Número de reseñas visible
- [ ] Precio destacado con gradient morado

### Características (Features)
- [ ] 4 características visibles en grid 2x2
- [ ] Característica 1: Tipo (Casa/Apartamento/etc)
- [ ] Característica 2: Dormitorios (3, 4, 5, etc)
- [ ] Característica 3: Baños (2, 3, 4, etc)
- [ ] Característica 4: Tamaño en m² (85, 150, 250, etc)
- [ ] Cada característica tiene icono
- [ ] Cada característica tiene hover effect

### Descripción
- [ ] Sección "Acerca de esta propiedad" visible
- [ ] Descripción de la propiedad legible
- [ ] Texto en color gris oscuro (#666)
- [ ] Párrafo completo sin truncamiento

### Amenidades
- [ ] Sección "Amenidades" visible
- [ ] Mínimo 8 amenidades mostradas
- [ ] Cada amenidad tiene checkmark verde (✓)
- [ ] Grid de 2 columnas en desktop
- [ ] Amenidades incluyen:
  - [ ] WiFi
  - [ ] Aire Acondicionado
  - [ ] Cocina
  - [ ] Estacionamiento
  - [ ] Otras según propiedad

### Ubicación
- [ ] Sección "📍 Ubicación" visible
- [ ] Nombre de ubicación mostrado
- [ ] Coordenadas GPS mostradas (ej: 6.2276, -75.5898)
- [ ] Placeholder de mapa con coordenadas visibles
- [ ] Formatting correcto de números

### Botones de Acción
- [ ] Botón "Volver al Home" visible
- [ ] Botón "Reservar Ahora" visible
- [ ] Ambos botones tienen estilos distintos
- [ ] "Volver al Home" es de borde (outline)
- [ ] "Reservar Ahora" es filled (gradient)
- [ ] Al clic en "Volver al Home" → regresa a Home
- [ ] Al clic en "Reservar Ahora" → acción funciona (placeholder)

---

## 💰 3. Tests de Datos

### Precios Correctos
- [ ] Apartamento El Poblado: $1.8M
- [ ] Casa Moderna: $2.5M
- [ ] Estudio Centro: $950K
- [ ] Penthouse Laureles: $3.2M
- [ ] Loft Industrial: $1.5M
- [ ] Villa Exclusiva: $4.2M

### Ratings Correctos
- [ ] Apartamento El Poblado: 4.8 ⭐ (45 reseñas)
- [ ] Casa Moderna: 4.9 ⭐ (23 reseñas)
- [ ] Estudio Centro: 4.6 ⭐ (67 reseñas)
- [ ] Penthouse Laureles: 5.0 ⭐ (12 reseñas)
- [ ] Loft Industrial: 4.7 ⭐ (38 reseñas)
- [ ] Villa Exclusiva: 4.95 ⭐ (28 reseñas)

### Características Correctas
```
Apartamento El Poblado: 3 hab, 2 baños, 85 m²
Casa Moderna: 4 hab, 3 baños, 150 m²
Estudio Centro: 1 hab, 1 baño, 40 m²
Penthouse Laureles: 3 hab, 2 baños, 120 m²
Loft Industrial: 2 hab, 2 baños, 95 m²
Villa Exclusiva: 5 hab, 4 baños, 250 m²
```

- [ ] Todos estos datos se muestran correctamente

---

## 📱 4. Tests de Responsividad

### Desktop (1920 x 1080)
- [ ] 2 columnas (imagen a la izquierda, info a la derecha)
- [ ] Imagen ocupa ~50% del ancho
- [ ] Información ocupa ~50% del ancho
- [ ] Espaciado completo y cómodo
- [ ] Fonts tamaño normal (16px+)
- [ ] Todo visible sin scroll horizontal

### Tablet (768 x 1024)
- [ ] 1 columna (imagen arriba, info abajo)
- [ ] Imagen ocupa 100% del ancho
- [ ] Información debajo
- [ ] Espaciado reducido pero legible
- [ ] Fonts tamaño medio (14-16px)
- [ ] Todo visible con scroll vertical normal

### Mobile (375 x 812)
- [ ] 1 columna completa
- [ ] Imagen responsiva (cuadrada)
- [ ] Header adaptado (puede haber wrap)
- [ ] Botones grandes y clicables
- [ ] Fonts legibles (14px+)
- [ ] Sin truncamiento excesivo
- [ ] Padding adecuado

### Muy Pequeño (320 x 568)
- [ ] Todo legible
- [ ] Botones clickeables (min 36px)
- [ ] Sin scrollbars horizontales innecesarios
- [ ] Fonts nunca < 14px
- [ ] Información priorizida (lo más importante primero)

---

## ⭐ 5. Tests de Interactividad

### Botón Favorito
- [ ] Corazón vacío por defecto
- [ ] Al clic → corazón se llena (rojo/rosa)
- [ ] Fondo del botón cambia a rosa claro
- [ ] Al clic de nuevo → vuelve al estado inicial
- [ ] Funciona múltiples veces sin errores

### Botón Compartir
- [ ] Icono de compartir visible
- [ ] Al clic → alguna acción (navegador permite)
- [ ] No produce errores en consola

### Navegación de Imágenes
- [ ] Botón siguiente funciona correctamente
- [ ] Botón anterior funciona correctamente
- [ ] Contador se actualiza
- [ ] Transición suave entre imágenes
- [ ] Circularidad: después de última imagen va a primera

### Estados Hover
- [ ] Botones cambian de color al hover
- [ ] Características tienen hover effect
- [ ] Thumbnails tienen hover effect
- [ ] Sin lag o retrasos

---

## 🔧 6. Tests Técnicos

### Consola del Navegador
- [ ] Abirir DevTools (F12)
- [ ] Ir a la pestaña Console
- [ ] NO debe haber errores en rojo
- [ ] NO debe haber advertencias de React
- [ ] Máximo warnings de librerías externas (aceptable)

### Network
- [ ] Pestaña Network en DevTools
- [ ] Todas las imágenes cargan correctamente
- [ ] CSS carga sin errores
- [ ] Ninguna request falla (status 404, 500, etc)

### Performance
- [ ] Página carga rápido (< 2 segundos)
- [ ] Cambio de imagen es instantáneo
- [ ] Sin lag al cambiar propiedades
- [ ] Scroll suave sin jank

### URL y Routing
- [ ] URL se actualiza al navegar: `/property/1`, `/property/2`, etc
- [ ] Botón volver actualiza URL a `/`
- [ ] Si editas URL manualmente a `/property/1` → funciona
- [ ] Si intentas `/property/99` → error controlado

---

## 🎨 7. Tests de Diseño

### Colores
- [ ] Gradient morado/azul en precio: ✓
- [ ] Texto principal gris oscuro: ✓
- [ ] Texto secundario gris claro: ✓
- [ ] Checkmarks verde: ✓
- [ ] Icono ubicación rojo/rosa: ✓
- [ ] Bordes gris claro: ✓

### Espaciado
- [ ] Padding consistente alrededor de contenido
- [ ] Gaps consistentes entre elementos
- [ ] No se ve amontonado ni vacío
- [ ] Márgenes proporcionados

### Tipografía
- [ ] Título grande (28px+)
- [ ] Subtítulos medianos (18px)
- [ ] Texto base legible (14-16px)
- [ ] Contraste suficiente entre textos
- [ ] Fuentes consistentes

### Iconografía
- [ ] Todos los iconos de Lucide React se muestran
- [ ] Tamaño consistente (24px para info)
- [ ] Color consistente (morado #667eea)
- [ ] Sin sobreposición de texto

---

## 🏃 8. Tests de Flujo Completo

### Flujo Usuario Típico
- [ ] 1. Llego a Home
- [ ] 2. Veo lista de propiedades
- [ ] 3. Hago clic en una propiedad
- [ ] 4. Se abre página detallada
- [ ] 5. Veo galería grande
- [ ] 6. Navego entre imágenes
- [ ] 7. Leo toda la información
- [ ] 8. Reviso ubicación
- [ ] 9. Hago clic en "Volver"
- [ ] 10. Regreso a Home
- [ ] 11. Hago clic en otra propiedad
- [ ] 12. La nueva página carga correctamente

### Flujo Edge Cases
- [ ] Hacer clic rápido entre imágenes: OK
- [ ] Hacer clic rápido en favorito: OK
- [ ] Abrir PropertyDetail, volver, volver a abrir: OK
- [ ] Compartir desde diferentes propiedades: OK
- [ ] Cambiar favorito, volver, volver a abrir: Estado se resetea (OK)

---

## 🐛 9. Tests de Errores (Negativos)

### URLs Inválidas
- [ ] `/property/999` → muestra "Propiedad no encontrada"
- [ ] `/property/abc` → muestra error
- [ ] `/property/` (sin ID) → muestra error

### Comportamiento Degradado
- [ ] Desabilitar JavaScript → página base funciona
- [ ] Lentitud de conexión → skeleton o placeholder aparece
- [ ] Imagen no carga → alternative text visible

---

## 📸 10. Visual Regression (Comparar con Antes)

### Comparar Modal vs Full Page
- [ ] Full page es más grande: ✓
- [ ] Imágenes más grandes: ✓
- [ ] Información menos comprimida: ✓
- [ ] Ubicación más destacada: ✓
- [ ] Más organizado: ✓

---

## 📝 Notas de Testing

### Bugs Encontrados
```
Fecha: [Fecha]
Descripción:
Pasos para reproducir:
Resultado esperado:
Resultado actual:
Severidad: [ ] Crítico [ ] Alta [ ] Media [ ] Baja
```

### Observaciones
```
- ...
- ...
```

---

## ✅ Resumen de Testing

**Fecha de Testing**: ___________  
**Testeado por**: ___________  
**Entorno**: [ ] Local [ ] Staging [ ] Producción  
**Navegador**: [ ] Chrome [ ] Firefox [ ] Safari [ ] Edge  
**Dispositivo**: [ ] Desktop [ ] Tablet [ ] Mobile

### Resultados Generales
- [ ] ✅ TODOS LOS TESTS PASARON
- [ ] ⚠️ ALGUNOS TESTS FALLARON (listar abajo)
- [ ] ❌ TESTS FALLIDOS (listar abajo)

### Tests Fallidos (si aplica)
1. ________________________________________
2. ________________________________________
3. ________________________________________

### Nota General
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

**¿Se aprueba para producción?**
- [ ] ✅ SÍ - LISTO
- [ ] ⚠️ CONDICIONALMENTE (con cambios)
- [ ] ❌ NO - REQUIERE MÁS TRABAJO

---

**Próximas Acciones**:
- [ ] Integración con Google Maps
- [ ] Sistema de reservas real
- [ ] Sistema de pagos real
- [ ] Reseñas y calificaciones
- [ ] Chat con propietario
- [ ] Otro: ________________________

