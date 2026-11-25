import { Loader2, SearchX } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { GenerationProgressCard } from '@/features/home/components/GenerationProgressCard'
import { GenerationErrorCard } from '@/features/home/components/GenerationErrorCard'
import { isActiveStatus } from '../mappers/review.mapper'

const PANEL = 'bg-surface/60 border border-border rounded-2xl p-5 sm:p-8 shadow-2xl backdrop-blur-sm'

/**
 * Estados de carga, no encontrado, en curso y fallido de un trabajo, compartidos por la página de
 * resultado y la del apunte. Se usa solo mientras el contenido del trabajo no se puede mostrar.
 *
 * @param {object} props
 * @param {ReturnType<typeof import('../hooks/useGenerationJob').useGenerationJob>} props.state
 * @param {string} [props.progressTitle]
 */
export function JobStatusPanel({ state, progressTitle }) {
  const navigate = useNavigate()
  const { job, isLoading, notFound, loadError, pendingAction, actionError } = state

  // Cargando, o ya terminó pero todavía no llega su contenido
  if (isLoading || job?.status === 'completed') {
    return (
      <div className={`${PANEL} flex items-center justify-center gap-2 text-sm text-text-muted`} role="status">
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
        Cargando material…
      </div>
    )
  }

  if (!job) {
    return (
      <div className={`${PANEL} flex flex-col items-center text-center`}>
        <SearchX className="w-8 h-8 text-text-muted mb-3" aria-hidden="true" />
        <h1 className="text-base font-semibold text-text-h">
          {notFound ? 'No encontramos este material' : 'No pudimos cargar este material'}
        </h1>
        <p className="text-xs text-text-muted mt-1 max-w-sm">
          {notFound
            ? 'Puede que haya vencido: el servidor conserva los materiales por un tiempo limitado.'
            : loadError?.message}
        </p>
        <Link to="/" className="mt-4 text-xs font-semibold text-accent hover:text-accent-hover">
          Generar un material nuevo
        </Link>
      </div>
    )
  }

  if (isActiveStatus(job.status)) {
    return (
      <div className={PANEL}>
        <GenerationProgressCard
          job={job}
          title={progressTitle}
          onCancel={pendingAction ? undefined : state.cancel}
          actionError={actionError}
        />
      </div>
    )
  }

  if (job.status === 'failed' || job.status === 'cancelled') {
    return (
      <div className={PANEL}>
        <GenerationErrorCard
          job={job}
          onRetry={state.retry}
          onDismiss={() => navigate('/')}
          isRetrying={pendingAction === 'retry'}
          actionError={actionError}
        />
      </div>
    )
  }

  return null
}
