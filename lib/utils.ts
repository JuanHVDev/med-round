import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina múltiples clases CSS con soporte para condicionales, arrays y objetos,
 * resolviendo conflictos de Tailwind CSS mediante tailwind-merge.
 *
 * Esta función es la utilidad principal para manejar clases dinámicas en componentes,
 * permitiendo combinar clases base, variantes, estados condicionales y clases personalizadas
 * de forma limpia y type-safe.
 *
 * @param inputs - Clases CSS a combinar. Acepta:
 *   - Strings de clases CSS
 *   - Arrays de strings
 *   - Objetos con claves de clase y valores booleanos (condicionales)
 *   - Valores null, undefined, false (serán ignorados)
 * @returns String con clases CSS combinadas, deduplicadas y optimizadas
 *
 * @example
 * // Uso básico
 * cn("px-4 py-2", "bg-blue-500")
 * // Returns: "px-4 py-2 bg-blue-500"
 *
 * @example
 * // Con condicionales
 * cn("px-4 py-2", {
 *   "bg-blue-500": isPrimary,
 *   "bg-gray-500": !isPrimary,
 *   "text-white": isPrimary
 * })
 *
 * @example
 * // Combinando variantes de shadcn/ui
 * cn(buttonVariants({ variant: "outline" }), "w-full", className)
 *
 * @see {@link https://github.com/lukeed/clsx} clsx - Librería base para combinar clases
 * @see {@link https://github.com/dcastil/tailwind-merge} tailwind-merge - Resolución de conflictos Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
