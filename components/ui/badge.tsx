import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * @description Variantes de estilo para el componente Badge utilizando class-variance-authority.
 * Define múltiples variantes visuales: default, secondary, destructive, outline, ghost y link.
 * Cada variante incluye colores de fondo, texto y estados de hover específicos.
 * @returns {ReturnType<typeof cva>} - Configuración de variantes de clase
 * @example
 * // Variante por defecto
 * badgeVariants({ variant: "default" })
 *
 * // Variante destructiva
 * badgeVariants({ variant: "destructive" })
 *
 * // Variante outline
 * badgeVariants({ variant: "outline" })
 */
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-transparent px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * @description Componente Badge para mostrar etiquetas de estado, contadores o categorías.
 * Soporta múltiples variantes visuales y puede renderizar como un elemento span o usar el patrón asChild.
 * @param {string} className - Clases CSS adicionales para personalización
 * @param {"default" | "secondary" | "destructive" | "outline" | "ghost" | "link"} variant - Variante visual del badge (por defecto: "default")
 * @param {boolean} asChild - Si es true, usa el patrón Slot de Radix para renderizar hijos
 * @param {React.ComponentProps<"span">} props - Props adicionales del elemento span
 * @returns {React.ReactElement} - Elemento Badge renderizado
 * @example
 * // Badge básico
 * <Badge>Nuevo</Badge>
 *
 * // Badge con variante destructiva
 * <Badge variant="destructive">Eliminado</Badge>
 *
 * // Badge con variante outline
 * <Badge variant="outline">Borrador</Badge>
 *
 * // Badge como enlace
 * <Badge asChild>
 *   <a href="/notifications">5 notificaciones</a>
 * </Badge>
 *
 * // Badge con ícono
 * <Badge variant="secondary">
 *   <Check className="h-3 w-3" />
 *   Completado
 * </Badge>
 */
function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
