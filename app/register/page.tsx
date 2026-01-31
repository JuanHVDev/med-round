"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useRegistration } from "@/hooks/useRegistrationStore"
import { StepProgress } from "@/components/register/StepIndicator"
import { PersonalInfoStep } from "@/components/register/PersonalInfoStep"
import { IdentificationStep } from "@/components/register/IdentificationStep"
import { WorkInfoStep } from "@/components/register/WorkInfoStep"
import { NavigationButtons } from "@/components/register/NavigationButtons"
import { VerificationMessage } from "@/components/register/VerificationMessage"
import { formSchema, type FormData } from "@/lib/registerSchema"
import { useEffect } from "react"

export default function RegisterPage() {
  // Zustand para estado global y navegación
  const {
    currentStep,
    isSubmitting,
    showErrorDialog,
    errorMessage,
    showVerificationMessage,
    formData: persistedFormData,
    nextStep,
    prevStep,
    hideError,
    submitForm,
    resetForm,
    updateFormData,
  } = useRegistration()

  // React Hook Form para validación y estado de campos
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: persistedFormData,
  })

  // Sincronizar cambios del formulario con el store
  useEffect(() => {
    const subscription = form.watch((value) => {
      updateFormData(value as Partial<FormData>)
    })
    return () => subscription.unsubscribe()
  }, [form, updateFormData])

  // Watchers para obtener valores actuales del formulario
  const userType = form.watch("userType")
  const selectedHospital = form.watch("hospital")
  const email = form.watch("email")

  // Validación de paso actual
  const validateCurrentStep = async () => {
    let fieldsToValidate: string[] = []

    if (currentStep === 1) {
      fieldsToValidate = ["fullName", "email", "password", "confirmPassword"]
    } else if (currentStep === 2) {
      fieldsToValidate = ["userType"]
      if (userType === "professional") {
        fieldsToValidate.push("professionalId")
      } else if (userType === "student") {
        fieldsToValidate.push("studentType", "universityMatricula")
      }
    } else if (currentStep === 3) {
      fieldsToValidate = ["hospital", "specialty"]
      if (selectedHospital === "Otro") {
        fieldsToValidate.push("otherHospital")
      }
    }

    const isValid = await form.trigger(fieldsToValidate as (keyof FormData)[], { shouldFocus: true })

    if (!isValid) {
      const errors = form.formState.errors
      const firstErrorKey = Object.keys(errors)[0] as keyof typeof errors
      if (firstErrorKey) {
        hideError()
        // Esperar un poco para que el estado se actualice
        setTimeout(() => {
          const errorMessage = errors[firstErrorKey]?.message?.toString() || "Complete los campos requeridos"
          // Usar el store para mostrar error
          // Por ahora mostramos el error directamente
          console.error('Validation error:', errorMessage)
        }, 0)
      }
    }

    return isValid
  }

  // Manejo de navegación con validación
  const handleNextStep = async () => {
    if (currentStep === 3) {
      // Último paso - enviar formulario
      const formData = form.getValues()
      if (await validateCurrentStep()) {
        await submitForm(formData)
      }
    } else {
      // Pasos intermedios - solo validar y avanzar
      if (await validateCurrentStep()) {
        nextStep()
      }
    }
  }

  // Mostrar mensaje de verificación si el registro fue exitoso
  if (showVerificationMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
        <VerificationMessage
          email={email}
          onBack={() => {
            resetForm()
            form.reset()
          }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900">Registro de Médico</CardTitle>
          <CardDescription>
            Complete el formulario para crear su cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StepProgress currentStep={currentStep} />

          <Form {...form}>
            <form className="space-y-6">
              {currentStep === 1 && <PersonalInfoStep form={form} />}
              {currentStep === 2 && <IdentificationStep form={form} userType={userType} />}
              {currentStep === 3 && <WorkInfoStep form={form} selectedHospital={selectedHospital} />}

              <NavigationButtons
                currentStep={currentStep}
                onPrevStep={prevStep}
                onNextStep={handleNextStep}
                isSubmitting={isSubmitting}
              />
            </form>
          </Form>
        </CardContent>
      </Card>

      <AlertDialog open={showErrorDialog} onOpenChange={hideError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error de Validación</AlertDialogTitle>
            <AlertDialogDescription>
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Entendido</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
