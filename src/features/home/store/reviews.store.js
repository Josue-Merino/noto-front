import { create } from 'zustand'
import { INITIAL_REVIEWS } from '../services/reviews.service'

export const useReviewsStore = create((set) => ({
  reviews: INITIAL_REVIEWS,

  /**
   * Agrega un nuevo repaso al inicio de la lista de recientes.
   * @param {object} review
   */
  addReview: (review) =>
    set((state) => ({
      reviews: [review, ...state.reviews.filter((r) => r.id !== review.id)],
    })),

  /**
   * Actualiza el título de un repaso existente.
   * @param {string} id
   * @param {string} newTitle
   */
  renameReview: (id, newTitle) =>
    set((state) => ({
      reviews: state.reviews.map((r) =>
        r.id === id ? { ...r, title: newTitle } : r
      ),
    })),

  /**
   * Carga los repasos iniciales.
   * @param {Array<object>} list
   */
  setReviews: (list) => set({ reviews: list }),
}))
