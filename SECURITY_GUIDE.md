# Guía de Seguridad - MedRound

**Versión:** 1.0  
**Última actualización:** Enero 2026

---

## 🔒 Resumen de Medidas de Seguridad Implementadas

Este documento describe todas las medidas de seguridad implementadas en MedRound, cómo funcionan y cómo mantenerlas.

---

## 1. CSP (Content Security Policy)

### ¿Qué es?

CSP es un header HTTP que define qué recursos (scripts, estilos, imágenes) puede cargar tu aplicación. Actúa como un firewall para el navegador.

### Configuración Actual

**Archivo:** `next.config.ts`

```typescript
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self';
  media-src 'self';
  object-src 'none';
  frame-ancestors 'self';
  base-uri 'self';
  form-action 'self';
`.trim();
```

### Directivas Explicadas

| Directiva | Valor | Qué permite | Riesgo |
|-----------|-------|-------------|--------|
| `default-src` | `'self'` | Solo recursos del mismo origen | 🔴 Bajo |
| `script-src` | `'self' 'unsafe-inline' 'unsafe-eval'` | Scripts propios + inline + eval | 🟡 Medio |
| `style-src` | `'self' 'unsafe-inline'` | Estilos propios + inline | 🟡 Medio |
| `img-src` | `'self' data: https:` | Imágenes propias, data URIs, HTTPS | 🟢 Bajo |
| `font-src` | `'self'` | Fuentes solo del mismo origen | 🔴 Bajo |
| `connect-src` | `'self'` | XHR/fetch solo al mismo origen | 🔴 Bajo |
| `object-src` | `'none'` | Bloquea plugins (Flash, etc.) | 🔴 Bajo |
| `frame-ancestors` | `'self'` | Previene clickjacking | 🔴 Bajo |

### ⚠️ Advertencia de Seguridad

La configuración actual es **PERMISIVA** para facilitar el desarrollo. Contiene:
- `'unsafe-inline'` en scripts: Permite `<script>` tags inline
- `'unsafe-eval'`: Permite `eval()` y `new Function()`

### 🔧 Endurecimiento para Producción

**Recomendación:** Cuando la app sea estable, quitar `'unsafe-inline'` y `'unsafe-eval'`:

```typescript
// next.config.ts - Versión endurecida
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self';  // ← Sin 'unsafe-inline' ni 'unsafe-eval'
  style-src 'self' 'unsafe-inline';  // OK mantener para CSS-in-JS
  img-src 'self' data: https://tu-cdn.com;  // ← Especificar dominios
  font-src 'self';
  connect-src 'self' https://api.tu-dominio.com;  // ← Especificar APIs
  media-src 'self';
  object-src 'none';
  frame-ancestors 'none';  // ← Ningún iframe permitido
  base-uri 'self';
  form-action 'self';
`.trim();
```

**Nota:** Esto requerirá:
1. Mover todo JavaScript inline a archivos externos
2. Eliminar uso de `eval()` o `new Function()`
3. Agregar nonces o hashes para scripts inline necesarios

---

## 2. CORS (Cross-Origin Resource Sharing)

### ¿Qué es?

CORS controla qué dominios externos pueden hacer requests a tu API. Previene que sitios maliciosos hagan peticiones a tu backend usando las credenciales de usuarios legítimos.

### Configuración Actual

**Archivo:** `lib/cors.ts`

**Orígenes permitidos:**
- `http://localhost:3000` - Desarrollo local
- `NEXT_PUBLIC_APP_URL` - Producción (ej: `https://medround.app`)

### Headers Enviados

```
Access-Control-Allow-Origin: https://medround.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

### Uso en API Routes

#### Opción 1: Middleware Completo (Recomendado)

```typescript
import { corsMiddleware } from '@/lib/cors'

export async function POST(request: Request) {
  const cors = corsMiddleware(request)
  
  if (!cors.allowed) {
    return Response.json(
      { error: 'CORS not allowed' }, 
      { status: 403 }
    )
  }
  
  // ... tu lógica
  
  return Response.json(result, { headers: cors.headers })
}
```

#### Opción 2: Solo para Preflight

```typescript
import { handleCorsPreflight } from '@/lib/cors'

export async function OPTIONS(request: Request) {
  const response = handleCorsPreflight(request)
  if (response) return response
  
  return new Response(null, { status: 204 })
}
```

### ⚠️ Consideraciones de Seguridad

1. **Nunca uses `*` en producción** con credenciales habilitadas
2. **Especifica exactamente los métodos necesarios**
3. **Revisa los headers permitidos** - no incluyas headers innecesarios
4. **Preflight caching:** 24 horas (`Max-Age: 86400`) reduce overhead

---

## 3. Input Sanitization (DOMPurify)

### ¿Qué es?

Sanitización es el proceso de limpiar datos de entrada para eliminar código malicioso (XSS) antes de almacenarlos.

**Ejemplo:**
```javascript
// Input del usuario:
"<script>alert('Hackeado!')</script>Dr. Juan Pérez"

// Después de sanitizar:
"Dr. Juan Pérez"  // El script malicioso se eliminó
```

### Funciones Disponibles

#### `sanitizeText(input: string): string`

**Uso:** Para campos de texto plano (nombres, hospitales, IDs)

**Elimina:**
- Todas las etiquetas HTML (`<script>`, `<img>`, etc.)
- Event handlers (`onclick`, `onerror`, etc.)
- JavaScript en URLs (`javascript:alert(1)`)
- Entidades HTML peligrosas

**Ejemplo:**
```typescript
import { sanitizeText } from '@/lib/sanitize'

const userInput = "<img src=x onerror=alert(1)>Hospital Central"
const clean = sanitizeText(userInput)
// Resultado: "Hospital Central"
```

#### `sanitizeHtml(input: string): string`

**Uso:** Para campos que necesitan formato básico (negrita, cursiva)

**Permite:** `<b>`, `<i>`, `<em>`, `<strong>`, `<p>`, `<br>`

**Elimina:** Todo lo demás, incluyendo atributos peligrosos

**Ejemplo:**
```typescript
import { sanitizeHtml } from '@/lib/sanitize'

const userInput = "<b>Importante:</b> <script>alert(1)</script>Revisar"
const clean = sanitizeHtml(userInput)
// Resultado: "<b>Importante:</b> Revisar"
```

#### `sanitizeEmail(email: string): string`

**Uso:** Para campos de email

**Hace:**
1. Elimina código malicioso
2. Valida formato de email
3. Convierte a minúsculas
4. Elimina espacios

**Retorna:** Email limpio o string vacío si es inválido

**Ejemplo:**
```typescript
import { sanitizeEmail } from '@/lib/sanitize'

const email = "<script>alert(1)</script>user@hospital.com"
const clean = sanitizeEmail(email)
// Resultado: "user@hospital.com"

const invalid = "not-an-email"
const result = sanitizeEmail(invalid)
// Resultado: "" (string vacío)
```

#### `sanitizeProfileData(data: ProfileData): ProfileData`

**Uso:** Para sanitizar objetos completos de perfil médico

**Ejemplo:**
```typescript
import { sanitizeProfileData } from '@/lib/sanitize'

const profile = {
  fullName: "<script>alert(1)</script>Dr. Juan Pérez",
  hospital: "Hospital <img src=x onerror=alert(1)>Central",
  specialty: "Cardiología",
  professionalId: "MED-12345"
}

const clean = sanitizeProfileData(profile)
// Resultado:
// {
//   fullName: "Dr. Juan Pérez",
//   hospital: "Hospital Central",
//   specialty: "Cardiología",
//   professionalId: "MED-12345",
//   universityMatricula: null
// }
```

### Implementación en Registro

**Archivo:** `services/auth/registrationService.ts`

```typescript
// Sanitización de datos antes de procesar
const sanitizedData: RegistrationData = {
  ...data,
  fullName: sanitizeText(data.fullName),
  email: sanitizeEmail(data.email),
  professionalId: data.professionalId ? sanitizeText(data.professionalId) : undefined,
  universityMatricula: data.universityMatricula ? sanitizeText(data.universityMatricula) : undefined,
  hospital: sanitizeText(data.hospital),
  otherHospital: data.otherHospital ? sanitizeText(data.otherHospital) : undefined,
  specialty: sanitizeText(data.specialty),
}

// Doble verificación en createMedicalProfile
const sanitizedProfile = sanitizeProfileData({
  fullName: data.fullName,
  hospital: data.hospital,
  specialty: data.specialty,
  professionalId: data.professionalId,
  universityMatricula: data.universityMatricula,
})
```

### Reglas de Uso

✅ **SIEMPRE sanitizar:**
- Campos de texto libre ingresados por usuarios
- Campos mostrados en pantalla (output)
- Datos antes de guardar en base de datos
- Parámetros de URL que se muestran

❌ **NO es necesario sanitizar:**
- IDs generados por el sistema (UUIDs)
- Fechas (Date objects)
- Números (ya validados por Zod)
- Datos que nunca se muestran al usuario

---

## 4. Headers de Seguridad Adicionales

### X-Frame-Options: SAMEORIGIN

**Protección:** Clickjacking

**Descripción:** Evita que tu sitio se embeba en iframes de otros dominios. Los atacantes podrían hacer clic invisible en elementos de tu página.

**Ejemplo de ataque bloqueado:**
```html
<!-- Sitio malicioso intenta embeber MedRound -->
<iframe src="https://medround.com/login" style="opacity: 0;">
<!-- Usuario hace clic pensando que es otro sitio -->
```

### X-Content-Type-Options: nosniff

**Protección:** MIME sniffing

**Descripción:** Evita que el navegador adivine el tipo de contenido de archivos. Previene que un archivo .txt con JavaScript sea ejecutado como script.

### Referrer-Policy: strict-origin-when-cross-origin

**Protección:** Privacidad de datos

**Descripción:** Cuando un usuario navega de MedRound a otro sitio, solo se envía el origen (dominio), no la URL completa con parámetros sensibles.

**Ejemplo:**
```
De: https://medround.com/patient/12345?token=abc123
A otro sitio: Solo se envía https://medround.com
```

### Permissions-Policy

**Desactiva APIs potencialmente peligrosas:**
- `camera=()` - Sin acceso a cámara
- `microphone=()` - Sin acceso a micrófono
- `geolocation=()` - Sin acceso a ubicación

**Por qué:** Aunque MedRound no usa estas APIs, un atacante con XSS podría intentar usarlas. Mejor desactivarlas completamente.

### Strict-Transport-Security (HSTS)

**Configuración:**
```
max-age=31536000; includeSubDomains; preload
```

**Efecto:**
1. Fuerza HTTPS por 1 año
2. Aplica a todos los subdominios
3. Permite preload en listas de navegadores

**Nota:** Solo aplicable en producción con HTTPS configurado.

---

## 5. Password Hashing

### Implementación

**Manejado por:** Better Auth

**Algoritmo:** bcrypt

**Configuración por defecto:**
- Salt rounds: 10 (configurable)
- Algoritmo: bcrypt
- Hashing automático en registro
- Verificación automática en login

**No requiere configuración manual.** Better Auth maneja todo automáticamente.

---

## 6. Checklist de Auditoría de Seguridad

### Verificación Mensual

```bash
# 1. Verificar headers de seguridad
curl -I https://tu-dominio.com

# Deberías ver:
# content-security-policy: ...
# x-frame-options: SAMEORIGIN
# x-content-type-options: nosniff
# referrer-policy: strict-origin-when-cross-origin
# strict-transport-security: max-age=31536000

# 2. Verificar que sanitización funciona
# Crear un usuario con input malicioso y verificar que se limpia

# 3. Verificar CORS
# Intentar request desde origen no permitido (debe fallar)
```

### Herramientas Recomendadas

1. **securityheaders.com** - Analiza headers de seguridad
2. **observatory.mozilla.org** - Auditoría completa de seguridad
3. **csp-evaluator.withgoogle.com** - Analiza configuración CSP

### Pruebas de Penetración Básicas

#### Test 1: XSS Reflejado
```bash
# Intentar inyectar script en formulario
curl -X POST https://tu-api.com/register \
  -H "Content-Type: application/json" \
  -d '{"fullName": "<script>alert(1)</script>Test"}'

# Verificar que se guarda como "Test" sin el script
```

#### Test 2: Clickjacking
```html
<!-- Crear archivo test-clickjack.html -->
<iframe src="https://tu-dominio.com/login" width="500" height="500">
<!-- Si no carga o muestra error en consola, X-Frame-Options funciona -->
```

#### Test 3: CORS
```bash
# Desde un dominio diferente (o localhost diferente)
curl -H "Origin: https://evil.com" \
     https://tu-api.com/api/tasks

# Debería retornar 403 o sin headers CORS
```

---

## 7. Respuesta a Incidentes

### Si Detectas un XSS

1. **Identificar entrada:** ¿Qué campo permitió el script?
2. **Verificar sanitización:** Revisar si pasa por `sanitizeText()` o similar
3. **Agregar sanitización faltante**
4. **Limpiar BD:** Buscar y limpiar registros maliciosos existentes
5. **Auditar logs:** Revisar si alguien explotó la vulnerabilidad

### Si Detectas Problemas de CORS

1. **Verificar origen:** ¿El dominio está en `ALLOWED_ORIGINS`?
2. **Verificar headers:** ¿Los headers de la solicitud están permitidos?
3. **Verificar método:** ¿El método HTTP está en la lista blanca?
4. **Logs:** Revisar errores en consola del navegador

---

## 📚 Referencias

- [OWASP CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [OWASP CORS Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/CORS_Cheat_Sheet.html)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)

---

**Última actualización:** 31 de Enero, 2026  
**Próxima revisión recomendada:** Febrero 2026
