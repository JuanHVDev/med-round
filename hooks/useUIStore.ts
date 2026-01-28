import { useUIStore } from '@/stores/uiStore'

// Hook wrapper para el store de UI
// Proporciona acceso tipado al store de UI
export const useUI = () => {
  const store = useUIStore()
  
  return {
    // Estado
    theme: store.theme,
    notifications: store.notifications,
    loadingStates: store.loadingStates,
    activeModals: store.activeModals,
    
    // Acciones
    setTheme: store.setTheme,
    addNotification: store.addNotification,
    removeNotification: store.removeNotification,
    setLoading: store.setLoading,
    toggleModal: store.toggleModal,
  }
}