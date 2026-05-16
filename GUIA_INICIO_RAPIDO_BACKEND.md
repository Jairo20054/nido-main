# NIDO - Guía de Inicio Rápido

## Requisitos previos
- **Node.js** (v16 o superior)
- **Docker Desktop** (opcional para servicios auxiliares locales)
- **npm** (incluido con Node.js)

## Pasos para iniciar NIDO

### 1. Instalar dependencias (primera vez)
```bash
npm install
```

### 2. Iniciar servicios locales opcionales (Redis, MinIO, ClamAV)

Opción A - Automático (Recomendado):
```bash
start-all.bat
```

Opción B - Manual:
```bash
docker-compose up -d
```

Luego:
```bash
npm start
```

### 3. Verificar que todo está corriendo

- **API Backend**: http://localhost:5000/health
- **Frontend**: http://localhost:5173 (después de `npm run dev:client` en otra terminal)
- **Supabase Postgres**: configura `DATABASE_URL` solo si vas a usar modulos Prisma no migrados
- **Redis**: localhost:6379
- **MinIO Console**: http://localhost:9001 (usuario: minioadmin / contraseña: minioadmin)

## Solución de problemas

### Error: ERR_CONNECTION_REFUSED en http://localhost:5000

**Causa**: El backend no está corriendo o PostgreSQL no está disponible.

**Solución**:
1. Verifica que Docker Desktop esté abierto: `docker ps`
2. Si Docker está corriendo, inicia los servicios: `docker-compose up -d`
3. Espera 10 segundos para que PostgreSQL se inicie completamente
4. Ejecuta: `npm start`

### Error: "La base de datos no esta disponible"

**Causa**: `DATABASE_URL` no apunta a una base PostgreSQL accesible o se dejo vacio para el flujo Option B.

**Solución**:
1. Para auth/perfil, verifica `SUPABASE_URL`, `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY`.
2. Para modulos Prisma no migrados, configura `DATABASE_URL` con el pooler de Supabase.
3. Reinicia el backend: `npm start`

### Error: "DATABASE_URL no esta configurada"

**Solución**: Para Option B puedes dejar Prisma desactivado en desarrollo:
```
DATABASE_URL=""
DIRECT_URL=""
```

## Comandos útiles

```bash
# Iniciar backend
npm start

# Iniciar en modo desarrollo (con hot-reload)
npm run dev:server

# Iniciar frontend (Vite)
npm run dev:client

# Iniciar ambos en paralelo
npm run dev

# Generar cliente Prisma
npm run prisma:generate

# Empujar cambios de schema a BD
npm run prisma:push

# Seed de datos de prueba
npm run prisma:seed

# Ver logs de Docker
docker-compose logs postgres

# Detener todos los servicios Docker
docker-compose down
```

## Configuración de variables de entorno

El archivo `.env` debe tener:
```
DATABASE_URL=""
DIRECT_URL=""
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
JWT_SECRET="nido-local-secret"
JWT_EXPIRES_IN="7d"
PORT=5000
CLIENT_URL="http://localhost:5173"
VITE_API_BASE_URL="/api"
NODE_ENV="development"
```

## Estructura del proyecto

```
nido-main/
├── backend/
│   └── src/
│       ├── modules/          # Módulos de negocio (auth, properties, etc)
│       ├── shared/           # Utilidades compartidas
│       ├── app.js            # Configuración de Express
│       └── server.js         # Punto de entrada
├── src/                       # Frontend (React + Vite)
├── prisma/
│   └── schema.prisma         # Schema de base de datos
├── docker-compose.yml        # Definición de servicios
├── .env                       # Variables de entorno (crear a partir de .env.example)
└── package.json              # Dependencias
```
