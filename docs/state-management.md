**State Management (frontend)**

Patrones de estado
- Context API: `AuthProvider` centraliza estado de sesión y expones `useAuth()`.
- Hooks locales: cada página/feature gestiona su propio estado con `useState`, `useEffect` y `useMemo`.
- URL como fuente de verdad parcial: `useSearchFilters` serializa filtros a `URLSearchParams` para comportamiento navegable.

Dónde vive cada dato importante
- Usuario autenticado: `AuthProvider` (context + localStorage token).
- Listado de propiedades: estado local en `SearchPage` (fetch por filtros debounced).
- Filtros de búsqueda: `useSearchFilters` sincronizados con URL.
- Draft de aplicación (prequal + documentos): `features/applications/applicationDraft.js` (almacenado en `localStorage`).

Recomendaciones
- Para escalar: considerar migrar drafts a un store ligero o backend temporal si se requiere multi-dispositivo.
- Añadir tests unitarios para `useSearchFilters` y `applicationDraft`.
