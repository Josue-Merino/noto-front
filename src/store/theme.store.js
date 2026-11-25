import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

/** Clave de localStorage; `index.html` la lee antes de pintar para evitar un destello oscuro. */
export const THEME_STORAGE_KEY = 'noto_theme'

/**
 * Aplica el tema al <html>: los colores salen de variables CSS (ver `index.css`).
 * @param {'dark' | 'light'} theme
 */
function applyTheme(theme) {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
}

/**
 * Tema de la interfaz (oscuro por defecto, "Modo claro" del sidebar).
 */
export const useThemeStore = create(
  persist(
    (set, get) => ({
      /** @type {'dark' | 'light'} */
      theme: 'dark',

      toggleTheme: () => {
        const theme = get().theme === 'light' ? 'dark' : 'light'
        applyTheme(theme)
        set({ theme })
      },
    }),
    {
      name: THEME_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => applyTheme(state?.theme ?? 'dark'),
    }
  )
)
