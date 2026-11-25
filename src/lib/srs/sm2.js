/**
 * Repaso espaciado SM-2 (la misma fórmula que noto-back, `src/modules/study/study.mappers.js`).
 * El backend es quien guarda el estado; aquí solo se usa para mostrar el intervalo de cada botón.
 */

const DAY_MS = 24 * 60 * 60 * 1000

/** Botones de calificación, en orden. */
export const RATINGS = Object.freeze([
  { id: 'again', label: 'Otra vez', quality: 1 },
  { id: 'hard', label: 'Difícil', quality: 3 },
  { id: 'good', label: 'Bien', quality: 4 },
  { id: 'easy', label: 'Fácil', quality: 5 },
])

/**
 * @param {{ easeFactor: number, intervalDays: number, repetitions: number } | null | undefined} previous
 * @param {'again' | 'hard' | 'good' | 'easy'} rating
 * @param {Date} [now]
 */
export function nextReviewState(previous, rating, now = new Date()) {
  const quality = RATINGS.find((r) => r.id === rating).quality
  let easeFactor = previous?.easeFactor ?? 2.5
  let repetitions = previous?.repetitions ?? 0
  let intervalDays = previous?.intervalDays ?? 0

  if (quality < 3) {
    repetitions = 0
    intervalDays = 0
  } else {
    repetitions += 1
    if (repetitions === 1) intervalDays = 1
    else if (repetitions === 2) intervalDays = 6
    else intervalDays = Math.max(1, Math.round(intervalDays * easeFactor))
  }
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))

  return {
    easeFactor: Math.round(easeFactor * 100) / 100,
    intervalDays,
    repetitions,
    nextReviewAt: new Date(now.getTime() + intervalDays * DAY_MS).toISOString(),
    lastReviewedAt: now.toISOString(),
  }
}

/**
 * Una tarjeta está pendiente si nunca se repasó o ya llegó su fecha.
 * @param {{ review?: { nextReviewAt?: string | null } | null }} card
 * @param {Date} [now]
 */
export const isDue = (card, now = new Date()) =>
  !card.review?.nextReviewAt || new Date(card.review.nextReviewAt).getTime() <= now.getTime()

/**
 * "Ahora", "1 día", "6 días", "2 meses".
 * @param {number} days
 */
export function formatInterval(days) {
  if (days <= 0) return 'Ahora'
  if (days < 30) return `${days} ${days === 1 ? 'día' : 'días'}`
  const months = Math.round(days / 30)
  return `${months} ${months === 1 ? 'mes' : 'meses'}`
}

/**
 * "Pendiente", "Mañana", "En 6 días".
 * @param {string | null | undefined} iso
 * @param {Date} [now]
 */
export function formatNextReview(iso, now = new Date()) {
  if (!iso) return 'Pendiente'
  const days = Math.ceil((new Date(iso).getTime() - now.getTime()) / DAY_MS)
  if (days <= 0) return 'Pendiente'
  if (days === 1) return 'Mañana'
  return `En ${formatInterval(days).toLowerCase()}`
}
