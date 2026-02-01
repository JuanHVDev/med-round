import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"


import { cn } from "@/lib/utils"

/**
 * @description Componente raíz que envuelve todo el sistema de diálogo de alerta.
 * Controla el estado abierto/cerrado y la lógica de accesibilidad.
 * Re-exporta AlertDialogPrimitive.Root de Radix UI.
 * @param {object} props - Props del componente AlertDialogPrimitive.Root
 * @param {boolean} props.open - Controla si el diálogo está abierto (modo controlado)
 * @param {boolean} props.defaultOpen - Estado inicial abierto por defecto
 * @param {function} props.onOpenChange - Callback cuando cambia el estado abierto/cerrado
 * @returns {React.ReactNode} Componente AlertDialog que envuelve hijos
 * @example
 * <AlertDialog>
 *   <AlertDialogTrigger>Abrir</AlertDialogTrigger>
 *   <AlertDialogContent>
 *     <AlertDialogTitle>Título</AlertDialogTitle>
 *     <AlertDialogDescription>Descripción aquí</AlertDialogDescription>
 *   </AlertDialogContent>
 * </AlertDialog>
 */
const AlertDialog = AlertDialogPrimitive.Root

/**
 * @description Botón que activa la apertura del diálogo de alerta.
 * Re-exporta AlertDialogPrimitive.Trigger de Radix UI.
 * @param {object} props - Props del componente AlertDialogPrimitive.Trigger
 * @param {React.ReactNode} props.asChild - Si es true, se fusiona con el hijo para personalizar el elemento
 * @returns {React.ReactNode} Elemento botón que abre el diálogo al hacer click
 * @example
 * <AlertDialogTrigger asChild>
 *   <Button variant="destructive">Eliminar cuenta</Button>
 * </AlertDialogTrigger>
 */
const AlertDialogTrigger = AlertDialogPrimitive.Trigger

/**
 * @description Portal que renderiza el contenido del diálogo fuera del DOM principal,
 * típicamente en un nodo portal para evitar problemas con z-index y stacking context.
 * Re-exporta AlertDialogPrimitive.Portal de Radix UI.
 * @param {object} props - Props del componente AlertDialogPrimitive.Portal
 * @param {HTMLElement} props.container - Elemento contenedor para el portal (default: document.body)
 * @param {React.ReactNode} props.children - Contenido a renderizar en el portal
 * @returns {React.ReactPortal} Portal de React renderizado fuera del DOM principal
 * @example
 * <AlertDialogPortal>
 *   <AlertDialogOverlay />
 *   <AlertDialogContent>Contenido</AlertDialogContent>
 * </AlertDialogPortal>
 */
const AlertDialogPortal = AlertDialogPrimitive.Portal

/**
 * @description Fondo oscuro semitransparente que cubre toda la pantalla detrás del diálogo.
 * Incluye animaciones de entrada y salida cuando el diálogo se abre/cierra.
 * @param {object} props - Props del overlay
 * @param {string} [props.className] - Clases CSS adicionales para estilizado personalizado
 * @param {React.RefObject} ref - Referencia al elemento DOM del overlay
 * @returns {React.ReactNode} Elemento div con fondo oscuro y animaciones
 * @example
 * <AlertDialogOverlay className="bg-black/50" />
 */
const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

/**
 * @description Contenedor principal del diálogo modal que incluye el portal, overlay y contenido.
 * Centra el diálogo en la pantalla con animaciones de entrada/salida y bordes redondeados.
 * @param {object} props - Props del contenido
 * @param {string} [props.className] - Clases CSS adicionales para estilizado personalizado
 * @param {React.RefObject} ref - Referencia al elemento DOM del contenido
 * @returns {React.ReactNode} Contenedor del diálogo con portal, overlay y contenido animado
 * @example
 * <AlertDialogContent className="max-w-md">
 *   <AlertDialogHeader>
 *     <AlertDialogTitle>Confirmar acción</AlertDialogTitle>
 *     <AlertDialogDescription>
 *       ¿Estás seguro de que deseas continuar?
 *     </AlertDialogDescription>
 *   </AlertDialogHeader>
 *   <AlertDialogFooter>
 *     <AlertDialogCancel>Cancelar</AlertDialogCancel>
 *     <AlertDialogAction>Confirmar</AlertDialogAction>
 *   </AlertDialogFooter>
 * </AlertDialogContent>
 */
const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    />
  </AlertDialogPortal>
))
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

/**
 * @description Contenedor del encabezado del diálogo que organiza el título y descripción.
 * Utiliza flexbox para centrar el contenido en móvil y alinear a la izquierda en desktop.
 * @param {object} props - Props del componente
 * @param {string} [props.className] - Clases CSS adicionales para estilizado personalizado
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Atributos HTML del elemento div
 * @returns {React.ReactNode} Elemento div estilizado como encabezado del diálogo
 * @example
 * <AlertDialogHeader>
 *   <AlertDialogTitle>Título importante</AlertDialogTitle>
 *   <AlertDialogDescription>Descripción del mensaje</AlertDialogDescription>
 * </AlertDialogHeader>
 */
const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

/**
 * @description Contenedor del pie del diálogo para los botones de acción.
 * Organiza los botones en columna en móvil y en fila alineados a la derecha en desktop.
 * @param {object} props - Props del componente
 * @param {string} [props.className] - Clases CSS adicionales para estilizado personalizado
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Atributos HTML del elemento div
 * @returns {React.ReactNode} Elemento div estilizado como pie del diálogo con botones
 * @example
 * <AlertDialogFooter>
 *   <AlertDialogCancel>Cancelar</AlertDialogCancel>
 *   <AlertDialogAction>Confirmar</AlertDialogAction>
 * </AlertDialogFooter>
 */
const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

/**
 * @description Título principal del diálogo de alerta.
 * Renderiza el texto del título con estilos de texto grande y semibold.
 * @param {object} props - Props del título
 * @param {string} [props.className] - Clases CSS adicionales para estilizado personalizado
 * @param {React.RefObject} ref - Referencia al elemento DOM del título
 * @returns {React.ReactNode} Elemento h2 estilizado como título del diálogo
 * @example
 * <AlertDialogTitle>¿Eliminar cuenta permanentemente?</AlertDialogTitle>
 */
const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

/**
 * @description Descripción o mensaje informativo del diálogo de alerta.
 * Muestra texto con estilo de texto secundario (muted foreground) y tamaño pequeño.
 * @param {object} props - Props de la descripción
 * @param {string} [props.className] - Clases CSS adicionales para estilizado personalizado
 * @param {React.RefObject} ref - Referencia al elemento DOM de la descripción
 * @returns {React.ReactNode} Elemento p estilizado como descripción del diálogo
 * @example
 * <AlertDialogDescription>
 *   Esta acción no se puede deshacer. Tu cuenta será eliminada permanentemente.
 * </AlertDialogDescription>
 */
const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName

/**
 * @description Botón de acción principal del diálogo, típicamente para confirmar.
 * Estilizado con el color primario del tema y efecto hover.
 * @param {object} props - Props del botón de acción
 * @param {string} [props.className] - Clases CSS adicionales para estilizado personalizado
 * @param {React.RefObject} ref - Referencia al elemento DOM del botón
 * @returns {React.ReactNode} Elemento button estilizado como acción principal
 * @example
 * <AlertDialogAction onClick={handleConfirm}>Confirmar eliminación</AlertDialogAction>
 */
const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn("bg-primary text-primary-foreground hover:bg-primary/90", className)}
    {...props}
  />
))
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

/**
 * @description Botón de cancelar que cierra el diálogo sin realizar la acción.
 * Estilizado con borde y fondo de fondo, cambia de color al hacer hover.
 * @param {object} props - Props del botón de cancelar
 * @param {string} [props.className] - Clases CSS adicionales para estilizado personalizado
 * @param {React.RefObject} ref - Referencia al elemento DOM del botón
 * @returns {React.ReactNode} Elemento button estilizado como cancelar
 * @example
 * <AlertDialogCancel>Cancelar</AlertDialogCancel>
 */
const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(
      "mt-2 sm:mt-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      className
    )}
    {...props}
  />
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
