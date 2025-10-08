# Host Onboarding Modal

Este paquete contiene un flujo completo para el botón **"Conviértete en anfitrión"** implementado en React 18+, con soporte para autenticación simulada, formularios dinámicos, guardado automático en localStorage, y accesibilidad.

## Archivos principales

- `HostOnboardingModal.jsx`: Componente principal del modal que gestiona el flujo completo.
- `QuestionsForm.jsx`: Formulario dinámico basado en JSON para las preguntas.
- `questionsMap.js`: Mapa JSON con las preguntas para cada tipo de anfitrión.
- `authMock.js`: Funciones simuladas para autenticación (`isAuthenticated()`, `login()`).
- `utils/localDraft.js`: Helpers para guardar y recuperar borradores en `localStorage`.
- `styles.css`: CSS puro, mobile-first, para el modal y componentes relacionados.
- `ExampleHostOnboardingPage.jsx`: Ejemplo de uso con botón para abrir el modal.

## Integración

1. Copia los archivos en tu proyecto React.
2. Importa y usa el componente `HostOnboardingModal` donde necesites el flujo.
3. Controla la apertura con la prop `open` y el cierre con `onClose`.
4. Usa el callback `onComplete({ selectionId, answers })` para manejar el envío final.

Ejemplo básico:

```jsx
import HostOnboardingModal from './components/Host/HostOnboardingModal';

const [modalOpen, setModalOpen] = React.useState(false);

<HostOnboardingModal
  open={modalOpen}
  onClose={() => setModalOpen(false)}
  onComplete={({ selectionId, answers }) => {
    console.log('Formulario completado:', selectionId, answers);
  }}
/>
```

## Reemplazo de autenticación simulada

Para integrar con autenticación real (e.g., Auth0, Firebase, NextAuth):

1. Reemplaza las importaciones de `authMock` con tu servicio de auth real.
2. Cambia `isAuthenticated()` por tu función de verificación de sesión.
3. Cambia `login(email, password)` por tu función de login que retorne una promesa.
4. Asegúrate de que el login modal sea reemplazado por tu UI de login si es necesario.

Ejemplo con Auth0:

```jsx
// En HostOnboardingModal.jsx
import { useAuth0 } from '@auth0/auth0-react';

// Reemplaza isAuthenticated con useAuth0().isAuthenticated
// Reemplaza login con useAuth0().loginWithRedirect o similar
```

## Dependencias

- React 18+
- `focus-trap-react` (opcional, para focus trap; instala con `npm install focus-trap-react`)

## Pruebas

Ejecuta las pruebas unitarias con React Testing Library:

```bash
npm test HostOnboardingModal.test.jsx
```

## Notas técnicas

- CSS puro, mobile-first, sin frameworks como Tailwind o Bootstrap.
- Accesibilidad: Focus trap, ARIA roles, navegación por teclado.
- Guardado automático cada 5 segundos y al cambiar campos.
- Validación en línea para campos requeridos.
- Responsive: Grid de tarjetas se adapta a 1/2/3 columnas según ancho.

## QA Criterios

- Modal abre al clic y recibe foco.
- Selección no autenticada fuerza login; tras login continúa en la selección elegida.
- Respuestas se persisten y se restauran al reabrir.
- Formularios muestran errores si campos requeridos están vacíos y evitan submit.
- Modal funcional en móvil y escritorio.
