const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const generationService = {
  /**
   * Envía el archivo comprimido y sus metadatos asociados para generar material de estudio con IA.
   * @param {object} params
   * @param {File | Blob} params.file - Archivo ya optimizado en el navegador.
   * @param {'flashcards' | 'quiz' | 'full'} params.outputType - Tipo de salida requerida.
   * @param {object} [params.metadata] - Metadatos de compresión y duración original.
   * @param {string} [params.metadata.originalName]
   * @param {number} [params.metadata.originalSize]
   * @param {number} [params.metadata.durationSec]
   * @returns {Promise<{ id: string, title: string, outputType: string, date: string, type: 'video' | 'audio' | 'notes' }>}
   */
  async generateMaterial({ file, outputType, metadata }) {
    const API_URL = import.meta.env.VITE_API_URL

    if (API_URL) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('outputType', outputType)

      if (metadata?.originalName) {
        formData.append('originalName', metadata.originalName)
      }
      if (metadata?.originalSize) {
        formData.append('originalSize', String(metadata.originalSize))
      }
      if (metadata?.durationSec) {
        formData.append('durationSec', String(metadata.durationSec))
      }

      const response = await fetch(`${API_URL}/generation/create`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Error al procesar el material de estudio.')
      }

      return response.json()
    }

    // Mock simulado con delay de procesamiento
    await delay(1500)

    const rawName = metadata?.originalName || file.name || 'Clase grabada'
    const cleanTitle = rawName.replace(/\.[^/.]+$/, '')
    const isVideo =
      file.type?.includes('video') || rawName.endsWith('.mp4') || rawName.endsWith('.mov')

    return {
      id: `rev-${Date.now()}`,
      title: `${cleanTitle}: Material generado`,
      type: isVideo ? 'video' : 'audio',
      outputType,
      date: new Date().toISOString().split('T')[0],
    }
  },
}
