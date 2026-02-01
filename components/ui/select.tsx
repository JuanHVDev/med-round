import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Componente raíz del Select que envuelve toda la funcionalidad del dropdown.
 * Gestiona el estado abierto/cerrado y provee contexto a los componentes hijos.
 *
 * @description Componente contenedor que controla el estado y comportamiento del select dropdown.
 * @param {object} props - Props heredados de SelectPrimitive.Root
 * @param {boolean} [props.defaultOpen] - Estado inicial abierto del dropdown
 * @param {boolean} [props.open] - Estado controlado del dropdown
 * @param {function} [props.onOpenChange] - Callback cuando cambia el estado abierto/cerrado
 * @param {string} [props.defaultValue] - Valor por defecto seleccionado
 * @param {string} [props.value] - Valor controlado seleccionado
 * @param {function} [props.onValueChange] - Callback cuando cambia el valor seleccionado
 * @param {boolean} [props.disabled] - Deshabilita la interacción con el select
 * @param {React.ReactNode} props.children - Componentes hijos (SelectTrigger, SelectContent)
 * @returns {JSX.Element} Componente Select con contexto para sus hijos
 * @example
 * <Select defaultValue="option1" onValueChange={(value) => console.log(value)}>
 *   <SelectTrigger>
 *     <SelectValue placeholder="Selecciona una opción" />
 *   </SelectTrigger>
 *   <SelectContent>
 *     <SelectItem value="option1">Opción 1</SelectItem>
 *     <SelectItem value="option2">Opción 2</SelectItem>
 *   </SelectContent>
 * </Select>
 */
const Select = SelectPrimitive.Root

/**
 * Agrupa opciones relacionadas dentro del dropdown del Select.
 * Útil para organizar opciones en categorías con SelectLabel.
 *
 * @description Grupo lógico que agrupa múltiples SelectItem relacionados.
 * @param {object} props - Props heredados de SelectPrimitive.Group
 * @param {React.ReactNode} props.children - SelectItem y SelectLabel elementos agrupados
 * @returns {JSX.Element} Grupo de opciones envuelto en contexto de grupo
 * @example
 * <SelectContent>
 *   <SelectGroup>
 *     <SelectLabel>Frutas</SelectLabel>
 *     <SelectItem value="apple">Manzana</SelectItem>
 *     <SelectItem value="banana">Banana</SelectItem>
 *   </SelectGroup>
 *   <SelectGroup>
 *     <SelectLabel>Verduras</SelectLabel>
 *     <SelectItem value="carrot">Zanahoria</SelectItem>
 *   </SelectGroup>
 * </SelectContent>
 */
const SelectGroup = SelectPrimitive.Group

/**
 * Muestra el valor seleccionado actualmente o un placeholder cuando no hay selección.
 * Se coloca dentro del SelectTrigger para mostrar la opción activa.
 *
 * @description Componente que renderiza el texto del valor seleccionado o placeholder.
 * @param {object} props - Props heredados de SelectPrimitive.Value
 * @param {string} [props.placeholder] - Texto mostrado cuando no hay valor seleccionado
 * @returns {JSX.Element} Elemento span con el valor seleccionado o placeholder
 * @example
 * <SelectTrigger>
 *   <SelectValue placeholder="Selecciona un país" />
 * </SelectTrigger>
 *
 * @example
 * <SelectValue placeholder={<span className="text-muted-foreground">Elegir opción...</span>} />
 */
const SelectValue = SelectPrimitive.Value

/**
 * Botón desencadenador que abre el dropdown del Select al hacer clic.
 * Muestra el valor seleccionado y un icono de flecha hacia abajo.
 *
 * @description Botón trigger estilizado que activa la apertura del menú dropdown.
 * @param {object} props - Props del componente
 * @param {string} [props.className] - Clases CSS adicionales para estilizado
 * @param {React.ReactNode} props.children - Contenido del trigger (generalmente SelectValue)
 * @param {React.Ref} ref - Referencia forwarded al elemento button subyacente
 * @returns {JSX.Element} Botón trigger con estilos de input y flecha desplegable
 * @example
 * <SelectTrigger>
 *   <SelectValue placeholder="Selecciona una opción" />
 * </SelectTrigger>
 *
 * @example
 * <SelectTrigger className="w-[280px] border-primary">
 *   <SelectValue />
 * </SelectTrigger>
 */
const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

/**
 * Botón de scroll hacia arriba que aparece cuando el contenido del dropdown es scrollable.
 * Permite navegar hacia opciones anteriores en listas largas.
 *
 * @description Botón automático para hacer scroll hacia arriba en el contenido desplegable.
 * @param {object} props - Props del componente
 * @param {string} [props.className] - Clases CSS adicionales para estilizado
 * @param {React.Ref} ref - Referencia forwarded al elemento button
 * @returns {JSX.Element | null} Botón con icono ChevronUp o null si no es necesario
 * @example
 * <SelectContent>
 *   <SelectScrollUpButton />
 *   <SelectViewport>...</SelectViewport>
 *   <SelectScrollDownButton />
 * </SelectContent>
 */
const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

/**
 * Botón de scroll hacia abajo que aparece cuando el contenido del dropdown es scrollable.
 * Permite navegar hacia opciones posteriores en listas largas.
 *
 * @description Botón automático para hacer scroll hacia abajo en el contenido desplegable.
 * @param {object} props - Props del componente
 * @param {string} [props.className] - Clases CSS adicionales para estilizado
 * @param {React.Ref} ref - Referencia forwarded al elemento button
 * @returns {JSX.Element | null} Botón con icono ChevronDown o null si no es necesario
 * @example
 * <SelectContent>
 *   <SelectScrollUpButton />
 *   <SelectViewport>...</SelectViewport>
 *   <SelectScrollDownButton />
 * </SelectContent>
 *
 * @example
 * <SelectContent>
 *   <SelectScrollDownButton className="bg-muted" />
 * </SelectContent>
 */
const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

/**
 * Contenedor del dropdown que muestra las opciones disponibles del Select.
 * Incluye botones de scroll, viewport y animaciones de apertura/cierre.
 *
 * @description Contenedor desplegable con opciones, scroll y animaciones.
 * @param {object} props - Props del componente
 * @param {string} [props.className] - Clases CSS adicionales para estilizado
 * @param {React.ReactNode} props.children - SelectItem, SelectGroup, SelectLabel elementos
 * @param {'popper' | 'item-aligned'} [props.position='popper'] - Estrategia de posicionamiento
 * @param {React.Ref} ref - Referencia forwarded al elemento de contenido
 * @returns {JSX.Element} Contenido desplegable en un Portal con animaciones
 * @example
 * <SelectContent>
 *   <SelectItem value="light">Claro</SelectItem>
 *   <SelectItem value="dark">Oscuro</SelectItem>
 *   <SelectItem value="system">Sistema</SelectItem>
 * </SelectContent>
 *
 * @example
 * <SelectContent position="item-aligned" className="w-[200px]">
 *   <SelectGroup>
 *     <SelectLabel>Temas</SelectLabel>
 *     <SelectItem value="light">Claro</SelectItem>
 *     <SelectItem value="dark">Oscuro</SelectItem>
 *   </SelectGroup>
 * </SelectContent>
 */
const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

/**
 * Etiqueta de texto para agrupar y categorizar opciones dentro de un SelectGroup.
 * Aparece como título en negrita sobre un grupo de opciones relacionadas.
 *
 * @description Etiqueta descriptiva para agrupaciones de opciones en el dropdown.
 * @param {object} props - Props del componente
 * @param {string} [props.className] - Clases CSS adicionales para estilizado
 * @param {React.Ref} ref - Referencia forwarded al elemento label
 * @returns {JSX.Element} Elemento label estilizado con texto en negrita
 * @example
 * <SelectContent>
 *   <SelectGroup>
 *     <SelectLabel>Bebidas</SelectLabel>
 *     <SelectItem value="water">Agua</SelectItem>
 *     <SelectItem value="coffee">Café</SelectItem>
 *     <SelectItem value="tea">Té</SelectItem>
 *   </SelectGroup>
 *   <SelectGroup>
 *     <SelectLabel>Comidas</SelectLabel>
 *     <SelectItem value="pizza">Pizza</SelectItem>
 *     <SelectItem value="burger">Hamburguesa</SelectItem>
 *   </SelectGroup>
 * </SelectContent>
 */
const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

/**
 * Opción individual seleccionable dentro del dropdown del Select.
 * Muestra un indicador de check cuando está seleccionada y soporta estados de foco y disabled.
 *
 * @description Opción individual que el usuario puede seleccionar del dropdown.
 * @param {object} props - Props del componente
 * @param {string} [props.className] - Clases CSS adicionales para estilizado
 * @param {React.ReactNode} props.children - Texto o contenido a mostrar para la opción
 * @param {string} props.value - Valor único identificador de la opción
 * @param {boolean} [props.disabled] - Deshabilita la selección de esta opción
 * @param {React.Ref} ref - Referencia forwarded al elemento div de la opción
 * @returns {JSX.Element} Elemento de opción con indicador de selección y estados interactivos
 * @example
 * <SelectItem value="es">Español</SelectItem>
 * <SelectItem value="en">English</SelectItem>
 * <SelectItem value="fr">Français</SelectItem>
 *
 * @example
 * <SelectItem value="admin" disabled>
 *   Administrador (no disponible)
 * </SelectItem>
 *
 * @example
 * <SelectItem value="premium" className="text-primary">
 *   Plan Premium
 * </SelectItem>
 */
const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

/**
 * Separador visual que divide secciones de opciones dentro del dropdown.
 * Útil para crear grupos visuales distintos entre categorías de opciones.
 *
 * @description Línea divisoria horizontal para separar grupos de opciones.
 * @param {object} props - Props del componente
 * @param {string} [props.className] - Clases CSS adicionales para estilizado
 * @param {React.Ref} ref - Referencia forwarded al elemento div del separador
 * @returns {JSX.Element} Elemento hr estilizado como línea separadora
 * @example
 * <SelectContent>
 *   <SelectItem value="recent">Recientes</SelectItem>
 *   <SelectItem value="starred">Destacados</SelectItem>
 *   <SelectSeparator />
 *   <SelectItem value="all">Todos los archivos</SelectItem>
 *   <SelectItem value="trash">Papelera</SelectItem>
 * </SelectContent>
 *
 * @example
 * <SelectContent>
 *   <SelectGroup>
 *     <SelectLabel>Acciones rápidas</SelectLabel>
 *     <SelectItem value="copy">Copiar</SelectItem>
 *     <SelectItem value="paste">Pegar</SelectItem>
 *   </SelectGroup>
 *   <SelectSeparator className="bg-destructive" />
 *   <SelectGroup>
 *     <SelectLabel>Acciones peligrosas</SelectLabel>
 *     <SelectItem value="delete">Eliminar</SelectItem>
 *   </SelectGroup>
 * </SelectContent>
 */
const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}