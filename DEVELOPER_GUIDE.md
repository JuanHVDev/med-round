# Guía para Developers - MedRound

**Versión:** 1.0  
**Público objetivo:** Developers del equipo MedRound  
**Última actualización:** Enero 2026

---

## 📚 Índice

1. [Primeros Pasos](#primeros-pasos)
2. [Flujo de Trabajo](#flujo-de-trabajo)
3. [Herramientas Disponibles](#herramientas-disponibles)
4. [Guías por Funcionalidad](#guías-por-funcionalidad)
5. [Solución de Problemas](#solución-de-problemas)
6. [Buenas Prácticas](#buenas-prácticas)

---

## Primeros Pasos

### Requisitos Previos

```bash
# Node.js 18+
node --version

# npm o pnpm
npm --version
```

### Instalación

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd med-round

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# 4. Iniciar base de datos (si es necesario)
npm run db:push

# 5. Iniciar servidor de desarrollo
npm run dev
```

### Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor Next.js en http://localhost:3000

# Testing
npm run test             # Tests en modo watch
npm run test:run         # Tests una sola vez
npm run test:unit        # Solo tests unitarios
npm run test:integration # Solo tests de integración

# Linting
npm run lint             # ESLint con auto-fix

# Base de datos
npm run db:push          # Push schema a BD
npm run db:migrate       # Crear y ejecutar migraciones
npm run db:studio        # Abrir Prisma Studio

# Análisis
npm run analyze          # Analizar bundle size
npm run build            # Build de producción
```

---

## Flujo de Trabajo

### 1. Crear una Nueva Feature

```bash
# 1. Crear rama desde main
git checkout -b feature/nombre-de-la-feature

# 2. Desarrollar con tests
# - Escribir tests primero (TDD)
# - Implementar feature
# - Verificar tests pasan

# 3. Commitear (husky verificará linting automáticamente)
git add .
git commit -m "feat: descripción de la feature"

# 4. Si hay errores de linting:
npm run lint -- --fix
git add .
git commit -m "feat: descripción de la feature"

# 5. Push y PR
git push origin feature/nombre-de-la-feature
# Crear Pull Request en GitHub
```

### 2. Pre-commit Hooks

**¿Qué hace Husky?**

Cada vez que haces `git commit`, automáticamente:
1. ESLint revisa tus archivos modificados
2. Auto-corregir problemas simples (espacios, comillas, etc.)
3. Bloquear commit si hay errores graves

**Errores comunes y soluciones:**

```bash
# Error: "ESLint found some errors"
npm run lint              # Ver errores
npm run lint -- --fix     # Auto-corregir
# Luego volver a hacer git commit

# Error: "Unexpected single quotes" (consistencia de imports)
# ESLint cambiará automáticamente a comillas dobles
git add .                 # Agregar archivos corregidos
git commit -m "..."       # Reintentar commit
```

### 3. Convención de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: nueva feature
fix: corrección de bug
docs: documentación
style: cambios de estilo (espacios, formato)
refactor: refactorización de código
test: tests
chore: tareas de mantenimiento
```

**Ejemplos:**
```bash
git commit -m "feat: agregar validación de email en registro"
git commit -m "fix: corregir timeout en envío de emails"
git commit -m "docs: actualizar README con instrucciones de instalación"
```

---

## Herramientas Disponibles

### 1. Bundle Analyzer

**Para qué:** Visualizar el tamaño del bundle y detectar código innecesario.

```bash
npm run analyze
```

**Interpretación:**
- Bloques grandes (rojo): Revisar si se pueden dividir (code splitting)
- Librerías duplicadas: Optimizar imports
- Dependencias grandes: Evaluar alternativas

**Recomendación:** Ejecutar mensualmente o antes de releases importantes.

### 2. Prisma Studio

**Para qué:** Visualizar y editar datos de la base de datos.

```bash
npm run db:studio
# Abre en http://localhost:5555
```

**Uso común:**
- Verificar datos en desarrollo
- Crear registros de prueba
- Debuggear issues con datos

### 3. Tests

#### Estructura de Tests

```
tests/
├── e2e/                    # Tests end-to-end (.spec.ts)
│   ├── README.md
│   └── example.spec.ts
├── integration/            # Tests de integración
│   └── api/
│       └── register.test.ts
├── lib/                    # Tests de utilidades
│   ├── errors.test.ts
│   ├── email.test.ts
│   └── rate-limit.test.ts
├── services/               # Tests de servicios
│   ├── auth/
│   │   └── registrationService.test.ts
│   └── email/
│       └── emailService.test.ts
├── global-setup.ts         # Setup global
└── setup.ts               # Setup por archivo
```

#### Convención de Nombres

| Extensión | Tipo | Ejemplo |
|-----------|------|---------|
| `.test.ts` | Unitarios/Integración | `errors.test.ts` |
| `.spec.ts` | E2E | `registration.spec.ts` |

#### Escribir un Test

```typescript
import { describe, it, expect } from 'vitest'
import { sanitizeText } from '@/lib/sanitize'

describe('sanitizeText', () => {
  it('debe eliminar código HTML malicioso', () => {
    const input = "<script>alert(1)</script>Dr. Pérez"
    const result = sanitizeText(input)
    expect(result).toBe("Dr. Pérez")
  })

  it('debe mantener texto limpio', () => {
    const input = "Hospital Central"
    const result = sanitizeText(input)
    expect(result).toBe("Hospital Central")
  })
})
```

#### Debuggear Tests

```bash
# Modo UI (interactivo)
npm run test:ui

# Solo un archivo
npx vitest run tests/lib/sanitize.test.ts

# Con coverage
npm run test:coverage
```

---

## Guías por Funcionalidad

### 1. Sanitización de Datos

**Cuándo usar:** Siempre que recibas input de usuario.

```typescript
import { 
  sanitizeText, 
  sanitizeEmail, 
  sanitizeHtml,
  sanitizeProfileData 
} from '@/lib/sanitize'

// Para nombres, hospitales, IDs:
const cleanName = sanitizeText(userInput)

// Para emails:
const cleanEmail = sanitizeEmail(email)

// Para campos con formato básico:
const cleanDescription = sanitizeHtml(description)

// Para objetos completos:
const cleanProfile = sanitizeProfileData({
  fullName: "...",
  hospital: "...",
  // ...
})
```

**Ejemplo en API Route:**

```typescript
// app/api/doctors/route.ts
import { sanitizeText } from '@/lib/sanitize'
import { corsMiddleware } from '@/lib/cors'

export async function POST(request: Request) {
  // 1. Verificar CORS
  const cors = corsMiddleware(request)
  if (!cors.allowed) {
    return Response.json({ error: 'CORS not allowed' }, { status: 403 })
  }

  // 2. Obtener datos
  const body = await request.json()

  // 3. Sanitizar
  const cleanData = {
    name: sanitizeText(body.name),
    hospital: sanitizeText(body.hospital),
    specialty: sanitizeText(body.specialty),
  }

  // 4. Guardar en BD (datos ya limpios)
  const doctor = await prisma.doctor.create({ data: cleanData })

  // 5. Responder con headers CORS
  return Response.json(doctor, { headers: cors.headers })
}
```

### 2. Manejo de Errores

**Usar el sistema de errores tipado:**

```typescript
import { 
  ErrorCodes, 
  ValidationError, 
  DatabaseError 
} from '@/lib/errors'

// En servicios:
async function createDoctor(data: DoctorData) {
  try {
    return await prisma.doctor.create({ data })
  } catch (error) {
    if (error.code === 'P2002') {
      throw new DuplicateError('Ya existe un doctor con ese email')
    }
    throw new DatabaseError('Error al crear doctor')
  }
}

// En API routes:
export async function POST(request: Request) {
  try {
    const result = await createDoctor(data)
    return Response.json(result)
  } catch (error) {
    if (error instanceof ValidationError) {
      return Response.json(
        { error: error.message, code: error.code },
        { status: 400 }
      )
    }
    // ... más manejo de errores
  }
}
```

### 3. Componentes UI

**Documentación disponible:**

Todos los componentes UI tienen JSDoc completo. Ejemplo:

```typescript
import { Button } from '@/components/ui/button'

// Hover sobre Button en tu IDE mostrará:
/**
 * Componente Button interactivo basado en Radix UI Slot.
 *
 * Características:
 * - 6 variantes visuales: default, destructive, outline...
 * - 7 tamaños: default, xs, sm, lg, icon...
 * - Soporte para iconos SVG integrados
 *
 * @example
 * <Button variant="outline" size="sm">
 *   <Plus className="w-4 h-4" />
 *   Agregar
 * </Button>
 */
```

### 4. Formularios

**Usar React Hook Form + Zod:**

```typescript
"use client"

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { formSchema, type FormData } from '@/lib/registerSchema'

export function DoctorForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      // ...
    }
  })

  const onSubmit = async (data: FormData) => {
    const response = await fetch('/api/doctors', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    // ...
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* campos del formulario */}
    </form>
  )
}
```

---

## Solución de Problemas

### Problema: Commit bloqueado por ESLint

**Síntoma:**
```bash
✖ eslint --fix found some errors. Please fix them and try committing again.
```

**Solución:**
```bash
# 1. Ver errores detallados
npm run lint

# 2. Auto-corregir lo posible
npm run lint -- --fix

# 3. Si quedan errores manuales, corregirlos
# (errores comunes: variables no usadas, tipos incorrectos)

# 4. Agregar cambios y reintentar
git add .
git commit -m "..."
```

### Problema: Tests fallan en Windows

**Síntoma:** Errores de permisos con Prisma

**Solución:**
```bash
# 1. Eliminar archivos temporales
del node_modules\.prisma\client\*.tmp*

# 2. Regenerar cliente
npx prisma generate

# 3. Ejecutar tests
npm run test:run
```

### Problema: CORS bloquea requests locales

**Síntoma:**
```
Access to fetch at 'http://localhost:3000/api/...' from origin 'http://localhost:3001'
has been blocked by CORS policy
```

**Solución:**
Verificar que el origen está en `ALLOWED_ORIGINS` en `lib/cors.ts`:
```typescript
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',  // Agregar si es necesario
  process.env.NEXT_PUBLIC_APP_URL,
]
```

### Problema: Hot reload lento

**Solución:**
```bash
# 1. Limpiar caché de Next.js
rm -rf .next

# 2. Reiniciar servidor
npm run dev
```

---

## Buenas Prácticas

### Código

✅ **Hacer:**
- Escribir tests antes o junto con el código
- Documentar funciones públicas con JSDoc
- Usar sanitización en todos los inputs de usuario
- Manejar errores con el sistema tipado
- Seguir convención de commits

❌ **Evitar:**
- Usar `any` en TypeScript
- Ignorar errores de ESLint
- Guardar datos sin sanitizar
- Hacer commits directos a `main`

### Performance

✅ **Optimizaciones:**
- Usar `next/image` para imágenes
- Implementar lazy loading para componentes grandes
- Analizar bundle mensualmente (`npm run analyze`)
- Usar Prisma select para queries eficientes

### Seguridad

✅ **Siempre:**
- Sanitizar inputs antes de guardar
- Verificar CORS en APIs
- Usar HTTPS en producción
- Mantener dependencias actualizadas

---

## 📚 Recursos Adicionales

- [Guía de Seguridad](./SECURITY_GUIDE.md)
- [Resumen de Implementación](./IMPLEMENTATION_SUMMARY.md)
- [Tests E2E](./tests/e2e/README.md)
- [Documentación Next.js](https://nextjs.org/docs)
- [Documentación Prisma](https://www.prisma.io/docs)
- [Documentación Tailwind](https://tailwindcss.com/docs)

---

## 🤝 Soporte

**Si tienes dudas:**
1. Revisar esta guía
2. Consultar el código existente como ejemplo
3. Revisar tests para entender comportamiento esperado
4. Preguntar en el canal de equipo

---

**¡Happy coding!** 🚀

*Última actualización: 31 de Enero, 2026*
