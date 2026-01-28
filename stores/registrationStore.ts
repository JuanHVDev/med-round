import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { RegistrationStore } from './types'
import { MAX_STEPS } from '@/constants/registerConstants'

export const useRegistrationStore = create<RegistrationStore>()(
  devtools(
    (set, get) => ({
      // Estado inicial
      currentStep: 1,
      isSubmitting: false,
      showErrorDialog: false,
      errorMessage: '',
      submissionStatus: 'idle',

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
          submissionStatus: 'error'
        })
      },

      hideError: () => {
        set({ 
          showErrorDialog: false, 
          errorMessage: ''
        })
      },

      submitForm: async (formData: any) => {
        const state = get()
        
        if (state.isSubmitting) return

        set({ 
          isSubmitting: true, 
          submissionStatus: 'submitting',
          showErrorDialog: false,
          errorMessage: ''
        })

        try {
          // Simulación de envío al backend
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          console.log('Form data submitted:', formData)
          
          set({ 
            isSubmitting: false, 
            submissionStatus: 'success'
          })

          // Aquí podrías redirigir o mostrar mensaje de éxito
          
        } catch (error) {
          console.error('Error submitting form:', error)
          
          set({ 
            isSubmitting: false, 
            submissionStatus: 'error',
            showErrorDialog: true,
            errorMessage: 'Error al procesar el registro'
          })
        }
      },

      resetForm: () => {
        set({
          currentStep: 1,
          isSubmitting: false,
          showErrorDialog: false,
          errorMessage: '',
          submissionStatus: 'idle'
        })
      }
    }),
    {
      name: 'registration-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
)