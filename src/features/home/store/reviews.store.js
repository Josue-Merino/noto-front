import { create } from 'zustand'
import { toReviewViewModel } from '@/features/reviews/mappers/review.mapper'
import { INITIAL_REVIEWS } from '../services/reviews.service'
import { isMockMode } from '../services/generation.service'

/**
 * Ordena del más reciente al más antiguo.
 * @param {object[]} list
 */
const byNewest = (list) => [...list].sort((a, b) => (b.date || '').localeCompare(a.date || ''))

/**
 * Repasos del usuario: los trabajos de generación del backend ya mapeados al modelo de vista.
 * Sin backend (modo mock) arranca con repasos de ejemplo.
 */
export const useReviewsStore = create((set) => ({
  reviews: isMockMode() ? INITIAL_REVIEWS : [],
  /** Si ya se cargó la lista del backend en esta sesión. */
  loaded: isMockMode(),
  /** Trabajo que se está siguiendo desde el Home (para mostrar su progreso al volver). */
  activeJobId: null,

  /**
   * Reemplaza la lista con la del backend.
   * @param {object[]} jobs - Trabajos tal como los devuelve el backend.
   */
  setJobs: (jobs) => set({ reviews: byNewest(jobs.map(toReviewViewModel)), loaded: true }),

  /**
   * Agrega o actualiza un trabajo (conserva el título renombrado localmente).
   * @param {object} job - Trabajo tal como lo devuelve el backend.
   */
  upsertJob: (job) =>
    set((state) => {
      const current = state.reviews.find((r) => r.id === job.id)
      const next = toReviewViewModel(job)
      if (current?.renamed) {
        next.title = current.title
        next.renamed = true
      }
      return { reviews: byNewest([next, ...state.reviews.filter((r) => r.id !== job.id)]) }
    }),

  /**
   * Actualiza el título de un repaso (solo en esta sesión: el backend todavía no guarda títulos).
   * @param {string} id
   * @param {string} newTitle
   */
  renameReview: (id, newTitle) =>
    set((state) => ({
      reviews: state.reviews.map((r) => (r.id === id ? { ...r, title: newTitle, renamed: true } : r)),
    })),

  /**
   * Cambia el contenido de un repaso ya cargado (estado de repaso de una flashcard, intento nuevo…).
   * @param {string} id
   * @param {(content: object) => object} updater
   */
  updateContent: (id, updater) =>
    set((state) => ({
      reviews: state.reviews.map((r) => (r.id === id && r.content ? { ...r, content: updater(r.content) } : r)),
    })),

  /** @param {string | null} id */
  setActiveJobId: (id) => set({ activeJobId: id }),

  /** Limpia todo al cerrar sesión. */
  reset: () => set({ reviews: isMockMode() ? INITIAL_REVIEWS : [], loaded: isMockMode(), activeJobId: null }),
}))
