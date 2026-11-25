/**
 * Repasos mock enriquecidos coincidentes con el diseño visual de Noto AI.
 */
export const INITIAL_REVIEWS = [
  {
    id: 'rev-1',
    title: 'Física Cuántica_Clase_4.mp4',
    originType: 'file',
    fileType: 'mp4',
    badgeText: 'Archivo MP4',
    originLabel: 'Archivo origen:',
    description:
      'Principio de incertidumbre de Heisenberg, operadores cuánticos y formulación matemática en espacios de Hilbert.',
    outputType: 'Notas completas',
    duration: '54 min',
    dateText: 'Hace 2 horas',
    date: '2024-11-23T15:30:00Z',
    buttonText: 'Entrar al material',
  },
  {
    id: 'rev-2',
    title: 'Material generado 1',
    originType: 'recording',
    fileType: 'audio',
    badgeText: 'Grabación de audio',
    originLabel: 'Captura en vivo',
    description:
      'Revisión intensiva para parcial de Termodinámica: leyes cero y primera ley aplicadas a sistemas cerrados.',
    outputType: 'Solo Cuestionario',
    duration: '42 min',
    dateText: 'Ayer, 18:30',
    date: '2024-11-22T18:30:00Z',
    buttonText: 'Ver repaso',
  },
  {
    id: 'rev-3',
    title: 'Historia Universal_SXX_Audio.mp3',
    originType: 'file',
    fileType: 'mp3',
    badgeText: 'Archivo MP3',
    originLabel: 'Archivo origen:',
    description:
      'Análisis geopolítico y transformaciones socioeconómicas clave durante la primera mitad del siglo XX.',
    outputType: 'Notas completas',
    duration: '1 h 12 min',
    dateText: 'Hace 1 día',
    date: '2024-11-22T10:00:00Z',
    buttonText: 'Entrar',
  },
  {
    id: 'rev-4',
    title: 'Algoritmos y Estructuras_Grafos.mp4',
    originType: 'file',
    fileType: 'mp4',
    badgeText: 'Archivo MP4',
    originLabel: 'Archivo origen:',
    description:
      'Algoritmos de Dijkstra, BFS y DFS aplicados a resolución de rutas críticas y recorrido en matrices de adyacencia.',
    outputType: 'Solo Flashcards',
    duration: '38 min',
    dateText: 'Hace 3 días',
    date: '2024-11-20T12:00:00Z',
    buttonText: 'Entrar al material',
  },
  {
    id: 'rev-5',
    title: 'Material generado 2',
    originType: 'recording',
    fileType: 'audio',
    badgeText: 'Grabación de audio',
    originLabel: 'Captura en vivo',
    description:
      'Clase magistral sobre Derecho Constitucional: garantías individuales, derechos fundamentales y juicio de amparo.',
    outputType: 'Notas completas',
    duration: '18 min',
    dateText: 'Hace 4 días',
    date: '2024-11-19T09:00:00Z',
    buttonText: 'Ver repaso',
  },
  {
    id: 'rev-6',
    title: 'Material generado 3',
    originType: 'recording',
    fileType: 'audio',
    badgeText: 'Grabación de audio',
    originLabel: 'Captura en vivo',
    description:
      'Sesión de preguntas y respuestas sobre Patología Celular y mecanismos de respuesta inflamatoria aguda.',
    outputType: 'Solo Cuestionario',
    duration: '27 min',
    dateText: '5 Mayo, 2024',
    date: '2024-05-05T14:00:00Z',
    buttonText: 'Ver repaso',
  },
]

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const reviewsService = {
  /**
   * Obtiene la lista de repasos del usuario.
   * @returns {Promise<Array<object>>}
   */
  async getRecentReviews() {
    const API_URL = import.meta.env.VITE_API_URL
    if (API_URL) {
      const response = await fetch(`${API_URL}/reviews/recents`)
      if (!response.ok) throw new Error('Error al cargar repasos recientes')
      return response.json()
    }

    await delay(200)
    return INITIAL_REVIEWS
  },
}
