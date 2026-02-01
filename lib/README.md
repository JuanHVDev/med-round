# Biblioteca de Utilidades (lib/)

Este directorio contiene todas las utilidades, configuraciones y helpers del proyecto MedRound.

## 📁 Estructura

```
lib/
├── auth.ts                 # Configuración de Better Auth
├── auth-client.ts         # Cliente de autenticación
├── cors.ts                # Middleware CORS 🆕
├── email.ts               # Servicio de email con Resend
├── errors.ts              # Sistema de errores tipado
├── prisma.ts              # Cliente Prisma singleton
├── rate-limit.ts          # Rate limiting con Upstash Redis
├── registerSchema.ts      # Schemas Zod para registro
├── sanitize.ts            # Sanitización XSS con DOMPurify 🆕
└── utils.ts               # Utilidades generales (cn, etc.)
```

---

## 🔐 Nuevas Utilidades de Seguridad

### `cors.ts` - Middleware CORS

Maneja Cross-Origin Resource Sharing para APIs.

**Uso básico:**
```typescript
import { corsMiddleware } from '@/lib/cors'

export async function POST(request: Request) {
  const cors = corsMiddleware(request)
  
  if (!cors.allowed) {
    return Response.json({ error: 'CORS not allowed' }, { status: 403 })
  }
  
  // ... tu lógica
  
  return Response.json(data, { headers: cors.headers })
}
```

**API:**
- `corsMiddleware(request)` - Middleware completo con verificación
- `getCorsHeaders(request)` - Obtiene solo los headers CORS
- `handleCorsPreflight(request)` - Maneja solicitudes OPTIONS

**Configuración:**
Editar `ALLOWED_ORIGINS` para agregar/quitar dominios permitidos.

---

### `sanitize.ts` - Sanitización XSS

Limpia datos de entrada para prevenir ataques XSS.

**Funciones disponibles:**

#### `sanitizeText(input: string): string`
Elimina TODO código HTML/JS. Para campos de texto plano.

```typescript
import { sanitizeText } from '@/lib/sanitize'

const clean = sanitizeText("<script>alert(1)</script>Dr. Pérez")
// Resultado: "Dr. Pérez"
```

#### `sanitizeHtml(input: string): string`
Permite etiquetas básicas: `<b>`, `<i>`, `<em>`, `<strong>`, `<p>`, `<br>`

```typescript
import { sanitizeHtml } from '@/lib/sanitize'

const clean = sanitizeHtml("<b>Nota:</b> <script>alert(1)</script>Revisar")
// Resultado: "<b>Nota:</b> Revisar"
```

#### `sanitizeEmail(email: string): string`
Limpia y valida formato de email. Retorna string vacío si es inválido.

```typescript
import { sanitizeEmail } from '@/lib/sanitize'

const clean = sanitizeEmail("user@hospital.com")  // ✓ "user@hospital.com"
const invalid = sanitizeEmail("no-es-email")      // ✗ ""
```

#### `sanitizeProfileData(data: ProfileData): ProfileData`
Sanitiza objeto completo de perfil médico.

```typescript
import { sanitizeProfileData } from '@/lib/sanitize'

const clean = sanitizeProfileData({
  fullName: "<script>...</script>Dr. Pérez",
  hospital: "Hospital Central",
  specialty: "Cardiología"
})
```

**⚠️ Importante:** Siempre sanitizar datos ANTES de guardar en base de datos.

---

## 🛠️ Utilidades Existentes

### `utils.ts`

#### `cn(...inputs: ClassValue[]): string`
Combina clases CSS de Tailwind con condicionales.

```typescript
import { cn } from '@/lib/utils'

const className = cn(
  "px-4 py-2",
  "bg-blue-500",
  { "text-white": isPrimary },
  className  // clases del usuario
)
```

---

### `errors.ts`

Sistema de errores tipado.

**Clases disponibles:**
- `ValidationError` - Errores de validación (400)
- `DatabaseError` - Errores de base de datos (500)
- `DuplicateError` - Errores de duplicado (409)
- `AuthenticationError` - Errores de autenticación (401)
- `AuthorizationError` - Errores de autorización (403)
- `NotFoundError` - Recurso no encontrado (404)
- `RateLimitError` - Rate limiting (429)
- `EmailError` - Errores de email (500)

**Uso:**
```typescript
import { ValidationError, ErrorCodes } from '@/lib/errors'

throw new ValidationError('Email inválido')
```

**Códigos de error:**
```typescript
ErrorCodes.VALIDATION_ERROR
ErrorCodes.DATABASE_ERROR
ErrorCodes.DUPLICATE_ERROR
// ... etc
```

---

### `prisma.ts`

Cliente Prisma singleton.

**Uso:**
```typescript
import { prisma } from '@/lib/prisma'

const users = await prisma.user.findMany()
```

**Características:**
- Singleton pattern (evita múltiples instancias en desarrollo)
- Soporta PostgreSQL (producción) y SQLite (tests)
- Logging en desarrollo

---

### `registerSchema.ts`

Schemas Zod para formularios.

**Exports:**
- `formSchema` - Schema completo de registro
- `FormData` - Tipo TypeScript inferido

**Uso:**
```typescript
import { formSchema, type FormData } from '@/lib/registerSchema'
import { zodResolver } from '@hookform/resolvers/zod'

const form = useForm<FormData>({
  resolver: zodResolver(formSchema)
})
```

---

## 📚 Documentación

- [Guía de Seguridad](../SECURITY_GUIDE.md) - Detalles de CORS y sanitización
- [Guía para Developers](../DEVELOPER_GUIDE.md) - Uso práctico de utilidades

---

**Nota:** Las utilidades marcadas con 🆕 son nuevas de esta implementación.
