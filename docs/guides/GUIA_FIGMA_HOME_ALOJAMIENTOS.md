# GUIA FIGMA - Home de Alojamientos Colombia

## Objetivo

Diseñar un Home moderno, limpio y altamente conversivo para una app de alojamientos en Colombia, con patrones tipo Airbnb pero alineado a la identidad de Nido. La pantalla debe permitir que una persona entienda una propiedad en menos de 3 segundos, compare rápido y avance a detalle sin fricción.

## Principios UX

- Priorizar jerarquia visual sobre decoracion.
- Hacer del precio el ancla principal de lectura.
- Reducir ruido: menos texto, mejores labels, mas aire.
- Mostrar confianza con rating, ubicacion clara y badges utiles.
- Mantener una experiencia familiar para usuarios de marketplaces de hospedaje, pero con tono visual mas calido y local.

## Direccion visual recomendada

- Base visual: limpio, editorial, respirado, sin look corporativo duro.
- Inspiracion: Airbnb en claridad de grid y scannability, con color principal verde de marca Nido.
- Fondo general: gris marfil muy suave para separar cards sin ensuciar la interfaz.
- Cards: blancas, con sombra corta y radio amable.
- CTA principal: verde oscuro consistente y confiable.

## Tokens base

### Colores

- `Color/Background/Base`: `#F7F6F2`
- `Color/Surface/Primary`: `#FFFFFF`
- `Color/Surface/Subtle`: `#F1EFE8`
- `Color/Text/Primary`: `#1A1A1A`
- `Color/Text/Secondary`: `#6B6B6B`
- `Color/Text/Tertiary`: `#8C8C8C`
- `Color/Border/Subtle`: `#E7E4DD`
- `Color/Brand/Primary`: `#1A3D2E`
- `Color/Brand/Hover`: `#143126`
- `Color/Brand/Soft`: `#E8F0EC`
- `Color/Accent/Warm`: `#C98B2E`
- `Color/Success/Soft`: `#E7F6EE`

### Espaciado

Usar sistema de 8 px en toda la interfaz:

- `Space/4`
- `Space/8`
- `Space/12`
- `Space/16`
- `Space/24`
- `Space/32`
- `Space/40`
- `Space/48`
- `Space/64`

### Radius

- `Radius/8`
- `Radius/12`
- `Radius/16`
- `Radius/24`
- `Radius/Pill = 999`

### Sombras

- `Shadow/Card/Default`: `0 6 18 rgba(20, 24, 18, 0.08)`
- `Shadow/Card/Hover`: `0 12 28 rgba(20, 24, 18, 0.12)`
- `Shadow/Floating`: `0 8 24 rgba(20, 24, 18, 0.10)`

### Tipografia

Usar una sans limpia, contemporanea y muy legible. Si ya existe Manrope en el producto, mantenerla.

- `Type/H1`: 40/48, semibold
- `Type/H2`: 28/34, semibold
- `Type/H3`: 20/26, semibold
- `Type/Body/L`: 16/24, regular
- `Type/Body/M`: 14/20, regular
- `Type/Body/S`: 12/16, regular
- `Type/Label/M`: 14/18, medium
- `Type/Label/S`: 12/16, medium
- `Type/Price/L`: 22/26, bold
- `Type/Price/M`: 18/22, bold

## Estructura de pagina en Figma

### Pagina

Nombrar la pagina principal:

- `01_Home Marketplace`

Dentro de la pagina crear estos frames top-level:

1. `Cover`
2. `Foundations`
3. `Components`
4. `Screens`
5. `Prototype Notes`

### Foundations

Crear un frame horizontal con cuatro bloques:

1. `Foundations/Colors`
2. `Foundations/Typography`
3. `Foundations/Spacing`
4. `Foundations/Elevation`

Cada bloque debe usar Auto Layout vertical y exponer los tokens arriba descritos.

### Components

Organizar por filas:

1. `Navigation`
2. `Search`
3. `Chips`
4. `Cards`
5. `Buttons`
6. `Icons`

### Screens

Crear estos frames:

1. `Home/Mobile/390`
2. `Home/Tablet/834`
3. `Home/Desktop/1440`

Todos con Auto Layout vertical y fondo `Color/Background/Base`.

## Estructura del Home

### Frame principal

Nombre:

- `Screen/Home`

Configuracion:

- Auto Layout vertical
- Gap entre secciones: `32`
- Padding mobile: `16 16 32`
- Padding tablet: `24 24 40`
- Padding desktop: `24 48 56`
- Align: stretch

### Orden de secciones

1. `Header/Main`
2. `Search/Hero`
3. `Filters/Chips`
4. `Results/Header`
5. `PropertyGrid`
6. `Trust/Support` opcional

### 1. Header/Main

Contenido:

- Logo Nido
- CTA secundaria `Mis viajes` o `Publica tu espacio`
- Accion de perfil o menu

Configuracion:

- Auto Layout horizontal
- Height: `72` desktop, `64` mobile
- Align: center
- Justify: space-between
- Bottom border suave `Color/Border/Subtle`

### 2. Search/Hero

Objetivo:

Concentrar la intencion de busqueda sin hero gigante ni bloques de marketing que retrasen la accion.

Contenido:

- Eyebrow: `Alojamientos verificados en Colombia`
- Heading: `Encuentra estadias que se sienten faciles de elegir`
- Subtexto corto: una sola linea con foco en comparar rapido
- Buscador principal con ubicacion, fechas y personas

Configuracion:

- Auto Layout vertical
- Gap `16`
- Desktop max width del contenido: `1120`
- El buscador debe vivir dentro de una superficie blanca elevada

### 3. Filters/Chips

Objetivo:

Permitir refinamiento rapido sin abrir modales de inmediato.

Chips visibles:

- `Precio`
- `Zona`
- `Fechas flexibles`
- `Habitaciones`
- `Servicios`
- `Pet friendly`
- `Superhost`

Configuracion:

- Frame horizontal con wrap en desktop
- Scroll horizontal en mobile
- Gap `8`

### 4. Results/Header

Contenido:

- Titulo ejemplo: `Más de 300 estadías en Bogotá`
- Ordenar por selector discreto

Configuracion:

- Auto Layout horizontal
- Justify space-between
- Align center

### 5. PropertyGrid

Nombre:

- `Grid/Property`

Configuracion:

- Desktop: 4 columnas
- Laptop: 3 columnas
- Tablet: 3 columnas
- Mobile: 2 columnas
- Gap horizontal `16`
- Gap vertical `24`

Recomendacion de anchos:

- Mobile 390: cards de `171` px
- Tablet 834: cards de `246` px
- Desktop 1440: cards de `252-272` px

### 6. Trust/Support opcional

Solo si el negocio necesita empuje adicional sin contaminar el grid:

- `Anfitriones verificados`
- `Pagos seguros`
- `Soporte local`

Usarlo como banda discreta debajo del grid, no arriba.

## Componente principal: Card de propiedad

### Nombre del set

- `Card/Property`

### Propiedades de variante

- `Type = Standard | Featured | Compact`
- `State = Default | Hover | Active`
- `Favorite = Off | On`
- `Badge = None | Nuevo | Top | Mas popular`

### Estructura interna

`Card/Property` debe ser un Auto Layout vertical con:

1. `Media`
2. `Content`
3. `CTA`

Configuracion general:

- Width: fixed por variante, height hug
- Fill: `Color/Surface/Primary`
- Radius: `16`
- Padding: `12` o `16` segun variante
- Gap interno: `12`
- Stroke: `1 px Color/Border/Subtle`
- Shadow: `Shadow/Card/Default`

### 1. Media

Nombre:

- `Card/Property/Media`

Configuracion:

- Aspect ratio `4:3` para Standard y Featured
- Aspect ratio `1:1` para Compact si se usa en carruseles
- Clip content: on
- Radius superior `16`
- Auto Layout none

Overlay superior:

- `Badge/Property`
- `IconButton/Favorite`

Ubicacion:

- Badge top-left a `12`
- Corazon top-right a `12`

### 2. Content

Auto Layout vertical con gap `8`.

Orden:

1. `Title`
2. `Location`
3. `RatingRow`
4. `Price`
5. `Features`

### Titulo

- Maximo 2 lineas
- Estilo `Type/H3` en desktop, `Type/Label/M` en mobile
- Peso semibold
- Color `Color/Text/Primary`

Ejemplo:

`Loft moderno con vista al Chicó`

### Ubicacion

- 1 linea preferida
- Estilo `Type/Body/S`
- Color `Color/Text/Secondary`

Ejemplo:

`Chicó Norte, Bogotá`

### RatingRow

Formato:

`★ 4.8 · 120 reseñas`

Configuracion:

- Horizontal Auto Layout
- Gap `4`
- Estilo `Type/Body/S`
- El icono estrella en tono calido `Color/Accent/Warm`

### Precio

Debe ser la pieza mas visible del contenido.

Formato:

`$ 180.000 / noche`

Reglas:

- Bold
- Color `Color/Text/Primary`
- Separar el sufijo `/ noche` en estilo secundario si se requiere
- Mantener formato COP con espacio despues de `$`

### Features

Formato:

`2 hab · 1 baño · WiFi`

Reglas:

- Solo 3 atributos
- Nada de parrafos
- Estilo `Type/Body/S`
- Color `Color/Text/Secondary`

### 3. CTA

Nombre:

- `Button/Primary`

Texto:

- `Ver detalles`

Configuracion:

- Full width
- Height `44`
- Radius `12`
- Fill `Color/Brand/Primary`
- Texto blanco

## Variantes de la card

### Standard

- Uso: grid principal
- Width desktop: `252-272`
- Width mobile: `171`
- Padding interno: `12`
- Imagen `4:3`

### Featured

- Uso: una propiedad prioritaria por fila o bloque editorial
- Puede ocupar 2 columnas en desktop
- Padding interno: `16`
- Precio en `Type/Price/L`
- Badge sugerido: `Mas popular`

### Compact

- Uso: listas horizontales, modulos de recomendados o similares
- Width: `220-240`
- Imagen `1:1`
- CTA opcional mas corto: `Ver`

## Estados del componente

### Default

- Stroke suave
- Sombra `Shadow/Card/Default`
- CTA visible

### Hover

Solo desktop.

- Translate Y `-2`
- Sombra `Shadow/Card/Hover`
- Corazon y CTA mantienen contraste
- Cursor pointer

### Active

- Stroke con `Color/Brand/Primary`
- Ligero oscurecimiento del media overlay o ripple sutil
- Mantener accesible, no exagerar compresion

### Favorito seleccionado

- Corazon relleno
- Fondo del icon button con contraste mas fuerte
- Mantener el resto de la tarjeta estable para no distraer del CTA

## Componentes auxiliares

### SearchBar principal

Nombre:

- `SearchBar/Main`

Propiedades:

- `State = Default | Focus`
- `Device = Mobile | Desktop`

Estructura desktop:

1. `Field/Location`
2. `Divider`
3. `Field/Dates`
4. `Divider`
5. `Field/Guests`
6. `Button/Search`

Estructura mobile:

- Una sola superficie vertical con 3 rows tappables y CTA full width

Alturas sugeridas:

- Desktop buscador: `72`
- Mobile rows: `56`

### Chips de filtros

Nombre:

- `Chip/Filter`

Propiedades:

- `State = Default | Selected | Hover`
- `Icon = On | Off`

Configuracion:

- Height `36`
- Padding `12 14`
- Radius pill
- Selected: fondo `Color/Brand/Soft`, texto `Color/Brand/Primary`

### Boton favorito

Nombre:

- `IconButton/Favorite`

Propiedades:

- `State = Default | Hover | Active`
- `Selected = Off | On`

Configuracion:

- Size `36`
- Fondo blanco con 88-92% de opacidad
- Sombra minima para no perderse sobre la imagen

## Responsive y constraints

### Mobile 390

- Mantener 2 columnas reales
- Header simplificado
- Search bar vertical
- Chips en scroll horizontal
- Card title en 2 lineas maximo

### Tablet 834

- Search bar horizontal
- 3 columnas de cards
- Max width de contenido `786`

### Desktop 1440

- Search bar horizontal con mayor aire
- 4 columnas
- Featured card opcional ocupando 2 columnas
- Max width del contenido `1280`

### Constraints recomendados

- Wrappers generales: left and right
- Search bar y bloques: fill container
- Card en grids: top + left, con ancho fijo por columna
- CTA interno: fill container

## Interacciones para prototipo

- Tap en `Field/Location` abre overlay o pantalla de seleccion
- Tap en `Field/Dates` abre date picker
- Tap en `Field/Guests` abre selector de personas
- Tap en `Chip/Filter` cambia a estado selected
- Hover de `Card/Property` eleva la card
- Tap en corazon alterna `Favorite = On`
- Tap en CTA navega a `Property Detail`

Duraciones sugeridas:

- Hover: `160 ms ease-out`
- Press: `100 ms ease-out`
- Toggle favorito: `140 ms ease-out`

## Contenido recomendado para mockup

Usar ejemplos localizados:

- `Loft moderno con balcón en El Poblado`
- `Apartamento tranquilo cerca al Parque 93`
- `Casa colonial para grupos en Cartagena`
- `Cabaña con jacuzzi en Guatapé`

Ubicaciones:

- `El Poblado, Medellín`
- `Chapinero Alto, Bogotá`
- `Centro Histórico, Cartagena`
- `Guatapé, Antioquia`

Precios:

- `$ 180.000 / noche`
- `$ 320.000 / noche`
- `$ 540.000 / noche`

## Preparacion para handoff a desarrollo

- Nombrar todas las capas con patron consistente y sin nombres genericos como `Frame 24`.
- Mantener componentes master en `Components`.
- Exponer variantes con propiedades claras: `Type`, `State`, `Favorite`, `Badge`.
- Usar variables para color, radius, spacing y shadows.
- Documentar breakpoints dentro del frame `Prototype Notes`.
- Definir textos truncables: titulo 2 lineas, ubicacion 1 linea, features 1 linea.
- Si el equipo usa Dev Mode, asociar comentarios a espaciados y comportamientos de hover.

## Checklist de calidad en Figma

- El Home se entiende sin scroll profundo.
- El precio destaca antes que la metadata.
- Cada tarjeta se escanea en menos de 3 segundos.
- No hay mas de 3 niveles de jerarquia tipografica por card.
- Los chips no compiten visualmente con las cards.
- El CTA es visible sin verse agresivo.
- Mobile y desktop mantienen la misma logica de lectura.

## Nombres sugeridos exactos

- `Card/Property`
- `Card/Property/Docs`
- `Button/Primary`
- `Button/Secondary`
- `SearchBar/Main`
- `Chip/Filter`
- `Badge/Property`
- `IconButton/Favorite`
- `Section/Header`
- `Section/Results`
- `Grid/Property`
- `Screen/Home`

## Siguiente paso ideal

Con esta guia ya se puede construir el archivo en Figma. Si compartes el link del archivo o el `fileKey`, puedo dejarte la estructura creada directamente en Figma con frames, componentes y variantes base.
