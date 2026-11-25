import { useParams, Link } from 'react-router-dom'
import { Sparkles, ArrowLeft, BookOpen, CheckSquare, Layers } from 'lucide-react'
import { useReviewsStore } from '@/features/home/store/reviews.store'

export function ReviewDetailPage() {
  const { id } = useParams()
  const reviews = useReviewsStore((s) => s.reviews)
  const review = reviews.find((r) => r.id === id) || {
    id,
    title: 'Material de repaso generado',
    type: 'audio',
    date: 'Hoy',
    outputType: 'full',
  }

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
        {/* Cabecera del repaso */}
        <div className="flex items-start justify-between gap-4 mb-6 pb-6 border-b border-border/60">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-accent-muted border border-accent-border text-accent mb-3">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Material generado con éxito</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-h">
              {review.title}
            </h1>
            <p className="text-xs text-text-muted mt-1">
              Fecha: {review.date} · Formato: {review.outputType}
            </p>
          </div>
        </div>

        {/* Secciones de estudio mock */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-4 rounded-xl bg-bg-darker border border-border text-left">
            <Layers className="w-5 h-5 text-accent mb-2" aria-hidden="true" />
            <h2 className="text-xs font-semibold text-text-h">Flashcards</h2>
            <p className="text-[11px] text-text-muted mt-1">12 fichas interactivas listas</p>
          </div>
          <div className="p-4 rounded-xl bg-bg-darker border border-border text-left">
            <CheckSquare className="w-5 h-5 text-accent mb-2" aria-hidden="true" />
            <h2 className="text-xs font-semibold text-text-h">Cuestionario</h2>
            <p className="text-[11px] text-text-muted mt-1">10 preguntas de autoevaluación</p>
          </div>
          <div className="p-4 rounded-xl bg-bg-darker border border-border text-left">
            <BookOpen className="w-5 h-5 text-accent mb-2" aria-hidden="true" />
            <h2 className="text-xs font-semibold text-text-h">Síntesis y notas</h2>
            <p className="text-[11px] text-text-muted mt-1">Resumen estructurado con IA</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-bg-darker/60 border border-border text-center">
          <p className="text-xs sm:text-sm text-text-muted">
            Vista de estudio interactiva próximamente. Tu material ha quedado registrado en tu barra lateral.
          </p>
        </div>
      </div>
    </div>
  )
}
