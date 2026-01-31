# PLAN.md - Análisis y Plan de Desarrollo MedRound

## Resumen Ejecutivo

**Estado actual**: Proyecto Next.js con autenticación Better Auth implementada, registro de médicos funcional, y dashboard vacío esperando funcionalidad core.

**Objetivo**: Versión completa con sistema de tareas pendientes como funcionalidad principal.

**Prioridad inmediata**: Corregir errores + tests + seguridad antes de agregar nuevas features.

---

## 1. Errores Críticos Identificados

### 1.1 Rate Limiting en Memoria (CRÍTICO) ✅ COMPLETADO
**Archivo**: `lib/rate-limit.ts`
**Problema**: El rate limiting usa `Map` en memoria que se reinicia en cada deploy/cold start de serverless.
**Impacto**: Usuarios pueden evadir el rate limit esperando entre deploys.
**Solución**: Implementar rate limiting con Redis Upstash

**Implementación**:
- Instalado `@upstash/redis`
- Reemplazado Map por Redis con TTL automático
- Actualizado `checkRateLimit()` para ser asíncrono
- Agregado fallback seguro si Redis falla
- Variables de entorno configuradas en `.env`

**Cambios realizados**:
- `lib/rate-limit.ts`: Implementación completa con Redis
- `app/api/register/route.ts`: Agregado `await` para llamada asíncrona
- `.env`: Agregadas variables `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`

### 1.2 Manejo de Errores de Email (ALTO) ✅ COMPLETADO
**Archivo**: `lib/auth.ts:22-38`
**Problema**: `void sendEmail()` - el error de envío de email no se maneja ni se reporta al usuario.
**Impacto**: Usuarios no reciben emails y no hay feedback del error.
**Solución**: Implementar sistema de reintentos con await y manejo de errores completo.

**Implementación**:
- Reemplazado `void sendEmail()` por `await sendEmailWithRetry()` con 3 intentos
- Agregado delay de 1 segundo entre reintentos
- Implementado timeout de 10 segundos con Promise.race
- Mejorado logging con emojis y mensajes descriptivos
- Agregados tipos estrictos SendEmailResult
- Implementado valores por defecto para remitente (noreply@medround.app)
- Opción 3: Si falla después de 3 intentos, usuario puede reenviar desde perfil
- Agregados 18 tests nuevos (8 para email service + 10 para sistema de reintentos)

**Cambios realizados**:
- `lib/email.ts`: Implementación completa con timeout y mejores tipos
- `lib/auth.ts`: Función `sendEmailWithRetry()` con sistema de reintentos
- `tests/lib/email.test.ts`: 8 tests del servicio de email
- `tests/lib/auth-email-retry.test.ts`: 10 tests del sistema de reintentos

### 1.3 Transacción Innecesaria (MEDIO)
**Archivo**: `app/api/register/route.ts:66-80`
**Problema**: Uso de `$transaction` con una sola operación.
**Impacto**: Overhead innecesario sin beneficio real.
**Solución**: Eliminar la transacción, crear el perfil directamente.

### 1.4 Email Hardcodeado (MEDIO)
**Archivo**: `lib/email.ts:24`
**Problema**: Email de fallback hardcodeado: `'juanhv-medicodev.org'`
**Impacto**: Seguridad y branding incorrectos si falta variable de entorno.
**Solución**: Usar un email del dominio del proyecto o fail fast si falta la config.

### 1.5 Error Handling Genérico (MEDIO)
**Archivo**: `app/api/register/route.ts:112-134`
**Problema**: Manejo de errores por string matching (`error.message.includes`).
**Impacto**: Errores no capturados correctamente si el mensaje cambia.
**Solución**: Usar tipos de error específicos o códigos de error estructurados.

### 1.6 Memory Leak Potencial (BAJO)
**Archivo**: `lib/rate-limit.ts:6`
**Problema**: Map de rate limiting nunca se limpia, crece indefinidamente.
**Impacto**: En alta carga, puede consumir memoria excesiva.
**Solución**: Implementar cleanup periódico o usar TTL.

---

## 2. Puntos de Mejora Técnica

### 2.1 Arquitectura
- **Separar concerns**: La API de registro maneja validación, auth y DB. Considerar usar una capa de servicios.
- **Consistencia de imports**: Algunos archivos usan comillas simples, otros dobles. Estandarizar.
- **Validación duplicada**: Zod valida en frontend (React Hook Form) y backend. Considerar compartir schemas.

### 2.2 Performance
- **Imágenes**: No se detectó uso de `next/image` para optimización.
- **Bundle size**: Verificar tree-shaking de librerías grandes (Resend, Better Auth).
- **Consultas DB**: El profile se crea en transacción separada del user, podría optimizarse.

### 2.3 Developer Experience
- **Tests**: No se encontraron archivos de test (.test.ts, .spec.ts).
- **TypeScript**: Algunos `any` implícitos en manejo de errores.
- **ESLint**: Configurado pero no se ejecuta automáticamente en pre-commit.
- **Documentación**: Faltan comentarios JSDoc en funciones públicas.

### 2.4 Seguridad
- **CSP Headers**: No detectados headers de Content Security Policy.
- **CORS**: No configurado explícitamente para API routes.
- **Password hashing**: Better Auth lo maneja, pero verificar configuración de salt.
- **Input sanitization**: No se detecta sanitización de inputs antes de guardar en DB.

---

## 3. Plan de Implementación

### Fase 1: Estabilidad y Seguridad (Semanas 1-2)

#### Semana 1: Corrección de Errores Críticos ✅ EN PROGRESO
1. **Fix rate limiting** ✅ COMPLETADO:
   - ~~Evaluar: Upstash Redis (serverless-friendly) o Vercel KV~~
   - ~~Implementar adapter de rate limiting persistente~~
   - ~~Agregar tests para rate limiting~~ ✅ (10 tests)

2. **Fix email handling** ✅ COMPLETADO:
   - ~~Cambiar `void sendEmail` por `await sendEmail` con try-catch~~
   - ~~Implementar sistema de reintentos (3 intentos con delay)~~
   - ~~Agregar timeout de 10 segundos~~
   - ~~Agregar tests para email service~~ ✅ (8 tests)
   - ~~Agregar tests para sistema de reintentos~~ ✅ (10 tests)

**Próximos pasos**:
3. **Fix transacción innecesaria** (siguiente tarea)
   - Agregar cola de reintentos para emails fallidos
   - Implementar envío de email síncrono con timeout

3. **Fix transacción innecesaria**:
   - Refactorizar `app/api/register/route.ts`
   - Eliminar `$transaction` de una sola operación

#### Semana 2: Tests y Seguridad Base
1. **Setup de testing**:
   ```bash
   npm install -D vitest @testing-library/react @testing-library/jest-dom
   ```
   - Configurar Vitest
   - Crear tests para:
     - `lib/registerSchema.ts` (validaciones Zod)
     - `lib/rate-limit.ts` (rate limiting)
     - `app/api/register/route.ts` (API endpoint)

2. **Seguridad básica**:
   - Agregar headers de seguridad en `next.config.ts`:
     - X-Frame-Options
     - X-Content-Type-Options
     - Referrer-Policy
   - Configurar CSP básico
   - Sanitizar inputs con DOMPurify o similar

### Fase 2: Funcionalidad Core - Tareas Pendientes (Semanas 3-5)

#### Semana 3: Modelo de Datos y API
1. **Schema Prisma**:
   ```prisma
   model Task {
     id          String   @id @default(uuid())
     title       String
     description String?
     status      TaskStatus @default(PENDING)
     priority    Priority @default(MEDIUM)
     dueDate     DateTime?
     patientId   String?
     patient     Patient? @relation(fields: [patientId], references: [id])
     assignedTo  String
     assignee    User     @relation(fields: [assignedTo], references: [id])
     createdBy   String
     creator     User     @relation("CreatedTasks", fields: [createdBy], references: [id])
     hospital    String
     createdAt   DateTime @default(now())
     updatedAt   DateTime @updatedAt
     completedAt DateTime?
   }
   ```

2. **API Routes**:
   - `GET /api/tasks` - Listar tareas del usuario
   - `POST /api/tasks` - Crear tarea
   - `PATCH /api/tasks/:id` - Actualizar tarea
   - `DELETE /api/tasks/:id` - Eliminar tarea

3. **Tests de API**:
   - Tests unitarios para cada endpoint
   - Tests de integración con base de datos de test

#### Semana 4: UI de Tareas
1. **Componentes**:
   - `TaskList` - Lista de tareas con filtros y ordenamiento
   - `TaskCard` - Card individual de tarea
   - `TaskForm` - Formulario crear/editar tarea
   - `TaskFilters` - Filtros por estado, prioridad, fecha

2. **Dashboard actualizado**:
   - Reemplazar placeholder con lista de tareas
   - Agregar gráficos de resumen (tareas pendientes, completadas)
   - Widget de tareas urgentes

3. **Tests de UI**:
   - Tests con React Testing Library
   - Tests de accesibilidad

#### Semana 5: Features Avanzadas de Tareas
1. **Asignación de tareas**:
   - Buscar usuarios por hospital/especialidad
   - Asignar tareas a otros médicos
   - Notificaciones de nueva asignación

2. **Integración con pacientes**:
   - Vincular tareas a pacientes específicos
   - Mostrar historial de tareas por paciente

3. **Recurrentes**:
   - Tareas recurrentes (diarias, semanales)
   - Template de tareas comunes

### Fase 3: Optimización y Features Adicionales (Semanas 6-8)

#### Semana 6: Performance y UX
1. **Optimizaciones**:
   - Implementar React.memo donde aplica
   - Virtualización de listas largas
   - Paginación de tareas
   - Caching con SWR o React Query

2. **UX mejoras**:
   - Drag & drop para reordenar tareas
   - Atajos de teclado
   - Modo offline básico (service worker)
   - Tema oscuro

#### Semana 7: Notificaciones y Comunicación
1. **Notificaciones**:
   - Email de recordatorio de tareas próximas
   - Notificaciones en-app de nuevas tareas
   - Web push notifications

2. **Comentarios en tareas**:
   - Sistema de comentarios
   - Menciones (@usuario)
   - Historial de actividad

#### Semana 8: Analytics y Admin
1. **Dashboard analytics**:
   - Métricas de productividad
   - Tareas completadas por período
   - Tiempo promedio de resolución

2. **Panel admin**:
   - Gestión de usuarios por hospital
   - Reportes de uso
   - Configuración de sistema

---

## 4. Stack Tecnológico Recomendado para Features Nuevas

### Testing
- **Vitest** - Test runner (más rápido que Jest)
- **@testing-library/react** - Tests de componentes
- **@testing-library/jest-dom** - Matchers DOM
- **msw** (Mock Service Worker) - Mockear APIs en tests

### Seguridad
- **Helmet** o headers nativos de Next.js
- **DOMPurify** - Sanitización de inputs
- **zod-validation-error** - Mejores mensajes de error de Zod

### State Management para Tareas
- **TanStack Query (React Query)** - Caching, sync, paginación
- **Zustand** ya está, usar para estado global UI

### Notificaciones
- **Resend** (ya está) - Emails transaccionales
- **Web Push API** - Notificaciones push
- **Sonner** o similar - Toasts in-app

### UI/UX
- **@dnd-kit** - Drag and drop
- **date-fns** - Manipulación de fechas
- **recharts** - Gráficos y analytics

---

## 5. Estructura de Archivos Sugerida

```
app/
├── api/
│   ├── auth/[...auth]/route.ts
│   ├── register/route.ts
│   └── tasks/
│       ├── route.ts          # GET, POST list/create
│       └── [id]/
│           └── route.ts      # GET, PATCH, DELETE
├── dashboard/
│   ├── page.tsx
│   ├── layout.tsx
│   └── components/
│       ├── TaskList.tsx
│       ├── TaskCard.tsx
│       ├── TaskForm.tsx
│       └── DashboardStats.tsx
├── login/page.tsx
├── register/
│   ├── page.tsx
│   └── components/
│       ├── PersonalInfoStep.tsx
│       ├── IdentificationStep.tsx
│       ├── WorkInfoStep.tsx
│       └── NavigationButtons.tsx
components/
├── ui/                       # shadcn/ui components
├── providers/
│   └── AuthProvider.tsx
└── shared/                   # Componentes reutilizables
    └── LoadingSpinner.tsx
lib/
├── auth.ts
├── auth-client.ts
├── prisma.ts
├── email.ts
├── rate-limit.ts
├── schemas/
│   ├── registerSchema.ts
│   └── taskSchema.ts
└── utils/
    ├── validation.ts
    └── formatting.ts
stores/
├── registrationStore.ts
└── taskStore.ts              # Si se necesita estado global de tareas
hooks/
├── useRegistrationStore.ts
└── useTasks.ts               # Hook personalizado para tareas
prisma/
└── schema.prisma
tests/
├── unit/
│   ├── lib/
│   │   ├── rate-limit.test.ts
│   │   └── registerSchema.test.ts
│   └── components/
├── integration/
│   └── api/
│       └── register.test.ts
└── e2e/
    └── register.spec.ts
```

---

## 6. Métricas de Éxito

### Técnicas
- Cobertura de tests > 80%
- Lighthouse score > 90 en todas las categorías
- Tiempo de carga inicial < 2s
- Zero errores críticos en producción

### Negocio
- Tiempo de registro < 2 minutos
- Tareas creadas por usuario > 5/semana
- Retención de usuarios > 60% a 30 días

---

## 7. Notas de Implementación

### Convenciones de Código
- Usar **arrow functions** para callbacks y handlers
- Usar **function declarations** para componentes React
- Early returns sobre nested conditionals
- Máximo 3 niveles de anidación
- Funciones < 50 líneas, archivos < 200 líneas
- **NUNCA usar `any`**, siempre tipar explícitamente

### Patrones
- Server Components por defecto
- "use client" solo cuando necesites:
  - Event handlers (onClick, onSubmit)
  - Hooks de React (useState, useEffect)
  - Browser APIs (window, localStorage)
- Extraer lógica de negocio a custom hooks o servicios

### Seguridad Checklist
- [ ] Validar todos los inputs con Zod
- [ ] Sanitizar datos antes de guardar en DB
- [ ] Implementar rate limiting persistente
- [ ] Agregar headers de seguridad
- [ ] CSP configurado
- [ ] No exponer secrets en cliente
- [ ] Validar sesión en todas las API routes protegidas
- [ ] SQL injection protection (Prisma lo maneja, pero verificar raw queries)

---

## Próximos Pasos Inmediatos

1. **Hoy**: Corregir errores críticos identificados en sección 1
2. **Esta semana**: Setup de tests con Vitest
3. **Próxima semana**: Implementar schema de tareas y API endpoints

---

*Documento creado el: 30 de Enero 2026*
