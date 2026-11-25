import { useState } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * Mazo de flashcards: una tarjeta a la vez, se voltea al hacer clic para ver la respuesta.
 * @param {object} props
 * @param {{ cards: Array<{ front: string, back: string }> }} props.flashcards
 */
export function FlashcardsView({ flashcards }) {
  const cards = flashcards.cards ?? []
  const [index, setIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  if (cards.length === 0) {
    return <p className="text-sm text-text-muted">No se generaron flashcards para esta clase.</p>
  }

  const card = cards[index]
  const goTo = (next) => {
    setIndex((next + cards.length) % cards.length)
    setIsFlipped(false)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <span className="text-xs text-text-muted" aria-live="polite">
        Tarjeta {index + 1} de {cards.length}
      </span>

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
        </span>
      </button>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          aria-label="Tarjeta anterior"
          className="p-2 rounded-xl bg-surface border border-border hover:bg-surface-hover text-text-h transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          aria-label="Tarjeta siguiente"
          className="p-2 rounded-xl bg-surface border border-border hover:bg-surface-hover text-text-h transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
