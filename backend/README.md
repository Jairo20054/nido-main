# Backend

Servidor Node.js + Express + Prisma para la API de NIDO.

## Requisitos

- `DATABASE_URL`: cadena de conexión a PostgreSQL usada por Prisma.
- `JWT_SECRET`: secreto para firmar tokens.
- `JWT_EXPIRES_IN`: duración del token JWT. Valor por defecto: `7d`.
- `PORT`: puerto del backend. Valor por defecto: `5000`.
- `CLIENT_URL`: origen permitido por CORS. Valor por defecto: `http://localhost:5173`.

## Arranque

```bash
npm install
npm start
```

## Variables de entorno de ejemplo

Puedes copiar `.env.example` a `.env` en la raíz del proyecto:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nido"
JWT_SECRET="nido-local-secret"
JWT_EXPIRES_IN="7d"
PORT=5000
CLIENT_URL="http://localhost:5173"
VITE_API_BASE_URL="/api"
```

## Comandos útiles

- `npm run prisma:generate`
- `npm run prisma:push`
- `npm run prisma:seed`
- `npm run dev:server`

## Salud

- `GET /health`
