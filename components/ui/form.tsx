import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

/**
 * @description Provider del contexto del formulario basado en FormProvider de react-hook-form.
 * Envuelve todo el formulario para proporcionar el contexto necesario a los componentes hijos.
 * Es un alias directo de FormProvider de react-hook-form.
 * @param {object} props - Props del FormProvider
 * @param {UseFormReturn} props - Instancia del formulario de react-hook-form
 * @param {React.ReactNode} props.children - Componentes hijos del formulario
 * @returns {React.ReactElement} Provider del contexto del formulario
 * @example
 * const form = useForm({
 *   resolver: zodResolver(formSchema),
 *   defaultValues: { email: "" }
 * })
 *
 * <Form {...form}>
 *   <form onSubmit={form.handleSubmit(onSubmit)}>
 *     <FormField control={form.control} name="email" render={...} />
 *     <Button type="submit">Enviar</Button>
 *   </form>
 * </Form>
 */
const Form = FormProvider

type FormFieldContextValue<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

/**
 * @description Componente que define un campo de formulario con contexto.
 * Envuelve el Controller de react-hook-form para proporcionar contexto al campo
 * y permite que los componentes hijos accedan al estado del campo.
 * @template TFieldValues - Tipo de los valores del formulario
 * @template TName - Tipo de la ruta del campo
 * @param {ControllerProps<TFieldValues, TName>} props - Props del Controller de react-hook-form
 * @param {TName} props.name - Nombre/ruta del campo en el formulario
 * @param {Control<TFieldValues>} props.control - Control del formulario de react-hook-form
 * @param {Render<TFieldValues, TName>} props.render - Función render para renderizar el input
 * @returns {React.ReactElement} Provider del contexto del campo con el Controller
 * @example
 * <FormField
 *   control={form.control}
 *   name="email"
 *   render={({ field }) => (
 *     <FormItem>
 *       <FormLabel>Email</FormLabel>
 *       <FormControl>
 *         <Input {...field} />
 *       </FormControl>
 *       <FormMessage />
 *     </FormItem>
 *   )}
 * />
 */
const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

/**
 * @description Hook personalizado para acceder al estado y contexto de un campo de formulario.
 * Proporciona información sobre el campo actual incluyendo su estado de error,
 * IDs generados para accesibilidad ARIA, y otros metadatos del campo.
 * @returns {object} Objeto con la información del campo
 * @returns {string} returns.id - ID único del elemento del formulario
 * @returns {string} returns.name - Nombre del campo en el formulario
 * @returns {string} returns.formItemId - ID para el elemento del formulario
 * @returns {string} returns.formDescriptionId - ID para la descripción del campo
 * @returns {string} returns.formMessageId - ID para el mensaje de error
 * @returns {FieldState} returns - Estado del campo (error, isDirty, isTouched, etc.)
 * @throws {Error} Lanza error si se usa fuera de un componente FormField
 * @example
 * const { error, formItemId, formDescriptionId } = useFormField()
 * return (
 *   <input
 *     id={formItemId}
 *     aria-describedby={formDescriptionId}
 *     aria-invalid={!!error}
 *   />
 * )
 */
const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

/**
 * @description Contenedor principal para un campo de formulario individual.
 * Proporciona contexto de item y genera un ID único para el campo.
 * Envuelve Label, Control, Description y Message en una estructura consistente.
 * @param {object} props - Props del componente
 * @param {string} [props.className] - Clases CSS adicionales para personalizar el estilo
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Atributos HTML adicionales
 * @returns {React.ReactElement} Elemento <div> contenedor del campo
 * @example
 * <FormItem>
 *   <FormLabel>Correo electrónico</FormLabel>
 *   <FormControl>
 *     <Input type="email" {...field} />
 *   </FormControl>
 *   <FormDescription>Tu correo de contacto principal</FormDescription>
 *   <FormMessage />
 * </FormItem>
 */
const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = "FormItem"

/**
 * @description Componente de etiqueta vinculado automáticamente a un campo de formulario.
 * Se conecta automáticamente al input correspondiente y aplica estilos de error cuando existe.
 * @param {object} props - Props del componente
 * @param {string} [props.className] - Clases CSS adicionales para personalizar el estilo
 * @param {React.ComponentPropsWithoutRef<typeof Label>} props - Props del componente Label
 * @returns {React.ReactElement} Componente Label vinculado al campo
 * @example
 * <FormItem>
 *   <FormLabel>Nombre completo</FormLabel>
 *   <FormControl>
 *     <Input {...field} />
 *   </FormControl>
 *   <FormMessage />
 * </FormItem>
 */
const FormLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return (
    <Label
      ref={ref}
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
})
FormLabel.displayName = "FormLabel"

/**
 * @description Componente que envuelve el input/control de un campo de formulario.
 * Configura automáticamente atributos ARIA para accesibilidad y vincula el input
 * con las descripciones y mensajes de error del campo.
 * @param {object} props - Props del componente
 * @param {React.ComponentPropsWithoutRef<typeof Slot>} props - Props del Slot de Radix UI
 * @returns {React.ReactElement} Componente Slot con atributos ARIA configurados
 * @example
 * <FormItem>
 *   <FormLabel>Contraseña</FormLabel>
 *   <FormControl>
 *     <Input type="password" {...field} />
 *   </FormControl>
 *   <FormMessage />
 * </FormItem>
 */
const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
})
FormControl.displayName = "FormControl"

/**
 * @description Componente que muestra una descripción o texto de ayuda para un campo de formulario.
 * Proporciona información adicional sobre el propósito o formato del campo.
 * @param {object} props - Props del componente
 * @param {string} [props.className] - Clases CSS adicionales para personalizar el estilo
 * @param {React.HTMLAttributes<HTMLParagraphElement>} props - Atributos HTML adicionales
 * @returns {React.ReactElement} Elemento <p> con el texto descriptivo
 * @example
 * <FormItem>
 *   <FormLabel>Email</FormLabel>
 *   <FormControl>
 *     <Input type="email" {...field} />
 *   </FormControl>
 *   <FormDescription>Introduce tu correo electrónico de trabajo</FormDescription>
 *   <FormMessage />
 * </FormItem>
 */
const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-[0.8rem] text-muted-foreground", className)}
      {...props}
    />
  )
})
FormDescription.displayName = "FormDescription"

/**
 * @description Componente que muestra mensajes de error de validación para un campo de formulario.
 * Renderiza el mensaje de error si existe, o un contenido personalizado si se proporciona.
 * @param {object} props - Props del componente
 * @param {string} [props.className] - Clases CSS adicionales para personalizar el estilo
 * @param {React.ReactNode} [props.children] - Contenido alternativo cuando no hay error
 * @returns {React.ReactElement | null} Elemento <p> con el mensaje de error o null si no hay mensaje
 * @example
 * <FormItem>
 *   <FormLabel>Nombre</FormLabel>
 *   <FormControl>
 *     <Input {...field} />
 *   </FormControl>
 *   <FormMessage />
 * </FormItem>
 * @example
 * <FormMessage>Texto alternativo personalizado</FormMessage>
 */
const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message) : children

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-[0.8rem] font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}