import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import type { RegistrationStore, RegistrationFormData } from "./types"

const defaultFormData: RegistrationFormData = {
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
}

export const useRegistrationStore = create<RegistrationStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Estado inicial
        currentStep: 1,
        isSubmitting: false,
        showErrorDialog: false,
        errorMessage: "",
        submissionStatus: "idle",
        showVerificationMessage: false,
        formData: defaultFormData,

        // Acciones
        nextStep: () => {
          const { currentStep } = get()
          if (currentStep < 3) {
            set({ currentStep: currentStep + 1 })
          }
        },

        prevStep: () => {
          const { currentStep } = get()
          if (currentStep > 1) {
            set({ currentStep: currentStep - 1 })
          }
        },

        setCurrentStep: (step: number) => {
          if (step >= 1 && step <= 3) {
            set({ currentStep: step })
          }
        },

        setSubmitting: (isSubmitting: boolean) => {
          set({ isSubmitting })
        },

        showError: (message: string) => {
          set({ 
            showErrorDialog: true, 
            errorMessage: message,
            submissionStatus: "error"
          })
        },

        hideError: () => {
          set({ 
            showErrorDialog: false, 
            errorMessage: ""
          })
        },

        submitForm: async (formData: unknown) => {
          const state = get()
          
          if (state.isSubmitting) return

          set({ 
            isSubmitting: true, 
            submissionStatus: "submitting",
            showErrorDialog: false,
            errorMessage: ""
          })

          try {
            const response = await fetch("/api/register", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(formData as FormData),
            })

            const result = await response.json()

            if (!response.ok) {
              // Handle specific HTTP status codes
              let errorMessage = "Error en el registro"
              
              if (response.status === 409) {
                errorMessage = "El email ya está registrado. Por favor use otro email o inicie sesión."
              } else if (response.status === 400) {
                errorMessage = result.error || "Datos inválidos. Por favor revise todos los campos."
              } else if (response.status === 500) {
                errorMessage = "Error del servidor. Por favor intente más tarde."
              }
              
              throw new Error(errorMessage)
            }

            console.log("Registration successful:", result)
            
            // Show verification message and clear persisted data
            set({ 
              isSubmitting: false, 
              submissionStatus: "success",
              showVerificationMessage: true
            })

          } catch (error) {
            console.error("Registration error:", error)
            
            set({ 
              isSubmitting: false, 
              submissionStatus: "error",
              showErrorDialog: true,
              errorMessage: error instanceof Error ? error.message : "Error al procesar el registro"
            })
          }
        },

        resetForm: () => {
          set({
            currentStep: 1,
            isSubmitting: false,
            showErrorDialog: false,
            errorMessage: "",
            submissionStatus: "idle",
            showVerificationMessage: false,
            formData: defaultFormData
          })
        },

        updateFormData: (data: Partial<RegistrationFormData>) => {
          const currentData = get().formData
          set({
            formData: { ...currentData, ...data }
          })
        },

        setFormData: (data: RegistrationFormData) => {
          set({ formData: data })
        }
      }),
      {
        name: "registration-form-storage",
        partialize: (state) => ({ 
          formData: state.formData,
          currentStep: state.currentStep 
        }),
      }
    ),
    {
      name: "registration-store",
      enabled: process.env.NODE_ENV === "development",
    }
  )
)
