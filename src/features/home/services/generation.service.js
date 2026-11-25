import { apiClient } from '@/lib/apiClient'
import { toReviewViewModel } from '@/features/reviews/mappers/review.mapper'
import { buildMockStudyMaterial } from './generation.mock'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Agrega un campo numérico al FormData solo si es un número válido mayor a 0.
 * @param {FormData} formData
 * @param {string} key
 * @param {unknown} value
 */
function appendNumber(formData, key, value) {
  if (Number.isFinite(value) && value > 0) {
    formData.append(key, String(value))
  }
}

export const generationService = {
  /**
   * Envía el archivo comprimido y sus metadatos asociados para generar material de estudio con IA.
   * El backend transcribe el audio una sola vez y genera los materiales del outputType elegido.
   * @param {object} params
   * @param {File | Blob} params.file - Archivo ya optimizado en el navegador.
   * @param {'flashcards' | 'quiz' | 'full'} params.outputType - Tipo de salida requerida.
   * @param {object} [params.metadata] - Metadatos de compresión, duración y origen.
   * @param {string} [params.metadata.originalName]
   * @param {number} [params.metadata.originalSize]
   * @param {number} [params.metadata.durationSec]
   * @param {'file' | 'recording'} [params.metadata.originType]
   * @returns {Promise<object>} Modelo de vista del repaso (ver review.mapper.js), con `content`.
   */
  async generateMaterial({ file, outputType, metadata }) {
    const API_URL = import.meta.env.VITE_API_URL

    if (API_URL) {
      const formData = new FormData()
      formData.append('file', file, file.name || metadata?.originalName || 'audio.webm')
      formData.append('outputType', outputType)

      if (metadata?.originType) {
        formData.append('originType', metadata.originType)
      }
      if (metadata?.originalName) {
        formData.append('originalName', metadata.originalName)
      }
      appendNumber(formData, 'originalSize', metadata?.originalSize)
      appendNumber(formData, 'durationSec', metadata?.durationSec)

      // apiClient agrega el Bearer, reintenta tras refrescar el token y lanza ApiError con el
      // mensaje del backend (p. ej. TRANSCRIPTION_FAILED) si algo falla
      const material = await apiClient.postForm('/generation/create', formData)
      return toReviewViewModel(material)
    }

    // Mock simulado con delay de procesamiento (sin backend)
    await delay(1500)
    return toReviewViewModel(buildMockStudyMaterial({ file, outputType, metadata }))
  },
}
