// Tipos compartidos para los stores de Zustand

export interface Notification {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  message: string
  duration?: number
}

// Datos del formulario que se persisten
export interface RegistrationFormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  professionalId: string
  studentType: "MPSS" | "MIP" | undefined
  universityMatricula: string
  hospital: string
  otherHospital: string
  specialty: string
  userType: "professional" | "student"
}

export interface RegistrationState {
  currentStep: number
  isSubmitting: boolean
  showErrorDialog: boolean
  errorMessage: string
  submissionStatus: "idle" | "submitting" | "success" | "error"
  showVerificationMessage: boolean
  formData: RegistrationFormData
}

export interface RegistrationActions {
  nextStep: () => void
  prevStep: () => void
  setCurrentStep: (step: number) => void
  setSubmitting: (isSubmitting: boolean) => void
  showError: (message: string) => void
  hideError: () => void
  submitForm: (formData: unknown) => Promise<void>
  resetForm: () => void
  updateFormData: (data: Partial<RegistrationFormData>) => void
  setFormData: (data: RegistrationFormData) => void
}

export interface UIState {
  theme: "light" | "dark"
  notifications: Notification[]
  loadingStates: Record<string, boolean>
  activeModals: Record<string, boolean>
  sidebarCollapsed: boolean
  searchDialogOpen: boolean
  commandPaletteOpen: boolean
  filtersPanelOpen: boolean
}

export interface UIActions {
  setTheme: (theme: "light" | "dark") => void
  addNotification: (notification: Notification) => void
  removeNotification: (id: string) => void
  setLoading: (key: string, loading: boolean) => void
  toggleModal: (modal: string, state?: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebarCollapsed: () => void
  setSearchDialogOpen: (open: boolean) => void
  toggleSearchDialog: () => void
  setCommandPaletteOpen: (open: boolean) => void
  toggleCommandPalette: () => void
  setFiltersPanelOpen: (open: boolean) => void
  toggleFiltersPanel: () => void
}

export type RegistrationStore = RegistrationState & RegistrationActions
export type UIStore = UIState & UIActions