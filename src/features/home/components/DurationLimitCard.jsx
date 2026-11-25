import { AlertCircle, Trash2, Upload } from 'lucide-react'
import { AUDIO_CONFIG } from '@/lib/audio/audioConfig'
import { formatDuration } from '@/features/reviews/mappers/review.mapper'
import { FileSummary } from './FileSummary'

/**
 * Archivo rechazado por superar la duración máxima (pantalla Home 14).
 * @param {object} props
 * @param {{ name: string, extension: string, sizeLabel: string, durationSec: number }} props.limit
 * @param {() => void} props.onChooseAnother - Abre el selector de archivos.
 * @param {() => void} props.onDismiss - Quita la tarjeta.
 */
export function DurationLimitCard({ limit, onChooseAnother, onDismiss }) {
  const meta = [limit.sizeLabel, limit.durationSec ? formatDuration(limit.durationSec) : null]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="flex flex-col gap-4">
      <FileSummary
        name={limit.name}
        extension={limit.extension}
        meta={meta}
        tone="error"
        actions={
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Quitar archivo"
            title="Quitar archivo"
            className="p-2 rounded-lg text-text-muted hover:text-text-h hover:bg-surface-hover transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-border"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        }
      >
        <div role="alert" className="mt-4 flex items-start gap-3 rounded-xl border border-error/40 bg-error-bg/50 p-4">
          <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-sm">
            <p className="font-semibold text-text-h">El audio supera el límite de 2 horas</p>
            <p className="mt-1 text-text text-xs sm:text-sm leading-relaxed">
              Recórtalo o divide la clase en dos archivos. Formatos: MP3, WAV, MP4 o MOV (máx.{' '}
              {AUDIO_CONFIG.MAX_FILE_SIZE_LABEL}).
            </p>
          </div>
        </div>
      </FileSummary>

      <button
        type="button"
        onClick={onChooseAnother}
        className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl border border-border bg-bg-darker text-sm font-semibold text-text-h hover:border-border-light hover:bg-surface-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-border"
      >
        <Upload className="w-4 h-4" aria-hidden="true" />
        Elegir otro archivo
      </button>
    </div>
  )
}
