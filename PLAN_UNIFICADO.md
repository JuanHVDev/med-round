# PLAN_UNIFICADO.md - Plan de Desarrollo MedRound

## Resumen Ejecutivo

**Estado Actual (Fase 1-4)**: ✅ COMPLETADA HASTA FASE 4
- ✅ Fase 1: Sistema de autenticación, rate limiting, email service
- ✅ Fase 2: Modelo de pacientes y API de pacientes
- ✅ Fase 3: Notas SOAP backend y UI
- ✅ **Fase 4: Sistema de Tareas Kanban (COMPLETA)**
- 📋 Fase 5: Entrega de Guardia (Handover)
- 📋 Fase 6: Optimización y Polish

---

## FASE 4: Sistema de Tareas Kanban (COMPLETADA ✅)

### Semana 7-8: Backend + UI Kanban

**Estado**: ✅ COMPLETADA

### Backend Implementado
- ✅ `services/tasks/taskService.ts` - CRUD completo con validaciones
- ✅ `services/tasks/taskValidation.ts` - Schemas Zod
- ✅ `services/tasks/types.ts` - Tipos TypeScript
- ✅ `/api/tasks` - GET (filtros), POST
- ✅ `/api/tasks/[id]` - PATCH, DELETE
- ✅ `/api/tasks/[id]/complete` - POST marcar completada

### Frontend Implementado
- ✅ `components/tasks/TaskBoard.tsx` - Kanban completo con drag & drop (@dnd-kit)
- ✅ `components/tasks/TaskColumn.tsx` - 4 columnas: Pendiente/En Progreso/Completado/Cancelado
- ✅ `components/tasks/TaskCard.tsx` - Tarjeta con prioridad, paciente, fecha
- ✅ `components/tasks/TaskForm.tsx` - Formulario con selector de paciente por cama
- ✅ `components/tasks/PriorityBadge.tsx` - Badge visual por prioridad
- ✅ `components/tasks/TaskFilters.tsx` - Filtros por estado, prioridad, búsqueda
- ✅ `hooks/useTasks.ts` - TanStack Query con optimistic updates
- ✅ `/tasks` - Página completa del Kanban

### Features Implementados
- ✅ Drag & drop entre columnas
- ✅ Optimistic updates (movimiento instantáneo)
- ✅ Búsqueda de pacientes por número de cama
- ✅ Filtros por estado, prioridad, búsqueda
- ✅ Validación de asignación por hospital
- ✅ Rate limiting: 20 tareas/min

### Tests
- ✅ 8 tests unitarios para taskService
- ✅ 5 tests de integración para API

### Commits
```
feat(tasks): implement task Kanban backend (Semana 7)
feat(tasks): complete Fase 4 Kanban with UI and optimistic updates
```

---

## FASE 2: Modelo de Datos Médico (COMPLETADA ✅)

### Semana 3-4: Schema Prisma + API Pacientes

**Estado**: ✅ COMPLETADA

### Implementado
- ✅ Modelos Patient, SoapNote, Task en Prisma
- ✅ Endpoints `/api/patients` (GET, POST, PATCH, DELETE)
- ✅ PatientService con CRUD completo
- ✅ Validaciones Zod para pacientes

### Tests
- ✅ Tests unitarios y de integración para pacientes

---

## FASE 3: Notas SOAP (COMPLETADA ✅)

### Semana 5-6: Backend + UI SOAP

**Estado**: ✅ COMPLETADA

### Backend Implementado
- ✅ SoapNoteService con CRUD
- ✅ `/api/soap-notes` endpoints
- ✅ Validaciones Zod SOAP

### Frontend Implementado
- ✅ SoapNoteForm con campos S-O-A-P
- ✅ VitalSignsInput especializado
- ✅ TemplateSelector para notas comunes

---

## FASE 5: Entrega de Guardia (Handover) (Semanas 9-10)

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
| Cobertura de tests | > 80% | ~90+ tests | > 150 tests |
| Lighthouse score | > 90 | N/A | > 90 en todas |
| Tiempo de carga | < 2s | ~1.2s | < 1.5s |
| Bundle size | < 200KB | ~200KB | < 250KB |
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

## Checklist de Seguridad por Fase

### Fases 2-4 (COMPLETADO ✅)
- ✅ Rate limiting en endpoints de pacientes: 10 req/min
- ✅ Rate limiting en creación de notas SOAP: 5 notas/min
- ✅ Validar que médico solo vea pacientes de su hospital
- ✅ Rate limiting en creación de tareas: 20/min
- ✅ Validar asignación: solo médicos del mismo hospital

### Fases 5-6 (Pendiente)
- [ ] Solo generar handover para turnos actuales
- [ ] Validar permisos de acceso a handovers históricos
- [ ] PDF generado server-side

---

## Progreso Actual

### Estado del Proyecto (Febrero 2026)

```
FASE 1: ✅ Autenticación y Base
FASE 2: ✅ Modelo de Pacientes
FASE 3: ✅ Notas SOAP
FASE 4: ✅ Sistema de Tareas Kanban (COMPLETADA)
FASE 5: 📋 Entrega de Guardia (Handover)
FASE 6: 📋 Optimización y Polish
```

### Archivos Creados - Fase 4
```
app/api/tasks/route.ts                    # GET, POST
app/api/tasks/[id]/route.ts              # PATCH, DELETE
app/api/tasks/[id]/complete/route.ts     # POST complete
app/(routes)/tasks/page.tsx               # Server page
app/(routes)/tasks/TasksPageClient.tsx    # Client component
components/tasks/TaskBoard.tsx            # Kanban board
components/tasks/TaskColumn.tsx           # Columna
components/tasks/TaskCard.tsx             # Tarjeta
components/tasks/TaskForm.tsx            # Formulario
components/tasks/TaskFilters.tsx         # Filtros
components/tasks/PriorityBadge.tsx         # Badge prioridad
components/patients/PatientSelector.tsx   # Selector por cama
hooks/useTasks.ts                          # TanStack Query hooks
services/tasks/taskService.ts              # Servicio CRUD
services/tasks/taskValidation.ts           # Validaciones Zod
services/tasks/types.ts                    # Tipos TypeScript
tests/services/tasks/taskService.test.ts  # Tests unitarios
tests/integration/api/tasks.test.ts      # Tests integración
```

### Próxima Fase: FASE 5 - Entrega de Guardia (Handover)

**Inicio**: Lunes de la próxima semana
**Entregables**:
- Backend: handoverService, API endpoints
- Frontend: HandoverBuilder, CriticalPatientCard, GeneratePDFButton

---

## Referencias

- **PLAN.md original**: Documento base con Fase 1 completada
- **Análisis del Ingeniero**: Identificación de funcionalidades médicas requeridas
- **AGENTS.md**: Guías de desarrollo y convenciones del proyecto
- **Stack**: Next.js 16 + React 19 + Prisma + PostgreSQL + Better Auth + Zustand + Vitest

---

*Documento creado: 3 de Febrero 2026*  
*Última actualización: 7 de Febrero 2026*  
*Estado: FASE 4 COMPLETADA | FASE 5-6: Por iniciar*
