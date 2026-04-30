# Índice Rápido de Documentación Técnica

**Última actualización:** 2026-04-27

---

## 🚀 Empezar Aquí

### Para Nuevo Desarrollador
1. **5 min:** Leer [README.md](./README.md) - entender qué es NIDO
2. **10 min:** Ver [setup.md](./setup.md) - instalar y correr localmente
3. **15 min:** Revisar [architecture.md](./architecture.md) - entender diseño
4. **20 min:** Explorar [flows.md](./flows.md) - flujos de negocio

**Tiempo total:** ~50 minutos para entender la aplicación

### Para Implementar Feature Nueva
1. Revisar [modules.md](./modules.md) - estructura de módulos
2. Ver endpoint similar en [api.md](./api.md)
3. Copiar patrón: routes → controller → schema
4. Registrar en `backend/src/routes.js`
5. Actualizar [changelog.md](./changelog.md)

### Para Depurar Bug
1. Revisar [flows.md](./flows.md) - ¿qué flujo afecta?
2. Revisar [api.md](./api.md) - ¿endpoint correcto?
3. Revisar [data-model.md](./data-model.md) - ¿datos correctos?
4. Leer logs del servidor en terminal

---

## 📚 Documentos Disponibles

### Visión General
- **[README.md](./README.md)** - Descripción, stack, scripts, troubleshooting rápido

### Arquitectura y Diseño
- **[architecture.md](./architecture.md)** - Capas, componentes, decisiones técnicas
- **[diagrams/](./diagrams/)** - Diagramas Mermaid de arquitectura y flujos

### Negocio y Flujos
- **[flows.md](./flows.md)** - 7 flujos principales paso a paso
- **[data-model.md](./data-model.md)** - Modelos, tablas, relaciones

### Código y API
- **[modules.md](./modules.md)** - Descripción de cada módulo backend
- **[api.md](./api.md)** - Endpoints, request/response, validaciones

### Instalación y Operaciones
- **[setup.md](./setup.md)** - Instalación, configuración, Docker, troubleshooting
- **[changelog.md](./changelog.md)** - Versiones, cambios, backlog

---

## 🔍 Buscar por Tema

| Necesito... | Leer... |
|-------------|---------|
| Entender qué hace NIDO | [README.md](./README.md) |
| Instalar localmente | [setup.md](./setup.md) |
| Cómo está estructurado el código | [architecture.md](./architecture.md) + [modules.md](./modules.md) |
| Ver un endpoint específico | [api.md](./api.md) |
| Entender flujo de autenticación | [flows.md](./flows.md#flujo-de-autenticación) |
| Ver solicitud de arrendamiento paso a paso | [flows.md](./flows.md#flujo-de-solicitud-de-arrendamiento) |
| Entender modelo de datos | [data-model.md](./data-model.md) |
| Variables de entorno | [setup.md](./setup.md#configuración-de-variables-de-entorno) |
| Agregar nuevo módulo | [modules.md](./modules.md#agregar-nuevo-módulo) |
| Diagramas de arquitectura | [diagrams/architecture.md](./diagrams/architecture.md) |
| Diagramas de flujos | [diagrams/flows.md](./diagrams/flows.md) |
| Historial de cambios | [changelog.md](./changelog.md) |
| Solucionar problema | [setup.md](./setup.md#troubleshooting) |

---

## 📊 Estadísticas

- **Stack:** Express + React + PostgreSQL + Supabase
- **Módulos backend:** 7 (auth, properties, users, favorites, applications, requests, shared)
- **Páginas frontend:** 10 (home, auth, búsqueda, detalle, aplicaciones, favoritos, etc)
- **Modelos BD:** 5 (User, Property, PropertyImage, Favorite, RentalRequest)
- **Endpoints API:** 30+
- **Flujos principales:** 7
- **Documentación:** 11 archivos

---

## 🎯 Flujos Críticos

1. **Autenticación** - Registro, login, JWT
2. **Búsqueda** - Filtros, paginación, detalle
3. **Solicitud** - Wizard 4 pasos, validación
4. **Favoritos** - Guardar/remover propiedades
5. **Gestión** - Crear, editar, publicar propiedades
6. **Revisión** - Propietario aprueba/rechaza solicitudes
7. **Perfiles** - Ver/editar información personal

---

## 🔐 Seguridad

- ✅ Contraseñas hasheadas (bcryptjs)
- ✅ JWT con expiración (7 días)
- ✅ CORS restrictivo (solo localhost:5173 en dev)
- ✅ Validación de entrada (Joi)
- ✅ Middlewares de autorización (role, ownership)

---

## 🚀 Scripts Principales

```bash
npm run dev              # Desarrollo: frontend + backend
npm run build            # Compilar frontend
npm start                # Producción: servidor
npm run prisma:push      # Sincronizar BD
npm run prisma:seed      # Popular datos iniciales
```

Ver [setup.md](./setup.md#scripts-npm) para lista completa.

---

## 📈 Escalabilidad Futura

**Pendiente de Implementación:**
- Chat integrado entre usuarios
- Notificaciones por email
- Pagos online (Stripe)
- Reseñas/calificaciones
- Sistema de recomendaciones
- Mapa interactivo
- Testing automatizado
- CI/CD pipeline

Ver [changelog.md](./changelog.md#backlogfuturo) para detalles.

---

## ❓ Preguntas Frecuentes

**¿Cómo agregO un nuevo endpoint?**  
Ver [modules.md](./modules.md#agregar-nuevo-módulo)

**¿Dónde está el archivo X?**  
Ver estructura en [README.md](./README.md#estructura-del-proyecto)

**¿Cómo funciona la autenticación?**  
Ver [flows.md](./flows.md#flujo-de-autenticación) y [architecture.md](./architecture.md#flujos-de-autenticación)

**¿Cuál es el modelo de datos?**  
Ver [data-model.md](./data-model.md) y diagrama en [diagrams/flows.md](./diagrams/flows.md)

**¿Cómo deployar?**  
Pendiente de documentar (ver [changelog.md](./changelog.md#backlogfuturo))

---

## 📞 Contacto / Soporte

Si encuentras inconsistencias en la documentación:
1. Verifica contra el código fuente (código es fuente de verdad)
2. Abre un issue en GitHub
3. Contacta al equipo de desarrollo

---

## 📝 Mantener Documentación Actualizada

**Regla Oro:** Código + Documentación cambian juntos

Cuando hagas cambio:
1. Actualiza código
2. Actualiza docs afectada
3. Verifica links internos
4. Actualiza [changelog.md](./changelog.md)
5. Commit con mensaje descriptivo

```bash
git commit -m "feat: agregar endpoint X - docs actualizadas"
```

---

**Documentación creada:** 2026-04-27  
**Última revisión:** 2026-04-27  
**Próxima revisión:** 2026-05-27
