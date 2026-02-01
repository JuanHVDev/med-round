import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * @description Variantes de estilo para el componente Label utilizando class-variance-authority.
 * Define estilos base para etiquetas de formulario con soporte para estados deshabilitados.
 * @returns {ReturnType<typeof cva>} - Configuración de variantes de clase
 * @example
 * // Uso básico con las variantes
 * labelVariants()
 *
 * // Combinar con otras clases
 * cn(labelVariants(), "text-red-500")
 */
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

/**
 * @description Componente Label para etiquetas de campos de formulario.
 * Extiende el componente LabelPrimitive de Radix UI con estilos consistentes y variantes.
 * @param {string} className - Clases CSS adicionales para personalización
 * @param {React.ElementRef<typeof LabelPrimitive.Root>} ref - Referencia al elemento DOM subyacente
 * @param {React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>} props - Props adicionales del componente LabelPrimitive
 * @param {VariantProps<typeof labelVariants>} variantProps - Props de variantes para estilos
 * @returns {React.ReactElement} - Elemento Label renderizado
 * @example
 * // Uso básico
 * <Label htmlFor="email">Correo electrónico</Label>
 *
 * // Con clases personalizadas
 * <Label htmlFor="name" className="text-lg font-bold">Nombre</Label>
 *
 * // En un formulario con campo deshabilitado
 * <div>
 *   <Label htmlFor="disabled-field">Campo deshabilitado</Label>
 *   <input id="disabled-field" disabled />
 * </div>
 */
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
