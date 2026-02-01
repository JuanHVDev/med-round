import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Configuración de variantes de estilo para el componente Button.
 *
 * Define las combinaciones de estilos predefinidas para diferentes contextos de uso:
 * - Variantes visuales: default, destructive, outline, secondary, ghost, link
 * - Tamaños: default, xs, sm, lg, icon (y variantes icon-xs, icon-sm, icon-lg)
 *
 * Utiliza class-variance-authority (CVA) para generar tipos TypeScript
 * y manejar la combinación de variantes de forma type-safe.
 *
 * @param props - Objeto con variant y size para generar clases CSS
 * @returns String de clases CSS para el botón
 *
 * @example
 * // Botón con variante destructiva y tamaño pequeño
 * buttonVariants({ variant: "destructive", size: "sm" })
 *
 * @see {@link Button} Componente que utiliza estas variantes
 * @see {@link https://cva.style/docs} Documentación de CVA
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/**
 * Componente Button interactivo basado en Radix UI Slot.
 *
 * Botón altamente personalizable con soporte para múltiples variantes visuales,
 * tamaños y la capacidad de renderizar como elemento hijo (asChild) para casos
 * como enlaces que deben verse como botones.
 *
 * Características:
 * - 6 variantes visuales: default, destructive, outline, secondary, ghost, link
 * - 7 tamaños: default, xs, sm, lg, icon, icon-xs, icon-sm, icon-lg
 * - Soporte para iconos SVG integrados
 * - Estados de focus, hover, disabled y aria-invalid
 * - Renderizado flexible con asChild para componentes personalizados
 *
 * @param props - Props extendidas de button HTML + variantes de estilo
 * @param props.variant - Estilo visual del botón (default: "default")
 * @param props.size - Tamaño del botón (default: "default")
 * @param props.asChild - Si true, renderiza el children en lugar de <button>
 * @returns Componente Button renderizado
 *
 * @example
 * // Botón básico
 * <Button>Click me</Button>
 *
 * @example
 * // Botón con variante y tamaño personalizados
 * <Button variant="outline" size="sm">
 *   <Plus className="w-4 h-4" />
 *   Agregar
 * </Button>
 *
 * @example
 * // Botón como enlace
 * <Button asChild variant="link">
 *   <a href="/login">Iniciar sesión</a>
 * </Button>
 *
 * @example
 * // Botón deshabilitado
 * <Button disabled variant="destructive">
 *   Eliminar
 * </Button>
 *
 * @see {@link buttonVariants} Configuración de variantes de estilo
 * @see {@link https://www.radix-ui.com/primitives/docs/utilities/slot} Radix Slot
 */
function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
