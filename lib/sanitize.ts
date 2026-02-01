import DOMPurify from "isomorphic-dompurify"

/**
 * Sanitiza un string para eliminar todo código HTML/JavaScript malicioso.
 *
 * Esta función es la más restrictiva y debe usarse para campos de texto
 * que no requieren formato HTML (nombres, hospitales, IDs, etc.).
 *
 * Elimina:
 * - Todas las etiquetas HTML (<script>, <img>, etc.)
 * - Event handlers (onclick, onerror, etc.)
 * - JavaScript en URLs (javascript:alert(1))
 * - Entidades HTML peligrosas
 *
 * @param input - El string a sanitizar
 * @returns String limpio sin código HTML/JS
 *
 * @example
 * sanitizeText("Dr. <script>alert(1)</script>Pérez")
 * // Returns: "Dr. Pérez"
 *
 * @example
 * sanitizeText("Hospital <img src=x onerror=alert(1)>Central")
 * // Returns: "Hospital Central"
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== "string") {
    return ""
  }

  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  })
}

/**
 * Sanitiza HTML permitiendo solo etiquetas básicas de formato.
 *
 * Usar para campos que necesitan formato simple (negrita, cursiva, etc.)
 * pero sin permitir scripts o estilos peligrosos.
 *
 * Etiquetas permitidas: b, i, em, strong, p, br
 * Atributos: Ninguno (para evitar onclick, onerror, etc.)
 *
 * @param input - El string HTML a sanitizar
 * @returns HTML limpio con solo etiquetas seguras
 *
 * @example
 * sanitizeHtml("<b>Importante:</b> <script>alert(1)</script>Revisar")
 * // Returns: "<b>Importante:</b> Revisar"
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== "string") {
    return ""
  }

  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br"],
    ALLOWED_ATTR: [],
  })
}

/**
 * Sanitiza un email permitiendo solo caracteres válidos.
 *
 * Además de usar DOMPurify, valida el formato básico del email.
 *
 * @param email - El email a sanitizar
 * @returns Email limpio o string vacío si es inválido
 *
 * @example
 * sanitizeEmail("<script>alert(1)</script>user@hospital.com")
 * // Returns: "user@hospital.com"
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== "string") {
    return ""
  }

  // Eliminar código malicioso
  const clean = DOMPurify.sanitize(email, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  })

  // Validar formato básico de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(clean)) {
    return ""
  }

  return clean.toLowerCase().trim()
}

/**
 * Sanitiza datos de perfil médico completo.
 *
 * Función helper para sanitizar todos los campos de un objeto de perfil
 * antes de guardarlo en la base de datos.
 *
 * @param data - Objeto con datos del perfil
 * @returns Objeto con todos los strings sanitizados
 */
export function sanitizeProfileData(data: {
  fullName: string
  hospital: string
  specialty: string
  professionalId?: string | null
  universityMatricula?: string | null
}): {
  fullName: string
  hospital: string
  specialty: string
  professionalId: string | null
  universityMatricula: string | null
} {
  return {
    fullName: sanitizeText(data.fullName),
    hospital: sanitizeText(data.hospital),
    specialty: sanitizeText(data.specialty),
    professionalId: data.professionalId ? sanitizeText(data.professionalId) : null,
    universityMatricula: data.universityMatricula ? sanitizeText(data.universityMatricula) : null,
  }
}
