/**
 * @fileoverview Middleware de CORS (Cross-Origin Resource Sharing) para MedRound
 *
 * Configura políticas CORS para permitir solicitudes desde:
 * - Desarrollo local (localhost:3000)
 * - Dominio de producción (NEXT_PUBLIC_APP_URL)
 *
 * Esta configuración previene CSRF y asegura que solo orígenes autorizados
 * puedan interactuar con la API, mientras permite el desarrollo local.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS} CORS MDN
 * @see {@link https://owasp.org/www-community/attacks/csrf} CSRF OWASP
 */

/**
 * Lista de orígenes permitidos para CORS.
 *
 * @constant
 * @type {string[]}
 */
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  process.env.NEXT_PUBLIC_APP_URL,
].filter((origin): origin is string => typeof origin === "string" && origin.length > 0);

/**
 * Headers CORS por defecto para respuestas.
 *
 * @constant
 * @type {Record<string, string>}
 */
const DEFAULT_CORS_HEADERS = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Max-Age": "86400", // 24 horas
} as const;

/**
 * Verifica si un origen está en la lista de permitidos.
 *
 * @param {string | null} origin - El origen a verificar
 * @returns {boolean} true si el origen está permitido
 */
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin);
}

/**
 * Genera headers CORS para una solicitud.
 *
 * @param {Request} request - La solicitud HTTP entrante
 * @returns {Record<string, string>} Headers CORS a aplicar
 *
 * @example
 * // En una API route
 * export async function POST(request: Request) {
 *   const corsHeaders = getCorsHeaders(request);
 *
 *   if (request.method === 'OPTIONS') {
 *     return new Response(null, { headers: corsHeaders, status: 204 });
 *   }
 *
 *   // ... procesar solicitud
 *   return Response.json(data, { headers: corsHeaders });
 * }
 */
export function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin");

  if (!isOriginAllowed(origin)) {
    // No incluir Access-Control-Allow-Origin para orígenes no permitidos
    return {};
  }

  return {
    "Access-Control-Allow-Origin": origin!,
    ...DEFAULT_CORS_HEADERS,
  };
}

/**
 * Maneja solicitudes OPTIONS (preflight) para CORS.
 *
 * @param {Request} request - La solicitud OPTIONS entrante
 * @returns {Response | null} Respuesta 204 si es preflight válido, null si no
 *
 * @example
 * export async function OPTIONS(request: Request) {
 *   const response = handleCorsPreflight(request);
 *   if (response) return response;
 *   // ... manejar otros casos
 * }
 */
export function handleCorsPreflight(request: Request): Response | null {
  if (request.method !== "OPTIONS") {
    return null;
  }

  const corsHeaders = getCorsHeaders(request);

  // Si no hay headers CORS, el origen no está permitido
  if (Object.keys(corsHeaders).length === 0) {
    return new Response("CORS not allowed", { status: 403 });
  }

  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * Middleware completo de CORS para API routes.
 *
 * Combina verificación de origen y generación de headers.
 * Usar este helper para simplificar la implementación en routes.
 *
 * @param {Request} request - La solicitud entrante
 * @returns {{ allowed: boolean; headers: Record<string, string> }} Resultado del chequeo CORS
 *
 * @example
 * // Uso simple en API route
 * export async function POST(request: Request) {
 *   const cors = corsMiddleware(request);
 *
 *   if (!cors.allowed) {
 *     return Response.json({ error: 'CORS not allowed' }, { status: 403 });
 *   }
 *
 *   // Procesar solicitud...
 *   return Response.json(result, { headers: cors.headers });
 * }
 */
export function corsMiddleware(request: Request): {
  allowed: boolean;
  headers: Record<string, string>;
} {
  const headers = getCorsHeaders(request);
  const allowed = Object.keys(headers).length > 0;

  return { allowed, headers };
}
