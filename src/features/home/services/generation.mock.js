/**
 * Trabajo de generación simulado (misma forma que el backend, ya completado) para trabajar
 * sin backend (VITE_API_URL vacía). Solo trae los materiales que corresponden al outputType.
 */

const SAMPLE_NOTES = {
  title: 'Material de ejemplo',
  language: 'es',
  summary:
    'Esta es una síntesis de ejemplo. Configura VITE_API_URL y levanta noto-back y noto-ai-server para generar material real a partir de tu clase.',
  blocks: [
    { type: 'heading1', text: 'Ideas principales', emoji: '📌' },
    { type: 'paragraph', text: 'Las notas reales se generan con **IA** a partir de la `transcripción` de la clase.', emoji: null },
    { type: 'bullet_list_item', text: 'Títulos, párrafos y listas', emoji: null },
    { type: 'bullet_list_item', text: 'Citas y __avisos importantes__', emoji: null },
    { type: 'callout', text: 'Este contenido es solo de ejemplo.', emoji: '💡' },
  ],
  actionItems: ['Configurar el archivo .env del frontend'],
  supportMaterial: [],
  homework: [],
}

const SAMPLE_FLASHCARDS = {
  title: 'Material de ejemplo',
  language: 'es',
  cards: [
    { front: '¿Qué servicio genera el material?', back: 'noto-ai-server, a partir de la transcripción del audio.' },
    { front: '¿Qué tipos de material existen?', back: 'Notas, flashcards y cuestionarios.' },
    { front: '¿Cuántas veces se transcribe el audio con "Notas completas"?', back: 'Una sola vez para los tres materiales.' },
  ],
}

const SAMPLE_QUIZ = {
  title: 'Material de ejemplo',
  language: 'es',
  questions: [
    {
      question: '¿Qué servicio valida la sesión antes de llamar a la IA?',
      options: ['noto-front', 'noto-back', 'AssemblyAI', 'Qwen'],
      correctOptionIndex: 1,
      explanation: 'noto-back autentica al usuario y reenvía su token a la IA.',
    },
    {
      question: '¿Qué opción genera notas, flashcards y cuestionario?',
      options: ['Solo Flashcards', 'Solo Cuestionario', 'Notas completas'],
      correctOptionIndex: 2,
      explanation: '"Notas completas" pide los tres materiales en una sola petición.',
    },
  ],
}

/**
 * @param {object} params
 * @param {File | Blob} params.file
 * @param {'flashcards' | 'quiz' | 'full'} params.outputType
 * @param {object} [params.metadata]
 * @returns {object} Trabajo con la forma de `data` del backend.
 */
export function buildMockJob({ file, outputType, metadata }) {
  const originalName = metadata?.originalName || file?.name || 'Clase grabada'
  const cleanTitle = originalName.replace(/\.[^/.]+$/, '')

  const now = new Date().toISOString()
  const content = {
    notes: outputType === 'full' ? SAMPLE_NOTES : null,
    flashcards: outputType === 'full' || outputType === 'flashcards' ? SAMPLE_FLASHCARDS : null,
    quiz: outputType === 'full' || outputType === 'quiz' ? SAMPLE_QUIZ : null,
  }

  return {
    id: `rev-${Date.now()}`,
    status: 'completed',
    title: `${cleanTitle}: Material generado`,
    outputType,
    materials: Object.keys(content).filter((key) => content[key]),
    pendingMaterials: [],
    createdAt: now,
    updatedAt: now,
    startedAt: now,
    finishedAt: now,
    audio: { available: false, mimeType: null, sizeBytes: null, expiresAt: null },
    error: null,
    source: {
      originType: metadata?.originType ?? 'file',
      originalName,
      mimeType: file?.type || null,
      sizeBytes: file?.size ?? null,
      originalSizeBytes: metadata?.originalSize ?? null,
      durationSec: metadata?.durationSec ?? null,
    },
    content,
  }
}
