import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useUIStore = create(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileSidebarOpen: false,

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),

      openMobileSidebar: () =>
        set({ mobileSidebarOpen: true }),

      closeMobileSidebar: () =>
        set({ mobileSidebarOpen: false }),

      toggleMobileSidebar: () =>
        set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
    }),
    {
      name: 'noto_ui_storage',
      storage: createJSONStorage(() => localStorage),
      // Solo persistimos la preferencia del sidebar en desktop
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
)
