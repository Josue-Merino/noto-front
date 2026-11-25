import { apiClient } from '@/lib/apiClient'

/**
 * Repaso del material guardado en Supabase (a través de noto-back).
 */
export const studyService = {
  /**
   * Califica una flashcard (repaso espaciado SM-2).
   * @param {string} flashcardId
   * @param {'again' | 'hard' | 'good' | 'easy'} rating
   * @returns {Promise<{ flashcardId: string, review: object }>}
   */
  reviewFlashcard(flashcardId, rating) {
    return apiClient.post(`/study/flashcards/${flashcardId}/review`, { rating })
  },

  /**
   * Guarda un intento del cuestionario (el backend lo califica).
   * @param {string} quizId
   * @param {{ startedAt: string, answers: Array<{ questionId: string, optionId: string | null }> }} attempt
   * @returns {Promise<{ id: string, score: number, total: number, correctCount: number, finishedAt: string }>}
   */
  saveQuizAttempt(quizId, attempt) {
    return apiClient.post(`/study/quizzes/${quizId}/attempts`, attempt)
  },
}
