/**
 * Pasos visibles de una generación (pantallas Home 06-09 y 13).
 *
 * El backend solo informa etapas gruesas (`queued` → `preparing` → `processing` → fin) porque el
 * microservicio de IA responde todo junto y no reporta avance. Las sub-etapas de `processing`
 * (transcripción, apunte, flashcards, cuestionario) se ESTIMAN con el tiempo transcurrido frente a
 * una duración esperada, y nunca pasan del 95 % hasta que el backend confirma `completed`.
 */

/** Segundos fijos de la llamada a la IA más una fracción de la duración del audio. */
const BASE_SECONDS = 20
const SECONDS_PER_AUDIO_SECOND = 0.15
const MAX_ESTIMATED_PROGRESS = 0.95
/** Peso de la transcripción dentro de `processing`; el resto se reparte entre los materiales. */
const TRANSCRIPTION_WEIGHT = 0.5

const MATERIAL_STEPS = [
  { key: 'notes', label: 'Estructurando el apunte en Markdown' },
  { key: 'flashcards', label: 'Generando flashcards' },
  { key: 'quiz', label: 'Generando cuestionario' },
]

/**
 * @typedef {'done' | 'active' | 'pending' | 'failed'} StepState
 * @typedef {{ key: string, label: string, state: StepState, detail?: string }} GenerationStep
 */

/**
 * Tiempo estimado (s) que tarda la IA según la duración del audio.
 * @param {number | null | undefined} durationSec
 */
export function estimateProcessingSeconds(durationSec) {
  const seconds = Number.isFinite(durationSec) && durationSec > 0 ? durationSec : 600
  return BASE_SECONDS + seconds * SECONDS_PER_AUDIO_SECOND
}

/**
 * Texto del tiempo estimado restante ("menos de 3 minutos").
 * @param {number} remainingSec
 */
export function formatRemaining(remainingSec) {
  if (remainingSec <= 60) return 'menos de 1 minuto'
  return `menos de ${Math.ceil(remainingSec / 60)} minutos`
}

/**
 * Materiales que se están generando en esta corrida (los pendientes si se pidió "más material").
 * @param {{ materials?: string[], pendingMaterials?: string[] }} job
 */
function runMaterials(job) {
  return job.pendingMaterials?.length ? job.pendingMaterials : job.materials ?? []
}

/**
 * Índice del paso en el que falló el trabajo, según el código de error del backend.
 * 0 = preparación del audio, 1 = transcripción, 2 = primer material.
 * @param {string | undefined} code
 */
function failedStepIndex(code) {
  if (code === 'PREPARATION_FAILED' || code === 'AUDIO_TOO_LONG' || code === 'AUDIO_EXPIRED') return 0
  if (code === 'TRANSCRIPTION_FAILED' || code?.startsWith('AI_SERVICE') || code === 'AI_TIMEOUT') return 1
  return 2
}

/**
 * Calcula los pasos y el progreso global de un trabajo.
 * @param {object} job - Modelo de vista (`toReviewViewModel`).
 * @param {number} nowMs - Hora actual (para la estimación).
 * @returns {{ steps: GenerationStep[], progress: number, remainingSec: number | null }}
 */
export function buildGenerationSteps(job, nowMs = Date.now()) {
  const materialSteps = MATERIAL_STEPS.filter((s) => runMaterials(job).includes(s.key))
  const durationLabel = job.durationSec ? `${Math.max(1, Math.round(job.durationSec / 60))} min` : undefined

  const steps = [
    { key: 'received', label: 'Audio recibido y verificado', state: 'pending' },
    { key: 'transcription', label: 'Transcripción del audio', state: 'pending' },
    ...materialSteps.map((s) => ({ ...s, state: 'pending' })),
  ]
  const total = steps.length

  const mark = (doneUntil, activeIndex, activeDetail) =>
    steps.map((step, i) => {
      if (i < doneUntil) return { ...step, state: 'done', detail: i === 0 ? durationLabel : i === 1 ? 'Completada' : undefined }
      if (i === activeIndex) return { ...step, state: 'active', detail: activeDetail }
      return step
    })

  switch (job.status) {
    case 'completed':
      return { steps: mark(total, -1), progress: 1, remainingSec: 0 }

    case 'failed':
    case 'cancelled': {
      const index = job.status === 'failed' ? Math.min(failedStepIndex(job.error?.code), total - 1) : -1
      const result = mark(Math.max(index, 0), -1).map((step, i) =>
        i === index ? { ...step, state: 'failed', detail: 'Falló' } : step
      )
      return { steps: result, progress: index > 0 ? index / total : 0, remainingSec: null }
    }

    case 'processing': {
      const expected = estimateProcessingSeconds(job.durationSec)
      // Durante `processing` el backend no vuelve a escribir el trabajo: `updatedAt` marca su inicio
      const startMs = Date.parse(job.updatedAt ?? job.startedAt ?? '') || nowMs
      const elapsed = Math.max(0, (nowMs - startMs) / 1000)
      const fraction = Math.min(elapsed / expected, MAX_ESTIMATED_PROGRESS)

      // Ubica la sub-etapa activa: la transcripción pesa la mitad; los materiales, el resto
      let activeIndex = 1
      let stepFraction = fraction / TRANSCRIPTION_WEIGHT
      if (fraction >= TRANSCRIPTION_WEIGHT && materialSteps.length) {
        const perMaterial = (1 - TRANSCRIPTION_WEIGHT) / materialSteps.length
        const offset = Math.floor((fraction - TRANSCRIPTION_WEIGHT) / perMaterial)
        activeIndex = 2 + Math.min(offset, materialSteps.length - 1)
        stepFraction = (fraction - TRANSCRIPTION_WEIGHT - (activeIndex - 2) * perMaterial) / perMaterial
      }
      const percent = `${Math.min(99, Math.round(Math.min(stepFraction, 1) * 100))} %`

      return {
        steps: mark(activeIndex, activeIndex, percent),
        progress: (1 + fraction * (total - 1)) / total,
        remainingSec: Math.max(0, expected - elapsed),
      }
    }

    default:
      // queued / preparing: verificando y, si hace falta, convirtiendo el audio en el backend
      return {
        steps: mark(0, 0, job.status === 'preparing' ? 'Verificando…' : 'En cola'),
        progress: 0.04,
        remainingSec: estimateProcessingSeconds(job.durationSec),
      }
  }
}
