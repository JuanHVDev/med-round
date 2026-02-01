import * as React from "react"

import { cn } from "@/lib/utils"

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

/**
 * Componente Input estilizado para formularios.
 *
 * Campo de entrada de texto con soporte completo para:
 * - Todos los tipos de input HTML (text, email, password, number, etc.)
 * - Estados de focus, disabled, readonly
 * - Integración con React Hook Form mediante forwardRef
 * - Estilos consistentes con el sistema de diseño de MedRound
 * - Soporte para íconos y elementos decorativos
 *
 * @param props - Props extendidas de input HTML
 * @param props.type - Tipo de input (text, email, password, etc.)
 * @param props.className - Clases CSS adicionales
 * @param ref - Referencia para React Hook Form o acceso directo al DOM
 * @returns Componente Input renderizado
 *
 * @example
 * // Input básico
 * <Input type="text" placeholder="Nombre completo" />
 *
 * @example
 * // Input con React Hook Form
 * <Controller
 *   name="email"
 *   control={control}
 *   render={({ field }) => (
 *     <Input {...field} type="email" placeholder="correo@hospital.com" />
 *   )}
 * />
 *
 * @example
 * // Input deshabilitado
 * <Input disabled type="text" value="Hospital Central" />
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }