import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react'
import { useReviewsStore } from '@/features/home/store/reviews.store'
import { HistoryToolbar } from '../components/HistoryToolbar'
import { ReviewCard } from '../components/ReviewCard'
import { Button } from '@/components/ui/Button'

/**
 * Página del Historial de Repasos con buscador, filtrado por origen, ordenamiento,
 * grilla responsiva de tarjetas y soporte de renombrado en línea.
 */
export function HistoryPage() {
  const reviews = useReviewsStore((s) => s.reviews)
  const renameReview = useReviewsStore((s) => s.renameReview)

  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'file' | 'recording'
  const [sortBy, setSortBy] = useState('recent') // 'recent' | 'oldest' | 'alpha'

  // Conteos para las píldoras de filtrado
  const counts = useMemo(() => {
    const fileCount = reviews.filter((r) => r.originType === 'file').length
    const recordingCount = reviews.filter((r) => r.originType === 'recording').length
    return {
      all: reviews.length,
      file: fileCount,
      recording: recordingCount,
    }
  }, [reviews])

  // Filtrado y ordenamiento de materiales
  const filteredReviews = useMemo(() => {
    let result = [...reviews]

    // 1. Filtrado por pestaña de origen
    if (activeFilter === 'file') {
      result = result.filter((r) => r.originType === 'file')
    } else if (activeFilter === 'recording') {
      result = result.filter((r) => r.originType === 'recording')
    }

    // 2. Filtrado por texto de búsqueda
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.outputType?.toLowerCase().includes(q)
      )
    }

    // 3. Ordenamiento
    if (sortBy === 'oldest') {
      result.reverse()
    } else if (sortBy === 'alpha') {
      result.sort((a, b) => a.title.localeCompare(b.title))
    }

    return result
  }, [reviews, activeFilter, searchQuery, sortBy])

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fadeIn text-left">
      {/* Cabecera del Historial */}
      <header className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-h">
          Historial de repasos
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-2xl">
          Accede a tus materiales generados, organiza tus sesiones de estudio o renombra tus notas en cualquier momento.
        </p>
      </header>

      {/* Barra de herramientas: Buscador, filtros y ordenamiento */}
      <HistoryToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={counts}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Grilla responsiva de tarjetas de repaso */}
      {filteredReviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl bg-surface/50 border border-border text-center my-6">
          <div className="w-12 h-12 rounded-2xl bg-accent-muted text-accent flex items-center justify-center mb-3">
            <Inbox className="w-6 h-6" aria-hidden="true" />
          </div>
          <h2 className="text-sm font-semibold text-text-h mb-1">
            No se encontraron repasos
          </h2>
          <p className="text-xs text-text-muted mb-4 max-w-sm">
            {searchQuery
              ? `No hay materiales que coincidan con "${searchQuery}".`
              : 'Aún no has generado materiales con este filtro.'}
          </p>
          <Link to="/">
            <Button variant="primary" size="sm">
              Crear nuevo repaso
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onRename={renameReview}
            />
          ))}
        </div>
      )}

      {/* Pie de página con conteo y paginación */}
      <div className="mt-8 pt-5 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted select-none">
        <span>
          Mostrando {filteredReviews.length} de {reviews.length} materiales generados
        </span>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-medium text-text-muted">
            Página 1 de 1
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled
              aria-label="Página anterior"
              className="p-1.5 rounded-lg bg-surface border border-border/60 text-text-muted opacity-40 cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled
              aria-label="Página siguiente"
              className="p-1.5 rounded-lg bg-surface border border-border/60 text-text-muted opacity-40 cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
