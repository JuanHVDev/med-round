import { useRegistrationStore } from '@/stores/registrationStore'

// Hook wrapper para el store de registro
// Proporciona acceso tipado al store de registro
export const useRegistration = () => {
  const store = useRegistrationStore()
  
  return {
    // Estado
    currentStep: store.currentStep,
    isSubmitting: store.isSubmitting,
    showErrorDialog: store.showErrorDialog,
    errorMessage: store.errorMessage,
    submissionStatus: store.submissionStatus,
    showVerificationMessage: store.showVerificationMessage,
    formData: store.formData,
    
    // Acciones
    nextStep: store.nextStep,
    prevStep: store.prevStep,
    setCurrentStep: store.setCurrentStep,
    setSubmitting: store.setSubmitting,
    showError: store.showError,
    hideError: store.hideError,
    submitForm: store.submitForm,
    resetForm: store.resetForm,
    updateFormData: store.updateFormData,
    setFormData: store.setFormData,
  }
}