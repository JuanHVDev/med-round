# Tests End-to-End (E2E) - MedRound

Esta carpeta contiene tests end-to-end (E2E) del proyecto MedRound.

## Convención de Nombres

En este proyecto utilizamos la siguiente convención para tests:

| Extensión | Tipo de Test | Ubicación | Descripción |
|-----------|--------------|-----------|-------------|
| `.test.ts` | Unitarios | `tests/lib/`, `tests/services/` | Tests de funciones individuales, utilidades, servicios |
| `.test.ts` | Integración | `tests/integration/` | Tests de integración entre componentes y APIs |
| `.spec.ts` | E2E | `tests/e2e/` | **Tests end-to-end de flujos completos de usuario** |

## ¿Cuándo usar `.spec.ts`?

Los tests E2E (`.spec.ts`) deben usarse cuando:

1. **Flujos completos de usuario**: Simulan la interacción real de un usuario a través de múltiples páginas/estados
2. **Tests de journeys**: Registro → Login → Dashboard → Crear tarea → Logout
3. **Tests de integración profunda**: Validan que todo el stack funciona (frontend → API → DB → Auth)
4. **Tests de regresión crítica**: Flujos que no pueden romperse (registro de médicos, login, etc.)

## Ejemplos de tests E2E

```typescript
// tests/e2e/registration.spec.ts
// Flujo completo: Registro → Verificación → Login → Dashboard
```

```typescript
// tests/e2e/task-workflow.spec.ts
// Flujo: Login → Crear tarea → Asignar → Completar → Verificar
```

## Herramientas

Actualmente usamos **Vitest** para todos los tests. Para tests E2E que requieren un navegador real, considerar agregar:

- **Playwright**: Tests E2E con navegador real (recomendado)
- **Cypress**: Alternativa popular para tests E2E

## Estructura Recomendada

```
tests/e2e/
├── auth/
│   ├── registration.spec.ts      # Flujo completo de registro
│   └── login.spec.ts             # Login con diferentes escenarios
├── tasks/
│   ├── create-task.spec.ts       # Crear y gestionar tareas
│   └── assign-task.spec.ts       # Asignación de tareas
└── README.md                     # Este archivo
```

## Diferencias Clave

### Tests Unitarios (`.test.ts`)
- Aíslan una función/componente
- Usan mocks para dependencias
- Son rápidos (< 100ms cada uno)
- No requieren base de datos real

### Tests E2E (`.spec.ts`)
- Simulan un usuario real
- Usan el stack completo (frontend + backend + DB)
- Son más lentos (varios segundos)
- Requieren setup/teardown de base de datos
- Validan flujos completos

## Template

Ver `example.spec.ts` para un template de test E2E.

## Notas

- Los tests E2E deben ser independientes entre sí
- Usar `beforeEach` y `afterEach` para limpiar estado
- Considerar usar factory functions para crear datos de prueba
- Los tests E2E son la última línea de defensa, no sustituyen tests unitarios
