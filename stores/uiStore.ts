import { create } from "zustand"
import { devtools } from "zustand/middleware"
import type { UIStore } from "./types"

export const useUIStore = create<UIStore>()(
  devtools(
    (set, get) => ({
      // Estado inicial
      theme: "light",
      notifications: [],
      loadingStates: {},
      activeModals: {},

      // Acciones
      setTheme: (theme: "light" | "dark") => {
        set({ theme })
      },

      addNotification: (notification) => {
        const { notifications } = get()
        const newNotifications = [...notifications, notification]
        
        set({ notifications: newNotifications })

        // Auto-remove notification after duration (if specified)
        if (notification.duration && notification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(notification.id)
          }, notification.duration)
        }
      },

      removeNotification: (id: string) => {
        const { notifications } = get()
        const filteredNotifications = notifications.filter(n => n.id !== id)
        set({ notifications: filteredNotifications })
      },

      setLoading: (key: string, loading: boolean) => {
        const { loadingStates } = get()
        set({
          loadingStates: { ...loadingStates, [key]: loading }
        })
      },

      toggleModal: (modal: string, state?: boolean) => {
        const { activeModals } = get()
        const currentState = activeModals[modal] || false
        const newState = state !== undefined ? state : !currentState
        
        set({
          activeModals: { ...activeModals, [modal]: newState }
        })
      }
    }),
    {
      name: "ui-store",
      enabled: process.env.NODE_ENV === "development",
    }
  )
)