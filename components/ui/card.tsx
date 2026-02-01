import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * @description Contenedor principal de la tarjeta. Proporciona el marco visual
 * con bordes, sombra, colores de fondo y espaciado para agrupar contenido relacionado.
 * @param className - Clases CSS adicionales para personalizar el estilo
 * @param props - Props extendidas del elemento HTML div
 * @returns El componente Card renderizado
 * @example
 * <Card>
 *   <CardContent>Contenido aquí</CardContent>
 * </Card>
 * @example
 * <Card className="border-primary">
 *   <CardHeader>
 *     <CardTitle>Título Personalizado</CardTitle>
 *   </CardHeader>
 * </Card>
 */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

/**
 * @description Encabezado de la tarjeta. Contiene el título, descripción y acciones.
 * Diseñado con grid layout para posicionar elementos de manera flexible.
 * @param className - Clases CSS adicionales para personalizar el estilo
 * @param props - Props extendidas del elemento HTML div
 * @returns El componente CardHeader renderizado
 * @example
 * <CardHeader>
 *   <CardTitle>Información del Paciente</CardTitle>
 *   <CardDescription>Datos demográficos</CardDescription>
 * </CardHeader>
 * @example
 * <CardHeader>
 *   <CardTitle>Configuración</CardTitle>
 *   <CardAction><Button>Editar</Button></CardAction>
 * </CardHeader>
 */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

/**
 * @description Título de la tarjeta. Texto semibold que destaca como encabezado principal.
 * @param className - Clases CSS adicionales para personalizar el estilo
 * @param props - Props extendidas del elemento HTML div
 * @returns El componente CardTitle renderizado
 * @example
 * <CardTitle>Resumen de Consulta</CardTitle>
 * @example
 * <CardTitle className="text-xl text-primary">Historia Clínica</CardTitle>
 */
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

/**
 * @description Descripción o subtítulo de la tarjeta. Texto pequeño en color muted
 * para proporcionar contexto adicional al título.
 * @param className - Clases CSS adicionales para personalizar el estilo
 * @param props - Props extendidas del elemento HTML div
 * @returns El componente CardDescription renderizado
 * @example
 * <CardDescription>Última actualización: hace 2 horas</CardDescription>
 * @example
 * <CardDescription className="text-xs">Información confidencial</CardDescription>
 */
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

/**
 * @description Área para botones o acciones dentro del CardHeader.
 * Se posiciona automáticamente en la esquina superior derecha del encabezado.
 * @param className - Clases CSS adicionales para personalizar el estilo
 * @param props - Props extendidas del elemento HTML div
 * @returns El componente CardAction renderizado
 * @example
 * <CardAction>
 *   <Button variant="ghost" size="sm">Ver más</Button>
 * </CardAction>
 * @example
 * <CardAction>
 *   <Button variant="outline">Editar</Button>
 *   <Button variant="destructive">Eliminar</Button>
 * </CardAction>
 */
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

/**
 * @description Contenido principal de la tarjeta. Área donde se coloca
 * la información principal, formularios, tablas u otros elementos.
 * @param className - Clases CSS adicionales para personalizar el estilo
 * @param props - Props extendidas del elemento HTML div
 * @returns El componente CardContent renderizado
 * @example
 * <CardContent>
 *   <p>Información detallada del paciente...</p>
 * </CardContent>
 * @example
 * <CardContent className="space-y-4">
 *   <Input placeholder="Nombre" />
 *   <Input placeholder="Apellido" />
 * </CardContent>
 */
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

/**
 * @description Pie de la tarjeta. Contiene acciones finales, botones de guardar,
 * cancelar, o información adicional al final de la tarjeta.
 * @param className - Clases CSS adicionales para personalizar el estilo
 * @param props - Props extendidas del elemento HTML div
 * @returns El componente CardFooter renderizado
 * @example
 * <CardFooter>
 *   <Button>Guardar Cambios</Button>
 * </CardFooter>
 * @example
 * <CardFooter className="justify-between">
 *   <span>Total: $150</span>
 *   <Button variant="primary">Pagar</Button>
 * </CardFooter>
 */
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
