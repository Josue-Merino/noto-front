import { AlertCircle, RotateCw, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { FormAlert } from '@/components/ui/FormAlert'
import { formatBytes } from '@/lib/audio/audioConfig'
import { buildGenerationSteps } from '../lib/generationSteps'
import { FileSummary } from './FileSummary'
import { GenerationSteps } from './GenerationSteps'
import { formatDuration } from '@/features/reviews/mappers/review.mapper'

/**
 * Error al procesar (pantalla Home 13) o generación cancelada: el archivo se conservó en el backend
 * y se puede reintentar.
 *
 * @param {object} props
 * @param {object} props.job - Modelo de vista del trabajo fallido.
 * @param {() => void} props.onRetry
 * @param {() => void} [props.onDismiss] - Descarta y vuelve al formulario.
 * @param {boolean} [props.isRetrying]
 * @param {string | null} [props.actionError]
 */
export function GenerationErrorCard({ job, onRetry, onDismiss, isRetrying = false, actionError = null }) {
  const { steps } = buildGenerationSteps(job)
  const source = job.source ?? {}
  const name = source.originalName ?? job.title
  const extension = (name?.split('.').pop() || '').toUpperCase()
  const size = source.originalSizeBytes ?? source.sizeBytes
  const meta = [size ? formatBytes(size) : null, job.durationSec ? formatDuration(job.durationSec) : null]
    .filter(Boolean)
    .join(' · ')
  const canRetry = job.audio?.available !== false
  const isCancelled = job.status === 'cancelled'

  return (
    <div className="flex flex-col gap-5" aria-live="assertive">
      <FileSummary
        name={name}
        extension={extension}
        meta={meta}
        isVideo={job.type === 'video'}
        progress={100}
        progressLabel="Archivo cargado y verificado"
        actions={
          <>
            {canRetry && (
              <IconButton label="Reintentar" onClick={onRetry} disabled={isRetrying}>
                <RotateCw className="w-4 h-4" aria-hidden="true" />
              </IconButton>
            )}
            {onDismiss && (
              <IconButton label="Descartar y elegir otro archivo" onClick={onDismiss}>
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </IconButton>
            )}
          </>
        }
      />

      <div role="alert" className="flex items-start gap-3 rounded-xl border border-error/40 bg-error-bg/50 p-4">
        <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-sm">
          <p className="font-semibold text-text-h">
            {isCancelled ? 'Cancelaste esta generación' : 'No pudimos procesar tu audio'}
          </p>
          <p className="mt-1 text-text text-xs sm:text-sm leading-relaxed">
            {canRetry
              ? 'Tu audio original se conservó. Puedes reintentar ahora o más tarde desde el Historial.'
              : 'El audio ya no está disponible en el servidor; vuelve a subirlo para generar el material.'}
          </p>
          {job.error?.message && !isCancelled && <p className="mt-2 text-xs text-error/90">{job.error.message}</p>}
        </div>
      </div>

      <GenerationSteps steps={steps} />

      {actionError && <FormAlert message={actionError} variant="error" />}

      <div className="flex items-center justify-end gap-3">
        <Link
          to="/history"
          className="px-4 py-2 text-sm font-semibold text-text-h hover:text-accent transition-colors rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-border"
        >
          Ir al Historial
        </Link>
        {canRetry ? (
          <Button
            size="sm"
            leftIcon={RotateCw}
            rightIcon={null}
            onClick={onRetry}
            isLoading={isRetrying}
            loadingText="Reintentando…"
            className="px-5"
          >
            Reintentar
          </Button>
        ) : (
          onDismiss && (
            <Button size="sm" rightIcon={null} onClick={onDismiss} className="px-5">
              Subir de nuevo
            </Button>
          )
        )}
      </div>
    </div>
  )
}

/** Botón cuadrado solo con ícono. */
function IconButton({ label, onClick, disabled = false, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="p-2 rounded-lg text-text-muted hover:text-text-h hover:bg-surface-hover disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-border"
    >
      {children}
    </button>
  )
}
