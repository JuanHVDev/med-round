"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { ChevronLeft, ChevronRight, User, FileText, Building } from "lucide-react"

const MAX_STEPS = 3

const formSchema = z.object({
  fullName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Ingrese un email válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string().min(8, "La confirmación debe tener al menos 8 caracteres"),
  professionalId: z.string().optional(),
  studentType: z.enum(["MPSS", "MIP"]).optional(),
  universityMatricula: z.string().optional(),
  hospital: z.string().min(2, "El hospital es requerido"),
  otherHospital: z.string().optional(),
  specialty: z.string().min(2, "La especialidad es requerida"),
  userType: z.enum(["professional", "student"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.userType === "professional") {
    return data.professionalId && data.professionalId.length > 0
  }
  if (data.userType === "student") {
    return data.studentType && data.universityMatricula && data.universityMatricula.length > 0
  }
  return true
}, {
  message: "Complete los campos requeridos según su tipo de usuario",
  path: ["userType"],
}).refine((data) => {
  if (data.hospital === "Otro") {
    return data.otherHospital && data.otherHospital.length > 0
  }
  return true
}, {
  message: "Especifique el nombre del hospital",
  path: ["otherHospital"],
})

type FormData = z.infer<typeof formSchema>

const specialties = [
  "Medicina General",
  "Cardiología",
  "Neurología",
  "Pediatría",
  "Cirugía General",
  "Ginecología",
  "Oftalmología",
  "Otorrinolaringología",
  "Psiquiatría",
  "Dermatología",
  "Oncología",
  "Anestesiología",
  "Radiología",
  "Medicina Interna",
  "Urología",
]

const hospitals = [
  "Hospital General de México",
  "Instituto Nacional de Ciencias Médicas y Nutrición",
  "Hospital Ángeles del Pedregal",
  "Hospital ABC",
  "Instituto Nacional de Cardiología",
  "Instituto Nacional de Neurología",
  "Hospital Español",
  "Médica Sur",
  "Centro Médico Nacional Siglo XXI",
  "Hospital Juárez de México",
  "Otro",
]

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      professionalId: "",
      studentType: undefined,
      universityMatricula: "",
      hospital: "",
      otherHospital: "",
      specialty: "",
      userType: "professional",
    },
  })

  const userType = form.watch("userType")
  const selectedHospital = form.watch("hospital")

  const nextStep = async () => {
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

    if (isValid) {
      if (currentStep < MAX_STEPS) {
        setCurrentStep(currentStep + 1)
      } else {
        handleSubmit()
      }
    } else {
      const errors = form.formState.errors
      const firstErrorKey = Object.keys(errors)[0] as keyof typeof errors
      if (firstErrorKey) {
        setErrorMessage(errors[firstErrorKey]?.message?.toString() || "Complete los campos requeridos")
        setShowErrorDialog(true)
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      const data = form.getValues()
      console.log("Form data:", data)
      // Aquí iría la lógica de envío al backend
    } catch {
      setErrorMessage("Error al procesar el registro")
      setShowErrorDialog(true)
    }
  }

  const StepIndicator = ({ step, title, icon }: { step: number; title: string; icon: React.ReactNode }) => (
    <div className={`flex items-center space-x-2 ${currentStep >= step ? "text-blue-600" : "text-gray-400"}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
        currentStep >= step ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"
      }`}>
        {icon}
      </div>
      <span className="hidden sm:inline text-sm font-medium">{title}</span>
    </div>
  )

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
          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-8 px-4">
            <StepIndicator step={1} title="Información Personal" icon={<User className="w-4 h-4" />} />
             <div className={`flex-1 h-0.5 mx-2 ${currentStep > 1 ? "bg-blue-600" : "bg-gray-300"}`} />
             <StepIndicator step={2} title="Identificación" icon={<FileText className="w-4 h-4" />} />
             <div className={`flex-1 h-0.5 mx-2 ${currentStep > 2 ? "bg-blue-600" : "bg-gray-300"}`} />
            <StepIndicator step={3} title="Trabajo" icon={<Building className="w-4 h-4" />} />
          </div>

          <Form {...form}>
            <form className="space-y-6">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Dr. Juan Pérez" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="juan.perez@ejemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Mínimo 8 caracteres" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Contraseña</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Repita su contraseña" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 2: Professional/Student Identification */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="userType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Usuario</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione su tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="professional">Profesional</SelectItem>
                            <SelectItem value="student">Estudiante</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {userType === "professional" && (
                    <FormField
                      control={form.control}
                      name="professionalId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cédula Profesional</FormLabel>
                          <FormControl>
                            <Input placeholder="Número de cédula profesional" {...field} />
                          </FormControl>
                          <FormDescription>
                            Ingrese su número de cédula profesional vigente
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {userType === "student" && (
                    <>
                      <FormField
                        control={form.control}
                        name="studentType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Estudiante</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccione su tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="MPSS">MPSS</SelectItem>
                                <SelectItem value="MIP">MIP</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="universityMatricula"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Matricula Universitaria</FormLabel>
                            <FormControl>
                              <Input placeholder="Número de matrícula" {...field} />
                            </FormControl>
                            <FormDescription>
                              Ingrese su número de matrícula universitaria
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>
              )}

              {/* Step 3: Work Information */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="hospital"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hospital</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione su hospital" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {hospitals.map((hospital) => (
                              <SelectItem key={hospital} value={hospital}>
                                {hospital}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedHospital === "Otro" && (
                    <FormField
                      control={form.control}
                      name="otherHospital"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del Hospital</FormLabel>
                          <FormControl>
                            <Input placeholder="Ingrese el nombre de su hospital" {...field} />
                          </FormControl>
                          <FormDescription>
                            Especifique el nombre completo del hospital donde trabaja
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={form.control}
                    name="specialty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Especialidad</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione su especialidad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {specialties.map((specialty) => (
                              <SelectItem key={specialty} value={specialty}>
                                {specialty}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                 <Button
                   type="button"
                   variant="outline"
                   onClick={prevStep}
                   disabled={currentStep === 1}
                   className="border-blue-200 text-blue-600 hover:bg-blue-50"
                 >
                   <ChevronLeft className="w-4 h-4 mr-2" />
                   Anterior
                 </Button>
                 <Button
                   type="button"
                   onClick={nextStep}
                   className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                 >
                   {currentStep === MAX_STEPS ? "Registrarse" : "Siguiente"}
                   {currentStep < MAX_STEPS && <ChevronRight className="w-4 h-4 ml-2" />}
                 </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Error Dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
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