import { useState } from 'react'
import { CalendarClock, CheckCircle2, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/cn'
import { RATINGS, formatInterval, formatNextReview, isDue, nextReviewState } from '@/lib/srs/sm2'
import { studyService } from '../services/study.service'

const RATING_STYLES = {
  again: 'border-error/40 hover:bg-error-bg text-error',
  hard: 'border-border hover:bg-surface-hover text-text-h',
  good: 'border-success/40 hover:bg-success-bg text-success',
  easy: 'border-accent-border hover:bg-accent-muted text-accent',
}

/**
 * Mazo de flashcards: una tarjeta a la vez, se voltea al hacer clic para ver la respuesta.
 * Si las tarjetas están guardadas (tienen `id`), al voltear se califican con repaso espaciado
 * (SM-2: Otra vez / Difícil / Bien / Fácil) y se puede repasar solo lo pendiente.
 * @param {object} props
 * @param {{ cards: Array<{ id?: string, front: string, back: string, review?: object | null }> }} props.flashcards
 * @param {(cardId: string, review: object) => void} [props.onReviewed] - Estado nuevo ya guardado.
 */
export function FlashcardsView({ flashcards, onReviewed }) {
  const cards = flashcards.cards ?? []
  const [index, setIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [onlyDue, setOnlyDue] = useState(false)
  // Calificaciones de esta sesión (se muestran al instante, antes de que responda el backend)
  const [localReviews, setLocalReviews] = useState({})
  const [savingId, setSavingId] = useState(null)
  const [error, setError] = useState(null)

  if (cards.length === 0) {
    return <p className="text-sm text-text-muted">No se generaron flashcards para esta clase.</p>
  }

  const canReview = cards.some((c) => c.id)
  const withReview = cards.map((c) => ({ ...c, review: (c.id && localReviews[c.id]) || c.review || null }))
  const dueCount = withReview.filter((c) => isDue(c)).length
  const visible = onlyDue ? withReview.filter((c) => isDue(c)) : withReview
  const current = Math.min(index, Math.max(visible.length - 1, 0))
  const card = visible[current]

  const goTo = (next) => {
    if (visible.length === 0) return
    setIndex((next + visible.length) % visible.length)
    setIsFlipped(false)
  }

  const rate = async (rating) => {
    if (!card?.id || savingId) return
    const previous = card.review
    setError(null)
    setSavingId(card.id)
    setLocalReviews((prev) => ({ ...prev, [card.id]: nextReviewState(previous, rating) }))
    // En "solo pendientes" la tarjeta sale de la lista: el mismo índice ya es la siguiente
    if (!onlyDue || rating === 'again') goTo(current + 1)
    else setIsFlipped(false)

    try {
      const { review } = await studyService.reviewFlashcard(card.id, rating)
      setLocalReviews((prev) => ({ ...prev, [card.id]: review }))
      onReviewed?.(card.id, review)
    } catch (err) {
      setLocalReviews((prev) => ({ ...prev, [card.id]: previous }))
      setError(err.message || 'No se pudo guardar el repaso. Inténtalo de nuevo.')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-text-muted">
        <span aria-live="polite">
          {visible.length ? `Tarjeta ${current + 1} de ${visible.length}` : 'Sin tarjetas pendientes'}
        </span>
        {canReview && (
          <>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <CalendarClock className="w-3.5 h-3.5" aria-hidden="true" />
              Pendientes hoy: <span className="font-semibold text-text-h">{dueCount}</span>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={onlyDue}
              onClick={() => {
                setOnlyDue((v) => !v)
                setIndex(0)
                setIsFlipped(false)
              }}
              className={cn(
                'px-2.5 py-1 rounded-lg border transition-colors',
                onlyDue ? 'border-accent-border bg-accent-muted text-accent' : 'border-border hover:bg-surface-hover'
              )}
            >
              Solo pendientes
            </button>
          </>
        )}
      </div>

      {card ? (
        <button
          type="button"
          onClick={() => setIsFlipped((v) => !v)}
          aria-pressed={isFlipped}
          aria-label={isFlipped ? 'Ver la pregunta' : 'Ver la respuesta'}
          className={cn(
            'w-full min-h-[200px] sm:min-h-[240px] p-6 sm:p-8 rounded-2xl border text-center transition-colors',
            'flex flex-col items-center justify-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-border',
            isFlipped
              ? 'bg-accent-muted/50 border-accent-border'
              : 'bg-bg-darker border-border hover:border-border-light'
          )}
        >
          <span className={cn('text-[10px] font-semibold uppercase tracking-wider', isFlipped ? 'text-accent' : 'text-text-muted')}>
            {isFlipped ? 'Respuesta' : 'Pregunta'}
          </span>
          <span className="text-base sm:text-lg font-medium text-text-h leading-relaxed">
            {isFlipped ? card.back : card.front}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-text-muted mt-2">
            <RotateCcw className="w-3 h-3" aria-hidden="true" />
            Toca para voltear
            {card.id && card.review && <> · Próximo repaso: {formatNextReview(card.review.nextReviewAt).toLowerCase()}</>}
          </span>
        </button>
      ) : (
        <div className="w-full min-h-[200px] p-6 rounded-2xl border border-success/40 bg-success-bg flex flex-col items-center justify-center gap-2 text-center">
          <CheckCircle2 className="w-6 h-6 text-success" aria-hidden="true" />
          <p className="font-semibold text-text-h">¡Estás al día!</p>
          <p className="text-sm text-text">No hay tarjetas pendientes. Desactiva "Solo pendientes" para repasar todo el mazo.</p>
        </div>
      )}

      {card?.id && isFlipped && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full" role="group" aria-label="¿Qué tan bien la recordaste?">
          {RATINGS.map((rating) => (
            <button
              key={rating.id}
              type="button"
              disabled={Boolean(savingId)}
              onClick={() => rate(rating.id)}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl border bg-surface text-sm font-medium transition-colors disabled:opacity-60',
                RATING_STYLES[rating.id]
              )}
            >
              {rating.label}
              <span className="text-[11px] font-normal text-text-muted">
                {formatInterval(nextReviewState(card.review, rating.id).intervalDays)}
              </span>
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="text-xs text-error" role="alert">
          {error}
        </p>
      )}

      {card && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => goTo(current - 1)}
            aria-label="Tarjeta anterior"
            className="p-2 rounded-xl bg-surface border border-border hover:bg-surface-hover text-text-h transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => goTo(current + 1)}
            aria-label="Tarjeta siguiente"
            className="p-2 rounded-xl bg-surface border border-border hover:bg-surface-hover text-text-h transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
