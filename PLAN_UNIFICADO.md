# PLAN_UNIFICADO.md - Plan de Desarrollo MedRound

## Resumen Ejecutivo

**Estado Actual (Fase 1)**: ✅ COMPLETADA
- 75 tests pasando
- Sistema de autenticación robusto con Better Auth
- Rate limiting con Redis Upstash
- Sistema de errores tipado (42 tests)
- Email service con retry (18 tests)
- Seguridad: CSP, CORS, sanitización

**Objetivo Fases 2-6**: Implementar núcleo médico
- Gestión de Pacientes y Camas (Censo)
- Notas de Evolución (SOAP)
- Sistema de Tareas (Kanban)
- Entrega de Guardia (Handover)

---

## FASE 2: Modelo de Datos Médico (Semanas 3-4)

### Semana 3: Schema Prisma

Nuevos modelos a agregar a `prisma/schema.prisma`:

```prisma
model Patient {
  id                  String    @id @default(uuid())
  medicalRecordNumber String    @unique
  firstName           String
  lastName            String
  dateOfBirth         DateTime
  gender              String    // 'M', 'F', 'O'
  admissionDate       DateTime  @default(now())
  dischargedAt        DateTime?
  bedNumber           String
  roomNumber          String?
  service             String    // Medicina Interna, Cirugía, etc.
  diagnosis           String
  allergies           String?
  isActive            Boolean   @default(true)
  hospital            String
  attendingDoctor     String
  soapNotes           SoapNote[]
  tasks               Task[]
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  @@index([hospital, isActive])
  @@index([bedNumber, hospital])
}

model SoapNote {
  id                      String   @id @default(uuid())
  patientId               String
  date                    DateTime @default(now())
  chiefComplaint          String
  historyOfPresentIllness String
  vitalSigns              Json?
  physicalExam            String
  laboratoryResults       String?
  imagingResults          String?
  assessment              String
  plan                    String
  medications             String?
  pendingStudies          String?
  authorId                String
  hospital                String
  patient                 Patient  @relation(fields: [patientId], references: [id], onDelete: Cascade)
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
  @@index([patientId, date])
}

enum TaskStatus { PENDING, IN_PROGRESS, COMPLETED, CANCELLED }
enum TaskPriority { LOW, MEDIUM, HIGH, URGENT }
enum TaskType { LABORATORY, IMAGING, CONSULT, PROCEDURE, MEDICATION, OTHER }

model Task {
  id          String       @id @default(uuid())
  title       String
  description String?
  status      TaskStatus   @default(PENDING)
  priority    TaskPriority @default(MEDIUM)
  type        TaskType     @default(OTHER)
  patientId   String?
  patient     Patient?     @relation(fields: [patientId], references: [id], onDelete: SetNull)
  assignedTo  String
  assignee    User         @relation("AssignedTasks", fields: [assignedTo], references: [id])
  createdBy   String
  creator     User         @relation("CreatedTasks", fields: [createdBy], references: [id])
  dueDate     DateTime?
  completedAt DateTime?
  hospital    String
  service     String?
  shift       String?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  @@index([assignedTo, status])
  @@index([hospital, status])
}

// Actualizar modelo User existente:
model User {
  // ... campos existentes de better-auth ...
  assignedTasks Task[] @relation("AssignedTasks")
  createdTasks  Task[] @relation("CreatedTasks")
}
```

**Tareas:**
1. Actualizar `prisma/schema.prisma` con nuevos modelos
2. Ejecutar: `npm run db:migrate`
3. Ejecutar: `npm run db:generate`
4. Crear seed con datos de prueba (5-10 pacientes)
5. Tests de modelo: crear paciente, validar campos, relaciones, índices

### Semana 4: API Pacientes

**Endpoints:**
```
GET    /api/patients              # Listar pacientes activos
POST   /api/patients              # Crear paciente
GET    /api/patients/:id          # Obtener paciente + notas + tareas
PATCH  /api/patients/:id          # Actualizar paciente
DELETE /api/patients/:id          # Dar de alta (soft delete)
```

**Servicios a crear:**
- `services/patient/patientService.ts` - CRUD de pacientes
- `services/patient/patientValidation.ts` - Validaciones Zod
- `services/patient/types.ts` - Tipos TypeScript

**Tests:**
- 5 tests de integración para endpoints
- 8 tests unitarios para servicio

---

## FASE 3: Notas SOAP (Semanas 5-6)

### Semana 5: Backend SOAP

**Endpoints:**
```
GET    /api/patients/:id/soap-notes     # Listar notas de paciente
POST   /api/soap-notes                  # Crear nota SOAP
GET    /api/soap-notes/:id              # Obtener nota específica
PATCH  /api/soap-notes/:id              # Actualizar nota
DELETE /api/soap-notes/:id              # Eliminar nota
```

**Servicios:**
- `services/soap/soapService.ts`
- `services/soap/soapValidation.ts` (Schema Zod)
- `services/soap/types.ts`

**Tareas:**
- Rate limiting: 5 notas/min por usuario
- Tests: 10 unitarios + 5 integración

### Semana 6: UI de Notas SOAP

**Componentes:**
- `components/soap/SoapNoteForm.tsx` - Formulario estructurado S-O-A-P
- `components/soap/SoapNoteView.tsx` - Vista de nota completa
- `components/soap/SoapNoteList.tsx` - Listado histórico
- `components/soap/VitalSignsInput.tsx` - Input de signos vitales
- `components/soap/TemplateSelector.tsx` - Templates de notas comunes
- `components/soap/AutoSaveIndicator.tsx` - Indicador de guardado

**Features:**
- Autosave cada 30 segundos (debounced)
- Templates: nota de ingreso, evolución diaria, pre-operatoria
- Vista previa en tiempo real
- Tests: 6 tests con React Testing Library

**Dependencias:**
```bash
npm install react-hook-form @hookform/resolvers date-fns
```

---

## FASE 4: Sistema de Tareas Kanban (Semanas 7-8)

### Semana 7: Backend Tareas

**Endpoints:**
```
GET    /api/tasks?status=&priority=&patientId=&assignedTo=  # Listar con filtros
POST   /api/tasks                                          # Crear tarea
PATCH  /api/tasks/:id                                      # Actualizar estado/datos
DELETE /api/tasks/:id                                      # Eliminar tarea
POST   /api/tasks/:id/complete                             # Marcar completada
```

**Servicios:**
- `services/tasks/taskService.ts`
- `services/tasks/taskValidation.ts`
- `services/tasks/types.ts`

**Tareas:**
- Filtros por estado, prioridad, paciente, asignado
- Validar asignación: solo médicos del mismo hospital
- Tests: 8 unitarios + 5 integración

### Semana 8: UI Kanban

**Dependencias:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Componentes:**
- `components/tasks/TaskBoard.tsx` - Vista Kanban completa con drag & drop
- `components/tasks/TaskColumn.tsx` - Columna del kanban (Pendiente/En Progreso/Completado/Cancelado)
- `components/tasks/TaskCard.tsx` - Tarjeta de tarea con prioridad
- `components/tasks/TaskForm.tsx` - Crear/editar tarea
- `components/tasks/PriorityBadge.tsx` - Badge de prioridad (Urgente/Alta/Media/Baja)
- `components/tasks/TaskFilters.tsx` - Filtros rápidos
- `components/dashboard/TaskSummary.tsx` - Resumen en dashboard

**Features:**
- Drag & drop entre columnas (@dnd-kit)
- Filtros rápidos: mías, hoy, urgentes, por paciente
- Crear tarea directamente desde nota SOAP
- Notificaciones de nuevas asignaciones
- Tests: 8 tests de componentes

---

## FASE 5: Entrega de Guardia (Handover) (Semanas 9-10)

### Semana 9: Backend Handover

**Endpoints:**
```
GET    /api/handover/active       # Obtener handover en progreso
POST   /api/handover              # Crear nuevo handover
PATCH  /api/handover/:id          # Actualizar/Agregar notas
POST   /api/handover/:id/finalize # Finalizar y generar resumen
GET    /api/handover/:id/pdf      # Descargar PDF (v2)
```

**Servicios:**
- `services/handover/handoverService.ts`
- `services/handover/handoverGenerator.ts` - Lógica de generación
- `services/handover/types.ts`

**Lógica de negocio:**
- Detectar pacientes críticos automáticamente (estado + tareas urgentes)
- Agregar todas las tareas pendientes del turno
- Generar resumen estructurado en formato texto/markdown
- Tests: 6 tests

### Semana 10: UI Handover + Dashboard Final

**Componentes:**
- `components/handover/HandoverBuilder.tsx` - Constructor de handover
- `components/handover/CriticalPatientCard.tsx` - Card de paciente crítico
- `components/handover/HandoverSummary.tsx` - Vista de resumen completo
- `components/handover/GeneratePDFButton.tsx` - Botón generar PDF

**Features:**
- Generación de PDF del handover
- Dashboard completo integrando todos los módulos
- Responsive design optimizado para tablets (uso en hospitales)
- Performance optimization
- Tests E2E: 3 tests de flujo completo

**Dependencias opcionales (PDF):**
```bash
npm install @react-pdf/renderer
# o alternativa:
npm install html2canvas jspdf
```

---

## FASE 6: Optimización y Polish (Semanas 11-12)

### Semana 11: Performance

**Tareas:**
- Implementar TanStack Query (React Query) para caching
  ```bash
  npm install @tanstack/react-query @tanstack/react-query-devtools
  ```
- Paginación de pacientes y tareas
- Virtualización de listas largas (react-window)
- Optimización de bundle size
- Lighthouse score > 90 en todas las categorías

### Semana 12: UX Final

**Tareas:**
- Modo oscuro completo
- Atajos de teclado:
  - `j/k` - Navegación entre items
  - `/` - Búsqueda rápida
  - `n` - Nueva nota/tarea
  - `Esc` - Cerrar modales
- Tour guiado para nuevos usuarios (react-joyride o similar)
- Notificaciones toast con Sonner (ya instalado)
- Command palette para atajos:
  ```bash
  npm install cmdk
  ```
- Tests de accesibilidad (a11y)

---

## Estructura de Archivos Esperada

```
app/
├── api/
│   ├── auth/[...auth]/route.ts
│   ├── patients/
│   │   ├── route.ts                    # GET, POST listar/crear
│   │   └── [id]/
│   │       ├── route.ts                # GET, PATCH, DELETE
│   │       └── soap-notes/route.ts     # GET notas del paciente
│   ├── soap-notes/
│   │   ├── route.ts                    # POST crear nota
│   │   └── [id]/route.ts               # GET, PATCH, DELETE
│   ├── tasks/
│   │   ├── route.ts                    # GET (filtros), POST
│   │   └── [id]/
│   │       ├── route.ts                # PATCH, DELETE
│   │       └── complete/route.ts       # POST marcar completada
│   └── handover/
│       ├── route.ts                    # GET, POST
│       └── [id]/
│           ├── route.ts                # PATCH
│           └── finalize/route.ts       # POST finalizar
├── (routes)/
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── loading.tsx
│   ├── patients/
│   │   ├── page.tsx                    # Censo de pacientes
│   │   ├── [id]/
│   │   │   ├── page.tsx                # Ficha del paciente
│   │   │   └── soap/
│   │   │       ├── page.tsx            # Notas SOAP del paciente
│   │   │       └── new/page.tsx        # Crear nota SOAP
│   │   └── new/page.tsx                # Crear paciente
│   ├── tasks/
│   │   ├── page.tsx                    # Vista Kanban
│   │   └── new/page.tsx                # Crear tarea
│   └── handover/
│       ├── page.tsx                    # Entrega de guardia
│       └── new/page.tsx                # Crear handover
├── layout.tsx
└── globals.css

components/
├── ui/                                 # shadcn/ui (existente)
├── patients/
│   ├── PatientList.tsx                 # Lista de pacientes (tabla/cards)
│   ├── PatientCard.tsx                 # Card individual de paciente
│   ├── PatientForm.tsx                 # Formulario crear/editar
│   ├── BedStatusIndicator.tsx          # Indicador visual de cama
│   └── PatientSearch.tsx               # Búsqueda de pacientes
├── soap/
│   ├── SoapNoteForm.tsx                # Formulario S-O-A-P completo
│   ├── SoapNoteView.tsx                # Vista de nota (read-only)
│   ├── SoapNoteList.tsx                # Listado histórico
│   ├── VitalSignsInput.tsx             # Input especializado signos vitales
│   ├── TemplateSelector.tsx            # Selector de templates
│   └── AutoSaveIndicator.tsx           # Indicador "Guardando..."
├── tasks/
│   ├── TaskBoard.tsx                   # Kanban board completo
│   ├── TaskColumn.tsx                  # Columna del kanban
│   ├── TaskCard.tsx                    # Tarjeta draggable
│   ├── TaskForm.tsx                    # Formulario crear/editar
│   ├── PriorityBadge.tsx               # Badge color por prioridad
│   ├── TaskFilters.tsx                 # Filtros sidebar/topbar
│   └── CreateTaskFromSoapButton.tsx    # Botón "Crear tarea" en nota SOAP
├── handover/
│   ├── HandoverBuilder.tsx             # Constructor paso a paso
│   ├── CriticalPatientCard.tsx         # Card resaltada paciente crítico
│   ├── HandoverSummary.tsx             # Vista resumen pre-PDF
│   ├── GeneratePDFButton.tsx           # Botón generar PDF
│   └── HandoverPreview.tsx             # Vista previa del handover
├── dashboard/
│   ├── DashboardStats.tsx              # Stats: pacientes, tareas, etc.
│   ├── RecentPatients.tsx              # Pacientes recientes
│   ├── PendingTasks.tsx                # Tareas pendientes (resumen)
│   ├── QuickActions.tsx                # Botones acciones rápidas
│   └── ShiftStatus.tsx                 # Estado del turno actual
└── providers/
    ├── AuthProvider.tsx                # Existente
    └── QueryProvider.tsx               # TanStack Query provider

services/
├── patient/
│   ├── patientService.ts               # CRUD + búsquedas
│   ├── patientValidation.ts            # Schemas Zod
│   └── types.ts                        # Tipos TypeScript
├── soap/
│   ├── soapService.ts                  # CRUD notas SOAP
│   ├── soapValidation.ts               # Schema Zod SOAP
│   └── types.ts
├── tasks/
│   ├── taskService.ts                  # CRUD + filtros
│   ├── taskValidation.ts               # Schema Zod tareas
│   └── types.ts
├── handover/
│   ├── handoverService.ts              # CRUD handovers
│   ├── handoverGenerator.ts            # Generación de resumen/PDF
│   └── types.ts
└── index.ts                            # Exports centralizados

stores/
├── registrationStore.ts                # Existente
├── patientStore.ts                     # Estado de pacientes
├── taskStore.ts                        # Estado de tareas (Kanban)
├── soapStore.ts                        # Estado de notas SOAP
└── handoverStore.ts                    # Estado de handover actual

hooks/
├── usePatients.ts                      # CRUD + queries de pacientes
├── useSoapNotes.ts                     # Gestión de notas SOAP
├── useTasks.ts                         # Gestión de tareas
├── useHandover.ts                      # Generación de handover
├── useDebounce.ts                      # Utilidad debounce
└── useKeyboardShortcuts.ts             # Atajos de teclado

lib/
├── auth.ts
├── auth-client.ts
├── prisma.ts
├── email.ts
├── rate-limit.ts
├── errors.ts
├── schemas/
│   ├── registerSchema.ts               # Existente
│   ├── patientSchema.ts                # Nuevo
│   ├── soapSchema.ts                   # Nuevo
│   └── taskSchema.ts                   # Nuevo
└── utils/
    ├── utils.ts                        # cn() y helpers
    ├── validation.ts                   # Validaciones adicionales
    ├── formatting.ts                   # Formateo de fechas/números
    ├── date.ts                         # Helpers de fecha
    └── constants.ts                    # Constantes de la app

prisma/
├── schema.prisma                       # Actualizado con modelos médicos
├── schema.test.prisma                  # Para tests SQLite
└── migrations/
    └── ...

tests/
├── unit/
│   ├── lib/                            # Tests de lib/
│   ├── services/
│   │   ├── patient/
│   │   │   ├── patientService.test.ts
│   │   │   └── patientValidation.test.ts
│   │   ├── soap/
│   │   │   ├── soapService.test.ts
│   │   │   └── soapValidation.test.ts
│   │   ├── tasks/
│   │   │   ├── taskService.test.ts
│   │   │   └── taskValidation.test.ts
│   │   └── handover/
│   │       └── handoverService.test.ts
│   └── components/
│       └── ...
├── integration/
│   └── api/
│       ├── patients.test.ts
│       ├── soap.test.ts
│       ├── tasks.test.ts
│       └── handover.test.ts
└── e2e/
    ├── patient-flow.spec.ts
    ├── soap-workflow.spec.ts
    ├── task-management.spec.ts
    └── handover-generation.spec.ts
```

---

## Métricas de Éxito

### Técnicas
| Métrica | Objetivo | Actual | Fase 6 |
|---------|----------|--------|--------|
| Cobertura de tests | > 80% | 75 tests | > 150 tests |
| Lighthouse score | > 90 | N/A | > 90 en todas |
| Tiempo de carga | < 2s | ~1.2s | < 1.5s |
| Bundle size | < 200KB | ~150KB | < 250KB |
| Zero errores críticos | Sí | Sí | Sí |

### Negocio (Médico)
| Métrica | Objetivo |
|---------|----------|
| Tiempo crear nota SOAP | < 3 minutos |
| Tiempo crear tarea | < 30 segundos |
| Tareas por guardia | > 10 creadas |
| Uso de handover | > 80% de guardias |
| Pacientes activos por médico | > 15 gestionados |
| Retención a 30 días | > 60% |

---

## Convenciones y Estándares

### Código
- **Nombres de modelos UI**: Español (Paciente, Nota SOAP, Tarea)
- **Nombres de código**: Inglés (Patient, SoapNote, Task)
- **Idioma UI**: Español (fichas médicas en español)
- **Idioma código**: Inglés (variables, funciones, comentarios técnicos)
- **Máximo 50 líneas** por función
- **Máximo 200 líneas** por archivo
- **NUNCA usar `any`** - tipado estricto siempre

### Commits (Conventional Commits)
```
feat(patients): add patient list view with bed status indicators
test(soap): add integration tests for SOAP note endpoints
fix(tasks): correct drag and drop state update in kanban board
docs(api): document handover generation endpoints
refactor(handover): extract PDF generation logic to separate service
```

### Branching Strategy
```
main (producción)
├── develop (integración)
│   ├── feature/fase2-patient-model
│   ├── feature/fase3-soap-notes
│   ├── feature/fase4-task-kanban
│   └── feature/fase5-handover
└── hotfix/* (urgentes)
```

### Tests - Patrón AAA (Arrange-Act-Assert)
```typescript
it("should create SOAP note with valid data", async () => {
  // Arrange
  const patient = await createTestPatient()
  const data = createMockSoapNote({ patientId: patient.id })
  
  // Act
  const result = await soapService.create(data)
  
  // Assert
  expect(result.id).toBeDefined()
  expect(result.patientId).toBe(patient.id)
  expect(result.chiefComplaint).toBe(data.chiefComplaint)
})
```

---

## Checklist de Seguridad por Fase

### Fase 2-3 (Pacientes y SOAP)
- [ ] Rate limiting en endpoints de pacientes: 10 req/min
- [ ] Rate limiting en creación de notas SOAP: 5 notas/min
- [ ] Validar que médico solo vea pacientes de su hospital
- [ ] No exponer datos sensibles en APIs (filtrar campos según rol)
- [ ] Sanitizar texto de notas SOAP con DOMPurify
- [ ] Audit log: registrar quién creó/editó cada nota
- [ ] Validar que solo el autor pueda editar sus notas (o admin)

### Fase 4 (Tareas)
- [ ] Validar asignación: solo médicos del mismo hospital
- [ ] No permitir completar tareas asignadas a otros (unless admin)
- [ ] Rate limiting en creación de tareas: 20/min
- [ ] Validar que tareas completadas no se puedan reabrir (unless admin)

### Fase 5 (Handover)
- [ ] Solo generar handover para turnos actuales (no históricos arbitrarios)
- [ ] Validar permisos de acceso a handovers históricos
- [ ] PDF generado server-side (no exponer datos sensibles en cliente)
- [ ] Firmar digitalmente handovers (opcional v2)

---

## Plan de Rollout

### Alpha (Semana 10)
- Deploy a ambiente staging
- Testing interno con 2-3 médicos de confianza
- Recolección de feedback e iteración rápida
- Corrección de bugs críticos

### Beta (Semana 11)
- Acceso a 10 usuarios piloto (médicos residentes)
- Monitoreo de errores con logging detallado
- Soporte activo vía chat/email
- Iteración rápida de fixes menores

### Producción (Semana 12)
- Deploy gradual con feature flags
- Anuncio a usuarios registrados vía email
- Documentación de uso (video tutoriales)
- Soporte activo primera semana post-lanzamiento

---

## Próximos Pasos Inmediatos

### Esta semana (Inicio Fase 2)

**Día 1:** Revisar y aprobar schema Prisma propuesto arriba
- Verificar tipos de datos
- Confirmar relaciones entre modelos
- Validar índices para performance

**Día 2:** Crear migración de base de datos
```bash
npm run db:migrate
npm run db:generate
```

**Día 3:** Implementar PatientService (CRUD básico)
- Crear `services/patient/patientService.ts`
- Implementar: create, getById, list, update, softDelete
- Crear `services/patient/types.ts`

**Día 4:** Crear API routes de pacientes
- Implementar endpoints en `app/api/patients/`
- Rate limiting: 10 req/min
- Manejo de errores con sistema tipado

**Día 5:** Tests unitarios y de integración
- Tests del servicio (8 tests)
- Tests de integración API (5 tests)
- Verificar cobertura > 80%

### Decisión Requerida

¿Aprobamos el schema de datos propuesto y comenzamos con la implementación de la Fase 2 (Modelo de Pacientes)?

**Opciones:**
1. **Sí, comenzar Fase 2** - El schema está bien diseñado
2. **Ajustar schema primero** - Revisar campos o relaciones
3. **Priorizar otra fase** - Si prefieres empezar por SOAP o Tareas primero

---

## Referencias

- **PLAN.md original**: Documento base con Fase 1 completada
- **Análisis del Ingeniero**: Identificación de funcionalidades médicas requeridas
- **AGENTS.md**: Guías de desarrollo y convenciones del proyecto
- **Stack**: Next.js 16 + React 19 + Prisma + PostgreSQL + Better Auth + Zustand + Vitest

---

*Documento creado: 3 de Febrero 2026*  
*Versión: 2.0 Unificada*  
*Estado: Planificación completa - Listo para ejecución*  
*Fase 1: ✅ Completada | Fase 2: 📋 Planificada | Fases 3-6: 📋 Planificadas*
