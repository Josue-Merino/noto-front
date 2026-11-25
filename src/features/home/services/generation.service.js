import { apiClient } from '@/lib/apiClient'
import { buildMockJob } from './generation.mock'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/** Sin VITE_API_URL el frontend trabaja con datos simulados. */
export const isMockMode = () => !import.meta.env.VITE_API_URL

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

/**
 * Cliente de los trabajos de generación de noto-back. Todas las funciones devuelven el trabajo
 * tal como lo expone el backend (`status`, `content`, `error`, …); el mapper lo adapta a la vista.
 */
export const generationService = {
  /**
   * Sube el audio y crea el trabajo de generación (202). El material se genera en segundo plano.
   * @param {object} params
   * @param {File | Blob} params.file - Archivo optimizado en el navegador (o el original si no se pudo).
   * @param {'flashcards' | 'quiz' | 'full'} params.outputType
   * @param {object} [params.metadata] - originalName, originalSize, durationSec, originType.
   * @param {(percent: number) => void} [params.onUploadProgress]
   * @param {AbortSignal} [params.signal]
   */
  async createJob({ file, outputType, metadata, onUploadProgress, signal }) {
    if (isMockMode()) {
      for (const percent of [25, 60, 100]) {
        await delay(250)
        onUploadProgress?.(percent)
      }
      return buildMockJob({ file, outputType, metadata })
    }

    const formData = new FormData()
    formData.append('file', file, file.name || metadata?.originalName || 'audio.webm')
    formData.append('outputType', outputType)
    if (metadata?.originType) formData.append('originType', metadata.originType)
    if (metadata?.originalName) formData.append('originalName', metadata.originalName)
    appendNumber(formData, 'originalSize', metadata?.originalSize)
    appendNumber(formData, 'durationSec', metadata?.durationSec)

    return apiClient.upload('/generation/create', formData, { onProgress: onUploadProgress, signal })
  },

  /** Trabajos del usuario (más recientes primero). */
  async listJobs() {
    if (isMockMode()) return []
    return apiClient.get('/generation')
  },

  /** @param {string} id */
  async getJob(id) {
    return apiClient.get(`/generation/${id}`)
  },

  /** @param {string} id */
  async cancelJob(id) {
    return apiClient.post(`/generation/${id}/cancel`)
  },

  /** @param {string} id */
  async retryJob(id) {
    return apiClient.post(`/generation/${id}/retry`)
  },

  /**
   * "Generar más material" con el audio guardado.
   * @param {string} id
   * @param {Array<'notes' | 'flashcards' | 'quiz'>} materials
   */
  async addMaterials(id, materials) {
    return apiClient.post(`/generation/${id}/materials`, { materials })
  },

  /**
   * Audio original guardado (para el reproductor).
   * @param {string} id
   * @returns {Promise<Blob>}
   */
  async fetchAudio(id) {
    return apiClient.getBlob(`/generation/${id}/audio`)
  },
}
