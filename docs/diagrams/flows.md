# Diagrama de flujo principal

## De postulacion guiada a solicitud de arriendo

```mermaid
flowchart TD
  A["Detalle de propiedad"] --> B["/apply/start"]
  B --> C["/apply/prequal"]
  C -->|POST /api/applications/prequalify| D["Resultado de precalificacion en Supabase"]
  D --> E["Borrador guardado en localStorage"]
  E --> F["/apply/documents"]
  F --> G{"Autenticado?"}
  G -->|No| H["Redirigir a login/register"]
  G -->|Si| I["Solo validacion documental del lado cliente"]
  I --> J["POST /api/requests"]
  J --> K["Se crea RentalRequest en Prisma"]
  K --> L["submittedRequest guardado en localStorage"]
  L --> M["/apply/review"]
```

## Estados de revision de solicitud

```mermaid
stateDiagram-v2
  [*] --> PENDING
  PENDING --> APPROVED
  PENDING --> REJECTED
  PENDING --> WITHDRAWN
```

Notas:

- En el MVP actual los archivos no se suben al almacenamiento del backend.
- La pantalla de revision se reconstruye con el borrador local y la respuesta de la solicitud enviada.
