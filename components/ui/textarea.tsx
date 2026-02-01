import * as React from "react"

import { cn } from "@/lib/utils"

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

/**
 * Componente Textarea estilizado para formularios.
 *
 * Área de texto multilinea con soporte completo para:
 * - Altura mínima configurable (60px por defecto)
 * - Estados de focus, disabled, readonly
 * - Integración con React Hook Form mediante forwardRef
 * - Placeholder estilizado
 * - Estilos consistentes con el sistema de diseño
 * - Auto-expansión mediante estilos CSS
 *
 * @param props - Props extendidas de textarea HTML
 * @param props.className - Clases CSS adicionales
 * @param ref - Referencia para React Hook Form o acceso directo al DOM
 * @returns Componente Textarea renderizado
 *
 * @example
 * // Textarea básico
 * <Textarea placeholder="Describe los síntomas del paciente..." />
 *
 * @example
 * // Textarea con React Hook Form
 * <Controller
 *   name="notes"
 *   control={control}
 *   render={({ field }) => (
 *     <Textarea {...field} rows={4} placeholder="Notas médicas" />
 *   )}
 * />
 *
 * @example
 * // Textarea deshabilitado
 * <Textarea disabled value="Información predefinida" />
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }