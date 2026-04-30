**Patrones UI y componentes reutilizables**

Componentes básicos
- `LoadingState` — spinner + label (uso para esperas generales). Archivo: `components/ui/LoadingState.jsx`.
- `EmptyState` — vista cuando no hay resultados.
- `InlineMessage` — banner de mensaje dentro de páginas.

Patrones de interacción
- Formularios: uso de HTML nativo (`input`, `select`, `textarea`) con validación mínima en cliente; forms controlados localmente.
- Uploads: validación local en `ApplicationDocumentsPage` con límites (>=30KB y <=15MB) y formatos permitidos; la subida real se maneja en el backend (no hay upload directo en el cliente visible).
- Filtros y URL: `useSearchFilters` mantiene el estado sincronizado con `URLSearchParams` (permite compartir links y volver con estado).

Componentes de layout
- `SiteHeader`: accesos principales, menú, login/logout.
- `SiteLayout`: `Outlet` con estructura de shell.

Convenciones visuales
- Clases CSS BEM-like (`site-header__container`, `property-hero__gallery`) en `src/styles/*`.
- Uso de iconografía `lucide-react`.

Accessibility (observado)
- `mobile-filter-sheet` usa `role="dialog" aria-modal="true"` — buen inicio.
- Falta comprobación sistemática de `aria-*` en controles interactivos (pendiente de auditoría accesibilidad).

Recomendaciones
- Establecer una librería de componentes (design system) si el producto escala.
- Añadir tests de accesibilidad (axe) en PRs críticos.
