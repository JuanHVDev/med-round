import { create } from "zustand"
import { devtools } from "zustand/middleware"
import type { UIStore } from "./types"

export const useUIStore = create<UIStore>()(
  devtools(
    (set, get) => ({
      theme: "light",
      notifications: [],
      loadingStates: {},
      activeModals: {},
      sidebarCollapsed: false,
      searchDialogOpen: false,
      commandPaletteOpen: false,
      filtersPanelOpen: false,

      setTheme: (theme: "light" | "dark") => {
        set({ theme })
      },

      addNotification: (notification) => {
        const { notifications } = get()
        const newNotifications = [...notifications, notification]
        
        set({ notifications: newNotifications })

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
      },

      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed })
      },

      toggleSidebarCollapsed: () => {
        const { sidebarCollapsed } = get()
        set({ sidebarCollapsed: !sidebarCollapsed })
      },

      setSearchDialogOpen: (open: boolean) => {
        set({ searchDialogOpen: open })
      },

      toggleSearchDialog: () => {
        const { searchDialogOpen } = get()
        set({ searchDialogOpen: !searchDialogOpen })
      },

      setCommandPaletteOpen: (open: boolean) => {
        set({ commandPaletteOpen: open })
      },

      toggleCommandPalette: () => {
        const { commandPaletteOpen } = get()
        set({ commandPaletteOpen: !commandPaletteOpen })
      },

      setFiltersPanelOpen: (open: boolean) => {
        set({ filtersPanelOpen: open })
      },

      toggleFiltersPanel: () => {
        const { filtersPanelOpen } = get()
        set({ filtersPanelOpen: !filtersPanelOpen })
      },
    }),
    {
      name: "ui-store",
      enabled: process.env.NODE_ENV === "development",
    }
  )
)