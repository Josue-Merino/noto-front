import { getOutputTypeLabel } from '@/features/home/constants/outputTypes'

const VIDEO_EXTENSIONS = ['mp4', 'mov', 'm4v', 'mkv']

/**
 * @param {string | null | undefined} name
 * @returns {string} Extensión en minúsculas sin el punto ('' si no tiene).
 */
function getExtension(name) {
  const match = name?.match(/\.([a-z0-9]+)$/i)
  return match ? match[1].toLowerCase() : ''
}

/**
 * @param {number | null | undefined} seconds
 * @returns {string}
 */
export function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '—'
  const totalMinutes = Math.max(1, Math.round(seconds / 60))
  if (totalMinutes < 60) return `${totalMinutes} min`
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return minutes ? `${hours} h ${minutes} min` : `${hours} h`
}

/**
 * @param {string} iso
 * @param {Date} [now]
 * @returns {string} "Hoy, 18:30" o "24 nov 2026, 18:30".
 */
export function formatDateText(iso, now = new Date()) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  const time = date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
  if (date.toDateString() === now.toDateString()) return `Hoy, ${time}`
  return `${date.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}, ${time}`
}

/**
 * Texto corto para la tarjeta: el resumen de las notas o el conteo de lo generado.
 * @param {{ notes?: object | null, flashcards?: object | null, quiz?: object | null }} content
 */
function buildDescription(content) {
  if (content?.notes?.summary) return content.notes.summary

  const parts = []
  if (content?.flashcards) parts.push(`${content.flashcards.cards.length} flashcards`)
  if (content?.quiz) parts.push(`${content.quiz.questions.length} preguntas de opción múltiple`)
  return parts.length ? `${parts.join(' y ')} generadas a partir de la clase.` : ''
}

/**
 * Convierte el material de estudio del backend (POST /generation/create) al modelo de vista
 * que usan ReviewCard, HistoryPage, SidebarRecents y ReviewDetailPage.
 * @param {object} dto - `data` de la respuesta del backend.
 * @returns {object}
 */
export function toReviewViewModel(dto) {
  const source = dto.source ?? {}
  const isRecording = source.originType === 'recording'
  const extension = getExtension(source.originalName)
  const isVideo = VIDEO_EXTENSIONS.includes(extension) || Boolean(source.mimeType?.startsWith('video/'))

  return {
    id: dto.id,
    title: dto.title,
    // Ícono del sidebar
    type: isVideo ? 'video' : 'audio',
    originType: isRecording ? 'recording' : 'file',
    fileType: isRecording ? 'audio' : extension || 'audio',
    badgeText: isRecording ? 'Grabación de audio' : extension ? `Archivo ${extension.toUpperCase()}` : 'Archivo',
    originLabel: isRecording ? 'Captura en vivo' : 'Archivo origen:',
    description: buildDescription(dto.content),
    // Las tarjetas y el buscador trabajan con la etiqueta; el id queda para la lógica
    outputType: getOutputTypeLabel(dto.outputType),
    outputTypeId: dto.outputType,
    duration: formatDuration(source.durationSec),
    dateText: formatDateText(dto.createdAt),
    date: dto.createdAt,
    buttonText: 'Ver repaso',
    content: dto.content,
  }
}
