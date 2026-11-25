import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Sparkles, ArrowLeft, BookOpen, CheckSquare, Layers, SearchX } from 'lucide-react'
import { useReviewsStore } from '@/features/home/store/reviews.store'
import { cn } from '@/lib/cn'
import { NotesView } from '../components/NotesView'
import { FlashcardsView } from '../components/FlashcardsView'
import { QuizView } from '../components/QuizView'

// Secciones de estudio en el orden en que se muestran las pestañas
const SECTIONS = [
  { key: 'notes', label: 'Síntesis y notas', icon: BookOpen, View: NotesView, prop: 'notes' },
  { key: 'flashcards', label: 'Flashcards', icon: Layers, View: FlashcardsView, prop: 'flashcards' },
  { key: 'quiz', label: 'Cuestionario', icon: CheckSquare, View: QuizView, prop: 'quiz' },
]

/**
 * Tarjetas de resumen para los repasos de ejemplo que no traen contenido generado.
 */
function PlaceholderSections() {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {SECTIONS.map(({ key, label, icon: Icon }) => (
          <div key={key} className="p-4 rounded-xl bg-bg-darker border border-border text-left">
            <Icon className="w-5 h-5 text-accent mb-2" aria-hidden="true" />
            <h2 className="text-xs font-semibold text-text-h">{label}</h2>
            <p className="text-[11px] text-text-muted mt-1">Repaso de ejemplo</p>
          </div>
        ))}
      </div>
      <div className="p-4 rounded-xl bg-bg-darker/60 border border-border text-center">
        <p className="text-xs sm:text-sm text-text-muted">
          Este es un repaso de ejemplo. Genera un material desde el inicio para estudiarlo aquí.
        </p>
      </div>
    </>
  )
}

/**
 * Pestañas con las secciones generadas (solo las que vinieron en el contenido).
 * @param {object} props
 * @param {{ notes: object | null, flashcards: object | null, quiz: object | null }} props.content
 */
function StudySections({ content }) {
  const available = SECTIONS.filter((section) => content[section.key])
  const [activeKey, setActiveKey] = useState(available[0]?.key)
  const active = available.find((section) => section.key === activeKey) ?? available[0]

  if (!active) {
    return <p className="text-sm text-text-muted">No se generó contenido para este repaso.</p>
  }

  const { View } = active
  return (
    <>
      {available.length > 1 && (
        <div role="tablist" aria-label="Secciones del material" className="flex flex-wrap gap-2 mb-6">
          {available.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              id={`tab-${key}`}
              aria-selected={key === active.key}
              aria-controls={`panel-${key}`}
              onClick={() => setActiveKey(key)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors',
                key === active.key
                  ? 'bg-accent-muted border-accent-border text-accent'
                  : 'bg-bg-darker border-border text-text-muted hover:text-text-h hover:border-border-light'
              )}
            >
              <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      )}

      <section role="tabpanel" id={`panel-${active.key}`} aria-labelledby={`tab-${active.key}`}>
        <View {...{ [active.prop]: content[active.key] }} />
      </section>
    </>
  )
}

export function ReviewDetailPage() {
  const { id } = useParams()
  const review = useReviewsStore((s) => s.reviews.find((r) => r.id === id))

  return (
    <div className="flex flex-col max-w-3xl mx-auto w-full py-4">
      {/* Botón de regreso */}
      <div className="mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-h transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Volver al inicio</span>
        </Link>
      </div>

      <div className="bg-surface/60 border border-border rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
        {!review ? (
          // Sin base de datos, los materiales generados solo viven en memoria hasta recargar
          <div className="flex flex-col items-center text-center py-8">
            <SearchX className="w-8 h-8 text-text-muted mb-3" aria-hidden="true" />
            <h1 className="text-base font-semibold text-text-h">No encontramos este material</h1>
            <p className="text-xs text-text-muted mt-1 max-w-sm">
              Por ahora los materiales generados se guardan solo durante la sesión: al recargar la página se pierden.
            </p>
            <Link to="/" className="mt-4 text-xs font-semibold text-accent hover:text-accent-hover">
              Generar un material nuevo
            </Link>
          </div>
        ) : (
          <>
            {/* Cabecera del repaso */}
            <div className="flex items-start justify-between gap-4 mb-6 pb-6 border-b border-border/60">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-accent-muted border border-accent-border text-accent mb-3">
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Material generado con éxito</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-text-h">{review.title}</h1>
                <p className="text-xs text-text-muted mt-1">
                  {review.dateText || review.date} · Formato: {review.outputType}
                  {review.duration && review.duration !== '—' ? ` · ${review.duration}` : ''}
                </p>
              </div>
            </div>

            {review.content ? <StudySections key={review.id} content={review.content} /> : <PlaceholderSections />}
          </>
        )}
      </div>
    </div>
  )
}
