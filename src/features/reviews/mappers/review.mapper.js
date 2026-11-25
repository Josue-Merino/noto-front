import { getOutputTypeLabel } from '@/features/home/constants/outputTypes'

const VIDEO_EXTENSIONS = ['mp4', 'mov', 'm4v', 'mkv']

/** Estados en los que el trabajo todavía se está procesando en el backend. */
export const ACTIVE_STATUSES = ['queued', 'preparing', 'processing']

/**
 * @param {string | undefined} status
 * @returns {boolean}
 */
export const isActiveStatus = (status) => ACTIVE_STATUSES.includes(status)

/**
 * Ruta a la que lleva un repaso: el apunte si ya terminó; la pantalla de progreso/resultado si no.
 * @param {{ id: string, status?: string, content?: object | null }} review
 */
export function reviewPath(review) {
  const hasContent = review.content && Object.values(review.content).some(Boolean)
  return review.status && review.status !== 'completed' && !hasContent
    ? `/generation/${review.id}`
    : `/reviews/${review.id}`
}

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
 * La lista del backend no trae el contenido (solo conteos), así que se usan `counts` si no hay contenido.
 * @param {{ notes?: object | null, flashcards?: object | null, quiz?: object | null } | null} content
 * @param {{ blocks?: number, flashcards?: number, questions?: number } | undefined} counts
 */
function buildDescription(content, counts) {
  if (content?.notes?.summary) return content.notes.summary

  const flashcards = content ? (content.flashcards?.cards.length ?? 0) : (counts?.flashcards ?? 0)
  const questions = content ? (content.quiz?.questions.length ?? 0) : (counts?.questions ?? 0)
  const parts = []
  if (!content && counts?.blocks) parts.push('Apunte')
  if (flashcards) parts.push(`${flashcards} flashcards`)
  if (questions) parts.push(`${questions} preguntas de opción múltiple`)
  return parts.length ? `${parts.join(', ')} generados a partir de la clase.` : ''
}

/**
 * Convierte un trabajo de generación del backend (GET /generation/:id) al modelo de vista
 * que usan ReviewCard, HistoryPage, SidebarRecents, GenerationResultPage y ReviewDetailPage.
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
    description: buildDescription(dto.content, dto.counts),
    // Las tarjetas y el buscador trabajan con la etiqueta; el id queda para la lógica
    outputType: getOutputTypeLabel(dto.outputType),
    outputTypeId: dto.outputType,
    duration: formatDuration(source.durationSec),
    dateText: formatDateText(dto.createdAt),
    date: dto.createdAt,
    buttonText: dto.status === 'completed' || !dto.status ? 'Ver repaso' : 'Ver estado',
    content: dto.content,
    // Estado del trabajo en el backend
    status: dto.status ?? 'completed',
    materials: dto.materials ?? [],
    counts: dto.counts ?? null,
    pendingMaterials: dto.pendingMaterials ?? [],
    error: dto.error ?? null,
    audio: dto.audio ?? { available: false },
    source,
    durationSec: source.durationSec ?? null,
    startedAt: dto.startedAt ?? null,
    updatedAt: dto.updatedAt ?? null,
    finishedAt: dto.finishedAt ?? null,
  }
}
