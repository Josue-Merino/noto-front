import { create } from 'zustand'

let nextId = 1

/**
 * Notificaciones flotantes (toasts) globales.
 * @typedef {{ id: number, title: string, description?: string, variant?: 'success' | 'error' | 'info', action?: { label: string, to: string } }} Toast
 */
export const useToastStore = create((set, get) => ({
  /** @type {Toast[]} */
  toasts: [],

  /**
   * @param {Omit<Toast, 'id'>} toast
   * @param {number} [durationMs] - 0 = no se cierra sola.
   */
  push: (toast, durationMs = 8000) => {
    const id = nextId++
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }))
    if (durationMs > 0) setTimeout(() => get().dismiss(id), durationMs)
    return id
  },

  /** @param {number} id */
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))
