"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
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
import { MedRoundLogo } from "@/components/ui/med-round-logo"

export default function RegisterPage() {
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

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: persistedFormData,
  })

  useEffect(() => {
    const subscription = form.watch((value) => {
      updateFormData(value as Partial<FormData>)
    })
    return () => subscription.unsubscribe()
  }, [form, updateFormData])

  const userType = form.watch("userType")
  const selectedHospital = form.watch("hospital")
  const email = form.watch("email")

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
        setTimeout(() => {
          const errorMessage = errors[firstErrorKey]?.message?.toString() || "Complete los campos requeridos"
          console.error("Validation error:", errorMessage)
        }, 0)
      }
    }

    return isValid
  }

  const handleNextStep = async () => {
    if (currentStep === 3) {
      const formData = form.getValues()
      if (await validateCurrentStep()) {
        await submitForm(formData)
      }
    } else {
      if (await validateCurrentStep()) {
        nextStep()
      }
    }
  }

  if (showVerificationMessage) {
    return (
      <div className="min-h-screen bg-grid-pattern relative overflow-hidden flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5 pointer-events-none" />
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
    <div className="min-h-screen bg-grid-pattern relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5 pointer-events-none" />
      <Card className="w-full max-w-2xl bg-card/80 backdrop-blur-xl border-primary/20 shadow-xl shadow-primary/5">
        <CardHeader className="text-center pb-8 pt-8">
          <div className="flex justify-center mb-4">
            <MedRoundLogo size="lg" />
          </div>
          <CardTitle className="text-2xl font-display font-bold">Registro de Médico</CardTitle>
          <CardDescription className="mt-2">
            Complete el formulario para crear su cuenta
          </CardDescription>
          <p className="text-sm text-muted-foreground mt-3">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Inicia sesión
            </Link>
          </p>
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
